#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import nativeAssets from '../packages/happy-app/native-assets.cjs';

const APP_PREFIX = 'packages/happy-app/';
const DEFAULT_SUPPORTED_PROFILES = Object.freeze(['personal', 'personal-store']);
const METRO_PREFIXES = [
  `${APP_PREFIX}sources/`,
  'packages/happy-wire/src/',
];

export const NATIVE_ASSET_PATHS = Object.freeze(
  Object.values(nativeAssets)
    .map((path) => `${APP_PREFIX}${path.replace(/^\.\//, '')}`)
    .sort(),
);
const NATIVE_ASSETS = new Set(NATIVE_ASSET_PATHS);

const ROOT_NATIVE_INPUTS = new Set([
  '.easignore',
  '.npmrc',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
]);

const APP_NATIVE_INPUTS = new Set([
  `${APP_PREFIX}.easignore`,
  `${APP_PREFIX}app.config.js`,
  `${APP_PREFIX}app.json`,
  `${APP_PREFIX}eas.json`,
  `${APP_PREFIX}fingerprint.config.cjs`,
  `${APP_PREFIX}fingerprint.config.js`,
  `${APP_PREFIX}native-assets.cjs`,
  `${APP_PREFIX}package.json`,
  `${APP_PREFIX}react-native.config.js`,
]);

const NATIVE_PREFIXES = [
  'patches/',
  `${APP_PREFIX}.eas/`,
  `${APP_PREFIX}android/`,
  `${APP_PREFIX}ios/`,
  `${APP_PREFIX}modules/`,
  `${APP_PREFIX}patches/`,
  `${APP_PREFIX}plugins/`,
];

const EXPLICITLY_UNRELATED_FILES = new Set([
  'AGENTS.md',
  'CODE_OF_CONDUCT.md',
  'LICENSE',
  'README.md',
  'SECURITY.md',
]);

const EXPLICITLY_UNRELATED_PREFIXES = [
  '.agents/',
  '.ai/',
  '.changeset/',
  '.github/',
  'devtools/',
  'docs/',
  'packages/codium/',
  'packages/happy-agent/',
  'packages/happy-app-logs/',
  'packages/happy-cli/',
  'packages/happy-server/',
  'packages/happy-server-self-host/',
];

