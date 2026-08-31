import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import nativeAssets from '../../packages/happy-app/native-assets.cjs';
import {
  NATIVE_ASSET_PATHS,
  classifyChangedPaths,
  collectGitState,
  createMobilePlan,
  decidePlan,
  formatHumanPlan,
  parseCliArgs,
  selectMatchingBuild,
} from '../mobile-plan.mjs';

test('classifies ordinary app source changes as Metro-only', () => {
  assert.deepEqual(
    classifyChangedPaths(['packages/happy-app/sources/components/AgentInput.tsx']),
    { nativeSensitivePaths: [], metroPaths: ['packages/happy-app/sources/components/AgentInput.tsx'] },
  );
});

test('treats native icon assets as native-sensitive', () => {
  assert.deepEqual(
    classifyChangedPaths(['packages/happy-app/sources/assets/images/icon.png']),
    { nativeSensitivePaths: ['packages/happy-app/sources/assets/images/icon.png'], metroPaths: [] },
  );
});

test('treats literal backslashes in POSIX Git paths as native-sensitive', () => {
  const path = String.raw`docs\postinstall.cjs`;
  assert.deepEqual(
    classifyChangedPaths([path]),
    { nativeSensitivePaths: [path], metroPaths: [] },
  );
});

test('derives native asset classification from the Expo config asset manifest', () => {
  const expectedPaths = Object.values(nativeAssets)
    .map((path) => `packages/happy-app/${path.replace(/^\.\//, '')}`)
    .sort();
  assert.deepEqual(NATIVE_ASSET_PATHS, expectedPaths);
  for (const path of expectedPaths) {
    assert.deepEqual(
      classifyChangedPaths([path]),
      { nativeSensitivePaths: [path], metroPaths: [] },
    );
  }

  const appConfig = readFileSync(
    new URL('../../packages/happy-app/app.config.js', import.meta.url),
    'utf8',
  );
  assert.match(appConfig, /require\(['"]\.\/native-assets\.cjs['"]\)/);
});

test('reuses an exact finished EAS artifact for native-sensitive changes', () => {
  const build = {
    id: 'build-1',
    status: 'FINISHED',
    platform: 'IOS',
    buildProfile: 'personal',
    channel: 'personal',
    fingerprint: { hash: 'native-hash' },
    artifacts: { buildUrl: 'https://example.invalid/app.ipa' },
  };

  const result = decidePlan({
    changedPaths: ['pnpm-lock.yaml'],
    platform: 'ios',
    profile: 'personal',
    channel: 'personal',
    fingerprint: 'native-hash',
    builds: [build],
  });

  assert.equal(result.plan, 'reuse-artifact');
  assert.equal(result.matchingBuild, build);
});

test('dirty source digest covers untracked content', () => {
  const repo = mkdtempSync(join(tmpdir(), 'happy-mobile-plan-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: repo });
    execFileSync('git', ['config', 'user.name', 'Happy Test'], { cwd: repo });
    execFileSync('git', ['config', 'user.email', 'happy@example.invalid'], { cwd: repo });
    writeFileSync(join(repo, 'README.md'), 'baseline\n');
    execFileSync('git', ['add', 'README.md'], { cwd: repo });
    execFileSync('git', ['commit', '-qm', 'baseline'], { cwd: repo });

    writeFileSync(join(repo, 'notes.txt'), 'first\n');
    const first = collectGitState(repo, 'HEAD');
    writeFileSync(join(repo, 'notes.txt'), 'second\n');
    const second = collectGitState(repo, 'HEAD');

    assert.deepEqual(first.changedPaths, ['notes.txt']);
    assert.equal(first.dirty, true);
    assert.match(first.dirtySourceDigest, /^sha256:[a-f0-9]{64}$/);
    assert.notEqual(first.dirtySourceDigest, second.dirtySourceDigest);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('collects and hashes staged content even when the worktree copy equals HEAD', () => {
  const repo = mkdtempSync(join(tmpdir(), 'happy-mobile-plan-index-'));
  const packagePath = join(repo, 'package.json');
  const baseline = '{"name":"baseline"}\n';
  try {
    execFileSync('git', ['init', '-q'], { cwd: repo });
    execFileSync('git', ['config', 'user.name', 'Happy Test'], { cwd: repo });
    execFileSync('git', ['config', 'user.email', 'happy@example.invalid'], { cwd: repo });
    writeFileSync(packagePath, baseline);
    execFileSync('git', ['add', 'package.json'], { cwd: repo });
    execFileSync('git', ['commit', '-qm', 'baseline'], { cwd: repo });

    writeFileSync(packagePath, '{"name":"staged-one"}\n');
    execFileSync('git', ['add', 'package.json'], { cwd: repo });
    writeFileSync(packagePath, baseline);
    const first = collectGitState(repo, 'HEAD');

    writeFileSync(packagePath, '{"name":"staged-two"}\n');
    execFileSync('git', ['add', 'package.json'], { cwd: repo });
    writeFileSync(packagePath, baseline);
    const second = collectGitState(repo, 'HEAD');

    assert.deepEqual(first.changedPaths, ['package.json']);
    assert.deepEqual(second.changedPaths, ['package.json']);
    assert.deepEqual(first.stagedPaths, ['package.json']);
    assert.deepEqual(first.unstagedPaths, ['package.json']);
    assert.deepEqual(first.indexWorktreeDivergentPaths, ['package.json']);
    assert.match(first.dirtySourceDigest, /^sha256:[a-f0-9]{64}$/);
    assert.notEqual(first.dirtySourceDigest, second.dirtySourceDigest);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('staged deletion plus untracked recreation skips fingerprint and artifact lookup', async () => {
  const repo = mkdtempSync(join(tmpdir(), 'happy-mobile-plan-recreated-'));
  const packagePath = join(repo, 'package.json');
  let fingerprintCalls = 0;
  let lookupCalls = 0;
  try {
    execFileSync('git', ['init', '-q'], { cwd: repo });
    execFileSync('git', ['config', 'user.name', 'Happy Test'], { cwd: repo });
    execFileSync('git', ['config', 'user.email', 'happy@example.invalid'], { cwd: repo });
    writeFileSync(packagePath, '{"name":"baseline"}\n');
    execFileSync('git', ['add', 'package.json'], { cwd: repo });
    execFileSync('git', ['commit', '-qm', 'baseline'], { cwd: repo });

    execFileSync('git', ['rm', '-q', 'package.json'], { cwd: repo });
    writeFileSync(packagePath, '{"name":"recreated"}\n');

    const plan = await createMobilePlan({
      repo,
      platform: 'ios',
      profile: 'personal',
      channel: 'personal',
      base: 'HEAD',
    }, {
      generateFingerprint: () => {
        fingerprintCalls += 1;
        return 'native-hash';
      },
      lookupBuilds: () => {
        lookupCalls += 1;
        return [{
          id: 'wrong-state-build',
          status: 'FINISHED',
          platform: 'IOS',
          buildProfile: 'personal',
          channel: 'personal',
          fingerprint: { hash: 'native-hash' },
          artifacts: { buildUrl: 'https://example.invalid/app.ipa' },
        }];
      },
    });

    assert.deepEqual(plan.stagedPaths, ['package.json']);
    assert.deepEqual(plan.unstagedPaths, []);
    assert.deepEqual(plan.untrackedPaths, ['package.json']);
    assert.deepEqual(plan.indexWorktreeDivergentPaths, ['package.json']);
    assert.equal(plan.plan, 'native-rebuild');
    assert.equal(plan.fingerprint, null);
    assert.equal(plan.matchingBuild, null);
    assert.equal(fingerprintCalls, 0);
    assert.equal(lookupCalls, 0);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('compares both trees when the selected base advanced after the worktree fork', () => {
  const repo = mkdtempSync(join(tmpdir(), 'happy-mobile-plan-base-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: repo });
    execFileSync('git', ['config', 'user.name', 'Happy Test'], { cwd: repo });
    execFileSync('git', ['config', 'user.email', 'happy@example.invalid'], { cwd: repo });
    writeFileSync(join(repo, 'README.md'), 'baseline\n');
    execFileSync('git', ['add', 'README.md'], { cwd: repo });
    execFileSync('git', ['commit', '-qm', 'baseline'], { cwd: repo });
    execFileSync('git', ['branch', 'feature'], { cwd: repo });
    execFileSync('git', ['switch', '-qc', 'dev'], { cwd: repo });
    writeFileSync(join(repo, 'package.json'), '{"private":true}\n');
    execFileSync('git', ['add', 'package.json'], { cwd: repo });
    execFileSync('git', ['commit', '-qm', 'native input on dev'], { cwd: repo });
    execFileSync('git', ['switch', '-q', 'feature'], { cwd: repo });

    const state = collectGitState(repo, 'dev');
    assert.deepEqual(state.changedPaths, ['package.json']);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('retains a native source path across committed, staged, and unstaged renames', () => {
  for (const stateKind of ['committed', 'staged', 'unstaged']) {
    const repo = mkdtempSync(join(tmpdir(), `happy-mobile-plan-rename-${stateKind}-`));
    const source = 'packages/happy-app/app.config.js';
    const destination = 'docs/app.config.js';
    try {
      execFileSync('git', ['init', '-q'], { cwd: repo });
      execFileSync('git', ['config', 'user.name', 'Happy Test'], { cwd: repo });
      execFileSync('git', ['config', 'user.email', 'happy@example.invalid'], { cwd: repo });
      mkdirSync(join(repo, 'packages/happy-app'), { recursive: true });
      mkdirSync(join(repo, 'docs'), { recursive: true });
      writeFileSync(join(repo, source), 'native config\n');
      writeFileSync(join(repo, 'docs/.keep'), 'keep\n');
      execFileSync('git', ['add', '.'], { cwd: repo });
      execFileSync('git', ['commit', '-qm', 'baseline'], { cwd: repo });
      const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();

      if (stateKind === 'unstaged') {
        renameSync(join(repo, source), join(repo, destination));
        execFileSync('git', ['add', '-N', destination], { cwd: repo });
      } else {
        execFileSync('git', ['mv', source, destination], { cwd: repo });
        if (stateKind === 'committed') {
          execFileSync('git', ['commit', '-qm', 'rename native input'], { cwd: repo });
        }
      }

      const state = collectGitState(repo, base);
      assert.ok(state.changedPaths.includes(source), `${stateKind} rename omitted its native source`);
      assert.ok(state.changedPaths.includes(destination), `${stateKind} rename omitted its destination`);
      assert.ok(
        classifyChangedPaths(state.changedPaths).nativeSensitivePaths.includes(source),
        `${stateKind} rename lost native-sensitive classification`,
      );
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  }
});

test('parses the public planner arguments and rejects unsupported platforms', () => {
  assert.deepEqual(
    parseCliArgs(['--platform', 'android', '--profile', 'personal-store', '--base', 'dev', '--json']),
    { platform: 'android', profile: 'personal-store', base: 'dev', json: true },
  );
  assert.throws(() => parseCliArgs(['--platform', 'windows']), /ios or android/);
});

test('rejects an unsupported profile before Git, fingerprint, or EAS adapters run', async () => {
  let gitCalls = 0;
  let fingerprintCalls = 0;
  let lookupCalls = 0;

  await assert.rejects(createMobilePlan({
    repo: '/fixture',
    platform: 'ios',
    profile: 'preview',
    channel: 'personal',
    base: 'dev',
    supportedProfiles: ['personal', 'personal-store'],
  }, {
    collectGitState: () => { gitCalls += 1; },
    generateFingerprint: () => { fingerprintCalls += 1; },
    lookupBuilds: () => { lookupCalls += 1; },
  }), /Unsupported mobile EAS profile: preview/);

  assert.equal(gitCalls, 0);
  assert.equal(fingerprintCalls, 0);
  assert.equal(lookupCalls, 0);
});

test('Metro-only planning skips fingerprint and EAS lookup', async () => {
  let fingerprintCalls = 0;
  let lookupCalls = 0;
  const plan = await createMobilePlan({
    repo: '/fixture',
    platform: 'ios',
    profile: 'personal',
    channel: 'personal',
    base: 'dev',
  }, {
    collectGitState: () => ({
      base: 'dev',
      baseCommit: 'a'.repeat(40),
      mergeBase: 'a'.repeat(40),
      commit: 'b'.repeat(40),
      dirty: false,
      dirtySourceDigest: 'clean',
      changedPaths: ['packages/happy-app/sources/components/AgentInput.tsx'],
    }),
    generateFingerprint: () => { fingerprintCalls += 1; },
    lookupBuilds: () => { lookupCalls += 1; },
  });

  assert.equal(plan.plan, 'metro-only');
  assert.equal(plan.platform, 'ios');
  assert.equal(plan.dirtySourceDigest, 'clean');
  assert.equal(fingerprintCalls, 0);
  assert.equal(lookupCalls, 0);
});

test('human output leads with the plan and states the no-action boundary', () => {
  const output = formatHumanPlan({
    plan: 'native-rebuild',
    platform: 'android',
    profile: 'personal',
    channel: 'personal',
    base: 'dev',
    baseCommit: 'a'.repeat(40),
    mergeBase: 'a'.repeat(40),
    commit: 'b'.repeat(40),
    dirty: true,
    dirtySourceDigest: `sha256:${'c'.repeat(64)}`,
    changedPaths: ['pnpm-lock.yaml'],
    metroPaths: [],
    nativeSensitivePaths: ['pnpm-lock.yaml'],
    fingerprint: 'native-hash',
    matchingBuild: null,
    reasons: ['No matching artifact.'],
  });

  assert.match(output, /^Mobile build plan: native-rebuild/m);
  assert.match(output, /No build, update, submission, installation, or report was performed\./);
});

test('fails closed for an unknown file under the mobile app root', () => {
  assert.deepEqual(
    classifyChangedPaths(['packages/happy-app/babel.config.js']),
    { nativeSensitivePaths: ['packages/happy-app/babel.config.js'], metroPaths: [] },
  );
});

test('fails closed for an unknown root build script while ignoring explicit documentation paths', () => {
  assert.deepEqual(
    classifyChangedPaths(['scripts/postinstall.cjs']),
    { nativeSensitivePaths: ['scripts/postinstall.cjs'], metroPaths: [] },
  );
  assert.deepEqual(
    classifyChangedPaths(['docs/operations/mobile.md']),
    { nativeSensitivePaths: [], metroPaths: [] },
  );
});

test('native index/worktree divergence skips fingerprint and artifact lookup', async () => {
  let fingerprintCalls = 0;
  let lookupCalls = 0;
  const plan = await createMobilePlan({
    repo: '/fixture',
    platform: 'ios',
    profile: 'personal',
    channel: 'personal',
    base: 'dev',
  }, {
    collectGitState: () => ({
      base: 'dev',
      baseCommit: 'a'.repeat(40),
      mergeBase: 'a'.repeat(40),
      commit: 'b'.repeat(40),
      dirty: true,
      dirtySourceDigest: `sha256:${'c'.repeat(64)}`,
      changedPaths: ['package.json'],
      stagedPaths: ['package.json'],
      unstagedPaths: ['package.json'],
      indexWorktreeDivergentPaths: ['package.json'],
    }),
    generateFingerprint: () => {
      fingerprintCalls += 1;
      return 'native-hash';
    },
    lookupBuilds: () => {
      lookupCalls += 1;
      return [];
    },
  });

  assert.equal(plan.plan, 'native-rebuild');
  assert.equal(plan.fingerprint, null);
  assert.deepEqual(plan.indexWorktreeDivergentPaths, ['package.json']);
  assert.match(plan.reasons[0], /differ between the Git index and worktree/);
  assert.equal(fingerprintCalls, 0);
  assert.equal(lookupCalls, 0);
});

test('native planning reports reusable build provenance through adapters', async () => {
  const plan = await createMobilePlan({
    repo: '/fixture',
    platform: 'android',
    profile: 'personal',
    channel: 'personal',
    base: 'dev',
  }, {
    collectGitState: () => ({
      base: 'dev',
      baseCommit: 'a'.repeat(40),
      mergeBase: 'a'.repeat(40),
      commit: 'b'.repeat(40),
      dirty: true,
      dirtySourceDigest: `sha256:${'c'.repeat(64)}`,
      changedPaths: ['pnpm-lock.yaml'],
    }),
    generateFingerprint: () => 'native-hash',
    lookupBuilds: ({ platform, profile, channel, fingerprint }) => [{
      id: 'android-build',
      status: 'FINISHED',
      platform: platform.toUpperCase(),
      buildProfile: profile,
      channel,
      fingerprint: { hash: fingerprint },
      artifacts: { buildUrl: 'https://example.invalid/app.apk' },
    }],
  });

  assert.equal(plan.plan, 'reuse-artifact');
  assert.deepEqual(plan.matchingBuild, {
    id: 'android-build',
    status: 'FINISHED',
    platform: 'ANDROID',
    profile: 'personal',
    channel: 'personal',
    fingerprint: 'native-hash',
    createdAt: null,
    completedAt: null,
    expirationDate: null,
    artifactUrl: 'https://example.invalid/app.apk',
  });
});

test('native planning fails closed when fingerprint evidence is unavailable', async () => {
  const plan = await createMobilePlan({
    repo: '/fixture',
    platform: 'ios',
    profile: 'personal',
    channel: 'personal',
    base: 'dev',
  }, {
    collectGitState: () => ({
      base: 'dev',
      baseCommit: 'a'.repeat(40),
      mergeBase: 'a'.repeat(40),
      commit: 'b'.repeat(40),
      dirty: false,
      dirtySourceDigest: 'clean',
      changedPaths: ['packages/happy-app/app.config.js'],
    }),
    generateFingerprint: () => { throw new Error('fingerprint unavailable'); },
    lookupBuilds: () => { throw new Error('lookup must not run'); },
  });

  assert.equal(plan.plan, 'native-rebuild');
  assert.equal(plan.matchingBuild, null);
  assert.deepEqual(plan.reasons, ['fingerprint unavailable']);
});

test('artifact matching rejects every mismatched compatibility dimension', () => {
  const expected = {
    platform: 'ios',
    profile: 'personal',
    channel: 'personal',
    fingerprint: 'native-hash',
  };
  const build = {
    id: 'build-1',
    status: 'FINISHED',
    platform: 'IOS',
    buildProfile: 'personal',
    channel: 'personal',
    fingerprint: { hash: 'native-hash' },
    artifacts: { buildUrl: 'https://example.invalid/app.ipa' },
  };
  assert.equal(selectMatchingBuild([build], expected), build);

  const mismatches = [
    { ...build, status: 'ERRORED' },
    { ...build, platform: 'ANDROID' },
    { ...build, buildProfile: 'personal-store' },
    { ...build, channel: 'preview' },
    { ...build, fingerprint: { hash: 'other-hash' } },
  ];

  for (const mismatch of mismatches) {
    assert.equal(selectMatchingBuild([mismatch], expected), null);
  }
});

test('artifact matching requires an identifiable, downloadable, unexpired build', () => {
  const expected = {
    platform: 'ios',
    profile: 'personal',
    channel: 'personal',
    fingerprint: 'native-hash',
    now: Date.parse('2026-08-30T12:00:00.000Z'),
  };
  const build = {
    id: 'build-1',
    status: 'FINISHED',
    platform: 'IOS',
    buildProfile: 'personal',
    channel: 'personal',
    fingerprint: { hash: 'native-hash' },
    expirationDate: '2026-09-30T12:00:00.000Z',
    artifacts: { buildUrl: 'https://example.invalid/app.ipa' },
  };

  assert.equal(selectMatchingBuild([{ ...build, id: '' }], expected), null);
  assert.equal(selectMatchingBuild([{ ...build, artifacts: {} }], expected), null);
  assert.equal(selectMatchingBuild([{
    ...build,
    artifacts: { buildUrl: 'http://example.invalid/app.ipa' },
  }], expected), null);
  assert.equal(selectMatchingBuild([{
    ...build,
    artifacts: { buildUrl: 'https://token:secret@example.invalid/app.ipa' },
  }], expected), null);
  assert.equal(selectMatchingBuild([{
    ...build,
    expirationDate: '2026-08-30T11:59:59.000Z',
  }], expected), null);
  assert.equal(selectMatchingBuild([{ ...build, expirationDate: 'not-a-date' }], expected), null);
  assert.equal(selectMatchingBuild([{ ...build, status: {} }], expected), null);
  assert.equal(selectMatchingBuild([{ ...build, platform: {} }], expected), null);
  assert.equal(selectMatchingBuild([build], expected), build);
});