function normalizePath(path) {
  // Git's -z output already uses `/` for path components. A backslash can be
  // part of a valid POSIX filename, so rewriting it could turn an unknown path
  // into an explicitly ignored or Metro-only prefix.
  return path.replace(/^\.\//, '');
}

function isNativeSensitivePath(path) {
  if (ROOT_NATIVE_INPUTS.has(path) || APP_NATIVE_INPUTS.has(path) || NATIVE_ASSETS.has(path)) {
    return true;
  }
  if (path.endsWith('/package.json')) {
    return true;
  }
  return NATIVE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isMetroPath(path) {
  if (path === `${APP_PREFIX}index.ts` || path === `${APP_PREFIX}index.js`) {
    return true;
  }
  return METRO_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isExplicitlyUnrelatedPath(path) {
  return EXPLICITLY_UNRELATED_FILES.has(path)
    || EXPLICITLY_UNRELATED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function classifyChangedPaths(paths) {
  const nativeSensitivePaths = [];
  const metroPaths = [];

  for (const rawPath of [...new Set(paths.map(normalizePath))].sort()) {
    if (isNativeSensitivePath(rawPath)) {
      nativeSensitivePaths.push(rawPath);
    } else if (isMetroPath(rawPath)) {
      metroPaths.push(rawPath);
    } else if (!isExplicitlyUnrelatedPath(rawPath)) {
      // Unknown paths fail closed. Expo/EAS may prove that they do not change
      // the native fingerprint on the slower path, while explicit documentation,
      // devtools, and non-mobile package paths remain unrelated.
      nativeSensitivePaths.push(rawPath);
    }
  }

  return { nativeSensitivePaths, metroPaths };
}

function supportedProfilesFromEnvironment() {
  const configured = process.env.HAPPY_MOBILE_ALLOWED_PROFILES;
  if (!configured) return [...DEFAULT_SUPPORTED_PROFILES];
  const profiles = configured.split(',').map((value) => value.trim()).filter(Boolean);
  if (
    profiles.length === 0
    || profiles.some((profile) => !/^[A-Za-z0-9._-]+$/.test(profile))
  ) {
    throw new Error('HAPPY_MOBILE_ALLOWED_PROFILES must be a comma-separated list of EAS profile names.');
  }
  return [...new Set(profiles)];
}

export function requireSupportedProfile(profile, supportedProfiles = supportedProfilesFromEnvironment()) {
  if (!/^[A-Za-z0-9._-]+$/.test(profile)) {
    throw new Error('mobile-plan --profile must be a non-empty EAS profile name.');
  }
  if (!supportedProfiles.includes(profile)) {
    throw new Error(
      `Unsupported mobile EAS profile: ${profile}. Supported profiles: ${supportedProfiles.join(', ')}.`,
    );
  }
}

function fingerprintHash(build) {
  return typeof build?.fingerprint === 'string'
    ? build.fingerprint
    : build?.fingerprint?.hash;
}

function artifactUrl(build) {
  return build?.artifacts?.buildUrl
    ?? build?.artifacts?.applicationArchiveUrl
    ?? null;
}

function hasAvailableArtifact(build, now) {
  if (typeof build?.id !== 'string' || build.id.trim() === '') return false;
  const url = artifactUrl(build);
  if (typeof url !== 'string' || url.trim() === '') return false;
  try {
    const parsedUrl = new URL(url);
    if (
      parsedUrl.protocol !== 'https:'
      || !parsedUrl.hostname
      || parsedUrl.username
      || parsedUrl.password
    ) return false;
  } catch {
    return false;
  }

  if (build.expirationDate == null) return true;
  if (typeof build.expirationDate !== 'string' || build.expirationDate.trim() === '') return false;
  const expiration = Date.parse(build.expirationDate);
  return Number.isFinite(expiration) && expiration > now;
}

function upperCaseString(value) {
  return typeof value === 'string' ? value.toUpperCase() : null;
}

export function selectMatchingBuild(builds, {
  platform,
  profile,
  channel,
  fingerprint,
  now = Date.now(),
}) {
  const expectedPlatform = platform.toUpperCase();
  return builds.find((build) => (
    upperCaseString(build?.status) === 'FINISHED'
    && upperCaseString(build?.platform) === expectedPlatform
    && build?.buildProfile === profile
    && build?.channel === channel
    && fingerprintHash(build) === fingerprint
    && hasAvailableArtifact(build, now)
  )) ?? null;
}

export function decidePlan({
  changedPaths,
  platform,
  profile,
  channel,
  fingerprint = null,
  builds = [],
  fingerprintError = null,
  lookupError = null,
}) {
  const classification = classifyChangedPaths(changedPaths);
  if (classification.nativeSensitivePaths.length === 0) {
    return {
      plan: 'metro-only',
      ...classification,
      fingerprint: null,
      matchingBuild: null,
      reasons: ['No native-sensitive mobile inputs changed relative to the selected base.'],
    };
  }

  if (!fingerprint) {
    return {
      plan: 'native-rebuild',
      ...classification,
      fingerprint: null,
      matchingBuild: null,
      reasons: [fingerprintError || 'The current native fingerprint is unavailable, so artifact reuse cannot be proven.'],
    };
  }

  const matchingBuild = selectMatchingBuild(builds, { platform, profile, channel, fingerprint });
  if (matchingBuild) {
    return {
      plan: 'reuse-artifact',
      ...classification,
      fingerprint,
      matchingBuild,
      reasons: ['An available EAS artifact exactly matches platform, profile, channel, and native fingerprint.'],
    };
  }

  return {
    plan: 'native-rebuild',
    ...classification,
    fingerprint,
    matchingBuild: null,
    reasons: [lookupError || 'No available EAS artifact exactly matches platform, profile, channel, and the current native fingerprint.'],
  };
}

function runGit(repo, args, { encoding = 'utf8' } = {}) {
  const result = spawnSync('git', ['-C', repo, ...args], {
    encoding,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error) {
    throw new Error(`Unable to run git: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString('utf8')
      : result.stderr;
    throw new Error((stderr || `git ${args[0]} failed`).trim());
  }
  return result.stdout;
}

function nullSeparatedPaths(value) {
  const text = Buffer.isBuffer(value) ? value.toString('utf8') : value;
  return text.split('\0').filter(Boolean).map(normalizePath);
}

export function collectGitState(repo, base) {
  const repository = resolve(repo);
  const baseCommit = runGit(repository, ['rev-parse', '--verify', '--end-of-options', `${base}^{commit}`]).trim();
  const commit = runGit(repository, ['rev-parse', 'HEAD']).trim();
  const mergeBase = runGit(repository, ['merge-base', baseCommit, commit]).trim();
  const committedPaths = nullSeparatedPaths(runGit(repository, [
    'diff', '--no-renames', '--name-only', '-z', '--diff-filter=ACDMRTUXB', baseCommit, commit,
  ], { encoding: null }));
  const stagedPaths = nullSeparatedPaths(runGit(repository, [
    'diff', '--cached', '--no-renames', '--name-only', '-z', '--diff-filter=ACDMRTUXB', 'HEAD', '--',
  ], { encoding: null }));
  const unstagedPaths = nullSeparatedPaths(runGit(repository, [
    'diff', '--no-renames', '--name-only', '-z', '--diff-filter=ACDMRTUXB', '--',
  ], { encoding: null }));
  const untrackedPaths = nullSeparatedPaths(runGit(repository, [
    'ls-files', '--others', '--exclude-standard', '-z',
  ], { encoding: null }));
  const status = runGit(repository, [
    'status', '--porcelain=v1', '-z', '--untracked-files=all',
  ], { encoding: null });
  const dirty = status.length > 0;
  // Both tracked worktree edits and an untracked recreation can disagree with
  // the index. The latter occurs when a tracked file is staged for deletion and
  // then recreated at the same path.
  const worktreeChangedPathSet = new Set([...unstagedPaths, ...untrackedPaths]);
  const indexWorktreeDivergentPaths = stagedPaths.filter((path) => worktreeChangedPathSet.has(path));

  let dirtySourceDigest = 'clean';
  if (dirty) {
    const digest = createHash('sha256');
    digest.update(status);
    digest.update(runGit(repository, ['diff', '--cached', '--binary', 'HEAD', '--'], { encoding: null }));
    digest.update(runGit(repository, ['diff', '--binary', '--'], { encoding: null }));
    for (const path of [...untrackedPaths].sort()) {
      digest.update(`\0${path}\0`);
      digest.update(runGit(repository, ['hash-object', '--no-filters', '--', path]));
    }
    dirtySourceDigest = `sha256:${digest.digest('hex')}`;
  }

  return {
    base,
    baseCommit,
    mergeBase,
    commit,
    dirty,
    dirtySourceDigest,
    changedPaths: [...new Set([
      ...committedPaths,
      ...stagedPaths,
      ...unstagedPaths,
      ...untrackedPaths,
    ])].sort(),
    stagedPaths,
    unstagedPaths,
    untrackedPaths,
    indexWorktreeDivergentPaths,
  };
}

export function parseCliArgs(argv, { supportedProfiles = supportedProfilesFromEnvironment() } = {}) {
  let platform = null;
  let profile = process.env.HAPPY_MOBILE_DEFAULT_PROFILE || 'personal';
  let base = 'dev';
  let json = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--platform':
        platform = argv[index += 1] ?? null;
        break;
      case '--profile':
        profile = argv[index += 1] ?? '';
        break;
      case '--base':
        base = argv[index += 1] ?? '';
        break;
      case '--json':
        json = true;
        break;
      default:
        throw new Error(`Unknown mobile-plan option: ${argument}`);
    }
  }

  if (!['ios', 'android'].includes(platform)) {
    throw new Error('mobile-plan requires --platform ios or android.');
  }
  requireSupportedProfile(profile, supportedProfiles);
  if (!base || /[\0\r\n]/.test(base)) {
    throw new Error('mobile-plan --base must be a non-empty Git ref.');
  }

  return { platform, profile, base, json };
}

function errorMessage(error, fallback) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim().split('\n')[0];
  }
  return fallback;
}

function summarizeBuild(build) {
  if (!build) return null;
  return {
    id: build.id ?? null,
    status: build.status ?? null,
    platform: build.platform ?? null,
    profile: build.buildProfile ?? null,
    channel: build.channel ?? null,
    fingerprint: fingerprintHash(build) ?? null,
    createdAt: build.createdAt ?? null,
    completedAt: build.completedAt ?? null,
    expirationDate: build.expirationDate ?? null,
    artifactUrl: artifactUrl(build),
  };
}

function commandParts(specification) {
  const parts = specification.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0 || parts.some((part) => !/^[A-Za-z0-9_./@:+-]+$/.test(part))) {
    throw new Error('Invalid HAPPY_MOBILE_PNPM_CMD command specification.');
  }
  return parts;
}

function conciseCommandError(result) {
  const lines = (result.stderr || result.stdout || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/eas-cli@\S+ is now available/.test(line))
    .filter((line) => !line.startsWith('To upgrade,'))
    .filter((line) => !line.startsWith('npm install -g'))
    .filter((line) => line !== 'Proceeding with outdated version.');
  return lines.at(-1) || `EAS command exited with status ${result.status}.`;
}

function runEasJson(repo, args) {
  const appDir = process.env.HAPPY_MOBILE_APP_DIR
    ? resolve(process.env.HAPPY_MOBILE_APP_DIR)
    : resolve(repo, 'packages/happy-app');
  const easVersion = process.env.HAPPY_MOBILE_EAS_CLI_VERSION || '21.7.0';
  const parts = commandParts(process.env.HAPPY_MOBILE_PNPM_CMD || 'pnpm');
  const result = spawnSync(parts[0], [
    ...parts.slice(1),
    'dlx',
    `eas-cli@${easVersion}`,
    ...args,
  ], {
    cwd: appDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      APP_ENV: process.env.HAPPY_MOBILE_APP_ENV || process.env.APP_ENV || 'personal',
      NODE_ENV: 'production',
      EXPO_NO_METRO_WORKSPACE_ROOT: '1',
    },
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error) {
    throw new Error(`Unable to run EAS CLI: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(conciseCommandError(result));
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error('EAS CLI returned invalid JSON.');
  }
}

export function generateFingerprint({ repo, platform }) {
  const value = runEasJson(repo, [
    'fingerprint:generate',
    '--platform', platform,
    '--json',
    '--non-interactive',
  ]);
  if (!value?.hash || typeof value.hash !== 'string') {
    throw new Error('EAS fingerprint output did not contain a hash.');
  }
  return value.hash;
}

export function lookupBuilds({ repo, platform, profile, channel, fingerprint }) {
  const value = runEasJson(repo, [
    'build:list',
    '--platform', platform,
    '--build-profile', profile,
    '--channel', channel,
    '--status', 'finished',
    '--fingerprint-hash', fingerprint,
    '--limit', '1',
    '--json',
    '--non-interactive',
  ]);
  if (!Array.isArray(value)) {
    throw new Error('EAS build lookup did not return a build list.');
  }
  return value;
}

export async function createMobilePlan(options, adapters = {}) {
  const {
    repo,
    platform,
    profile,
    channel,
    base,
    supportedProfiles = supportedProfilesFromEnvironment(),
  } = options;
  requireSupportedProfile(profile, supportedProfiles);
  const inspectGit = adapters.collectGitState ?? collectGitState;
  const gitState = await inspectGit(repo, base);
  const classification = classifyChangedPaths(gitState.changedPaths);
  const indexWorktreeDivergentPaths = gitState.indexWorktreeDivergentPaths ?? [];
  const divergentClassification = classifyChangedPaths(indexWorktreeDivergentPaths);
  let fingerprint = null;
  let builds = [];
  let fingerprintError = null;
  let lookupError = null;

  if (classification.nativeSensitivePaths.length > 0) {
    if (divergentClassification.nativeSensitivePaths.length > 0) {
      fingerprintError = 'Native-sensitive paths differ between the Git index and worktree, so artifact reuse cannot be proven.';
    } else {
      try {
        const generate = adapters.generateFingerprint ?? generateFingerprint;
        fingerprint = await generate({ repo, platform });
      } catch (error) {
        fingerprintError = errorMessage(error, 'Native fingerprint generation failed.');
      }
    }

    if (fingerprint) {
      try {
        const lookup = adapters.lookupBuilds ?? lookupBuilds;
        builds = await lookup({ repo, platform, profile, channel, fingerprint });
      } catch (error) {
        lookupError = errorMessage(error, 'EAS artifact lookup failed.');
      }
    }
  }

  const decision = decidePlan({
    changedPaths: gitState.changedPaths,
    platform,
    profile,
    channel,
    fingerprint,
    builds,
    fingerprintError,
    lookupError,
  });

  return {
    schemaVersion: 1,
    plan: decision.plan,
    platform,
    profile,
    channel,
    base: gitState.base,
    baseCommit: gitState.baseCommit,
    mergeBase: gitState.mergeBase,
    commit: gitState.commit,
    dirty: gitState.dirty,
    dirtySourceDigest: gitState.dirtySourceDigest,
    changedPaths: gitState.changedPaths,
    stagedPaths: gitState.stagedPaths ?? [],
    unstagedPaths: gitState.unstagedPaths ?? [],
    untrackedPaths: gitState.untrackedPaths ?? [],
    indexWorktreeDivergentPaths,
    metroPaths: decision.metroPaths,
    nativeSensitivePaths: decision.nativeSensitivePaths,
    fingerprint: decision.fingerprint,
    matchingBuild: summarizeBuild(decision.matchingBuild),
    reasons: decision.reasons,
  };
}

function shortCommit(value) {
  return value ? value.slice(0, 12) : 'n/a';
}

export function formatHumanPlan(plan) {
  const lines = [
    `Mobile build plan: ${plan.plan}`,
    `Platform: ${plan.platform}`,
    `Profile: ${plan.profile}`,
    `Channel: ${plan.channel}`,
    `Base: ${plan.base} (${shortCommit(plan.baseCommit)})`,
    `Merge base: ${shortCommit(plan.mergeBase)}`,
    `Commit: ${plan.commit}`,
    `Dirty source: ${plan.dirty ? `yes (${plan.dirtySourceDigest})` : 'no (clean)'}`,
    `Changed paths: ${plan.changedPaths.length}`,
    `Index/worktree divergent paths: ${plan.indexWorktreeDivergentPaths?.length ?? 0}`,
    `Native-sensitive paths: ${plan.nativeSensitivePaths.length}`,
  ];

  for (const path of plan.nativeSensitivePaths.slice(0, 12)) {
    lines.push(`  - ${path}`);
  }
  if (plan.nativeSensitivePaths.length > 12) {
    lines.push(`  - ... ${plan.nativeSensitivePaths.length - 12} more`);
  }

  lines.push(`Fingerprint: ${plan.fingerprint ?? 'not computed (Metro-only fast path or unavailable)'}`);
  if (plan.matchingBuild) {
    lines.push(`Matching EAS build: ${plan.matchingBuild.id ?? 'n/a'}`);
    lines.push(`Artifact URL: ${plan.matchingBuild.artifactUrl ?? 'n/a'}`);
    lines.push(`Artifact expires: ${plan.matchingBuild.expirationDate ?? 'not reported'}`);
  } else {
    lines.push('Matching EAS build: none');
  }
  for (const reason of plan.reasons) {
    lines.push(`Reason: ${reason}`);
  }
  lines.push('No build, update, submission, installation, or report was performed.');
  return `${lines.join('\n')}\n`;
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  try {
    const args = parseCliArgs(process.argv.slice(2));
    const repo = process.env.HAPPY_REPO
      ? resolve(process.env.HAPPY_REPO)
      : resolve(dirname(modulePath), '..');
    const channel = process.env.HAPPY_MOBILE_CHANNEL || 'personal';
    const plan = await createMobilePlan({
      repo,
      platform: args.platform,
      profile: args.profile,
      channel,
      base: args.base,
    });
    process.stdout.write(args.json ? `${JSON.stringify(plan, null, 2)}\n` : formatHumanPlan(plan));
  } catch (error) {
    process.stderr.write(`mobile-plan: ${errorMessage(error, 'unknown error')}\n`);
    process.exitCode = 1;
  }
}
