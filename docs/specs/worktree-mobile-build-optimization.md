# Worktree Mobile Build Optimization

## Outcome

Happy developers can decide from any feature worktree whether an iOS or Android
change needs only Metro, can reuse an existing EAS artifact, or requires a new
native build. The decision is conservative, machine-readable, and does not
silently trigger a cloud build. Personal Android release operations expose the
same doctor/build/status safety boundary as the existing iOS operations.

## Scope

- Move pnpm 10 workspace settings out of the ignored root `package.json`
  location without changing dependency resolution or the lockfile.
- Stabilize the Expo native fingerprint by excluding the `extra` section,
  whose values are delivered with JavaScript/OTA content and include dynamic
  build provenance.
- Add `happyctl mobile-plan` for iOS and Android with human and JSON output.
- Add personal Android doctor, internal/store build, OTA, and status commands.
- Preserve all existing iOS command names and behavior while sharing mobile
  validation and reporting logic where practical.
- Enrich real mobile-build reports with source and EAS provenance. Computing a
  binary artifact SHA-256 remains explicit because it requires downloading the
  full remote artifact.
- Document the intended worktree workflow and its cost boundaries.

## Non-goals

- Running an EAS build, OTA update, submission, app installation, or store
  release as part of this implementation.
- Adding Android Play submission before an Android submit profile and
  credential contract exist.
- Sharing or symlinking `node_modules`/pnpm virtual stores across worktrees.
- Adding Windows PowerShell mobile-release parity; the existing personal mobile
  release surface is the Unix `happyctl`. The planner itself remains a portable
  Node program.
- Replacing Expo/EAS fingerprint semantics with a custom native-dependency
  model.

## Planner contract

### Inputs

`devtools/happyctl mobile-plan` accepts:

- required `--platform ios|android`;
- optional `--profile PROFILE`, defaulting to the personal internal profile;
- optional `--base REF`, defaulting to `dev`;
- optional `--json` for stable machine-readable output.

The planner compares the selected `--base` tree directly with `HEAD`, including
the case where the base advanced after the feature worktree fork, then adds
staged, unstaged, and untracked changes as independent Git states, so an index
change cannot be hidden by restoring only the worktree copy. Committed, staged,
and unstaged rename detection is unfolded so both the source and destination
remain classifiable. It records the
merge base for provenance, the current commit, and a digest of both index and
worktree content without writing inside the repository. Unknown paths are
native-sensitive by default; only explicit documentation/devtools/non-mobile
package paths are ignored. Git path separators are preserved, so a literal
backslash in a valid filename cannot be rewritten into an ignored or Metro-only
prefix. If the same native-sensitive path differs between the index and
worktree—including a staged deletion followed by an untracked recreation—the
planner skips fingerprint/EAS lookup and returns `native-rebuild` because one
filesystem fingerprint cannot prove both states.

### States

1. `metro-only`: every changed path is either unrelated to mobile packaging or
   is a known Metro-delivered app source/asset, and no native-sensitive path is
   present. It assumes a compatible development build is already installed;
   native icon/splash/notification assets are not Metro-only.
2. `reuse-artifact`: a native-sensitive path is present, the current normalized
   native fingerprint is available, and EAS has a finished build with a
   non-empty build ID, a valid HTTPS artifact URL, no elapsed artifact expiry,
   and the exact platform, profile, channel, and fingerprint.
3. `native-rebuild`: reuse cannot be proven, including fingerprint generation,
   authentication, or network failure. This is a valid conservative plan, not
   permission to start a build.

The planner must never run `eas build`, `eas update`, `eas submit`, install an
artifact, or write a release report.

## Fingerprint contract

The Expo fingerprint excludes `expo.extra` through the supported
`ExpoConfigExtraSection` source skip. It continues to include native identifiers,
plugins, dependencies, config, native assets, and generated-native inputs.
Changing only `HAPPY_BUILD_COMMIT_SHA` or `HAPPY_BUILD_COMMIT_TIMESTAMP` must
not change the native fingerprint. The first build after adopting this contract
may establish a new reusable baseline because historical EAS fingerprints were
computed without the skip.

## Android command contract

The Unix `happyctl` exposes:

- `android-doctor`;
- `android-build-internal [--dry-run] [--hash-artifact]`;
- `android-build-store [--dry-run] [--hash-artifact]`;
- `android-publish-update --message TEXT [--dry-run]`;
- `android-release-status`.

Dry runs validate local personal Expo/EAS configuration and print the exact
redacted command, but do not authenticate, build, publish, submit, download an
artifact, or write a report. Real cloud actions retain the existing invariant:
the repository must be clean, on `dev` (or the configured final branch), have
the expected personal identity/profile, and be authenticated to EAS.
Each prerequisite must propagate failure explicitly even when a caller invokes
the readiness gate from a Bash conditional or OR-list; later successful checks
must not mask an earlier configuration or cleanliness failure.

## Build-report contract

After an actual iOS or Android cloud build command returns, its external
Happy Devtools report records:

- requested platform/profile/channel and the values returned by EAS;
- source commit and dirty-source digest;
- native fingerprint and EAS build ID when returned;
- local command duration and EAS-created/completed timestamps when returned;
- original EAS process exit/outcome, raw EAS build status, independently
  derived effective status, and artifact URL;
- byte count and SHA-256 of the exact EAS JSON response, including malformed
  responses whose structured fields cannot be retained;
- artifact SHA-256, or an explicit `not computed` reason.

A build action succeeds only when the EAS process exits zero, the returned
status is exactly `FINISHED`, and returned platform/profile/channel match the
request. A nonzero command remains failed even if it emitted valid-looking
`FINISHED` JSON; conversely, zero-exit `ERRORED`/`CANCELED` JSON is failed.
Parseable failure responses retain every available structured field even when
IDs or timestamps are absent; success validation applies stricter required
fields without erasing partial failure evidence.

`--hash-artifact` streams the completed artifact through SHA-256 without saving
it in the repository. It accepts only HTTPS URLs without embedded credentials,
and curl is restricted to HTTPS for the initial request and every redirect. It
is never enabled implicitly. Reports remain outside tracked source; temporary
JSON is protected by exit/signal cleanup and downloaded bytes are never saved.

## Failure and compatibility behavior

- Unsupported platform/profile/base arguments fail before network access.
- A missing Git base or Git inspection failure is an explicit planner error.
- An unavailable fingerprint or EAS lookup produces `native-rebuild` with a
  reason; it never produces false reuse.
- Unknown potentially build-affecting paths fail closed, and native-sensitive
  index/worktree divergence, including staged-delete/untracked-recreation,
  never reaches fingerprint or EAS lookup. Literal
  backslashes in Git-returned filenames remain literal and therefore fail closed.
- Native-to-unrelated renames retain and classify both source and destination in
  committed, staged, and unstaged states; the source deletion cannot disappear
  behind Git rename folding.
- A finished build with no identifiable downloadable artifact, or with an
  elapsed/invalid reported expiry, produces `native-rebuild`.
- Malformed build JSON, unsuccessful EAS status, and returned build-dimension
  mismatch fail the build action while preserving structured fields when
  parseable and always preserving response byte count plus SHA-256 in a report.
- Existing iOS command names, dry-run safety text, profile defaults, and release
  branch guard remain compatible.
- Failed local configuration, clean-tree, branch, or EAS-authentication checks
  stop a real build before the build command is invoked, independent of Bash
  errexit context.
- No protected `packages/happy-app/ios/**` or `android/**` path is edited.

## Acceptance criteria

1. pnpm 10.11 reads overrides, allowed build dependencies, and patch mappings
   from `pnpm-workspace.yaml`; the obsolete root `pnpm` block is absent, the
   ignored-settings warning is gone, and `pnpm-lock.yaml` does not drift.
2. Planner tests prove all three states, exact platform/profile/channel matching,
   identifiable/downloadable/unexpired artifact availability, independent
   staged/worktree dirty-source provenance and divergence (including staged
   deletion plus untracked recreation), unknown-root-path
   and literal-backslash conservatism, positive exact-match controls,
   native-to-unrelated committed/staged/unstaged rename provenance,
   shared-manifest native-asset alignment, and fail-closed behavior.
3. Fingerprint evidence proves that changing only dynamic build commit metadata
   yields the same iOS and Android native fingerprints.
4. `mobile-plan --platform ios|android --base HEAD` returns valid human output;
   `--json` returns a parseable schema containing plan, platform, profile, base,
   commit, dirty state/digest, fingerprint/build evidence, and reasons.
5. Android dry-run smoke tests cover internal/store builds and OTA, reject a
   missing OTA message, and prove no cloud action/report is created.
6. Existing iOS release smoke tests remain green after shared mobile refactoring.
7. A fixture-backed report test proves every required report field, separates
   process outcome from raw EAS status, rejects unsuccessful status and each
   returned dimension mismatch, retains partial and malformed response evidence,
   proves artifact hashing is opt-in/HTTPS-only, and proves temporary response
   cleanup on report failure. Readiness-gate tests prove failed configuration or
   repository-cleanliness checks cannot reach the real EAS invocation.
8. Bash syntax, Node tests, relevant devtools smoke tests, pnpm frozen-lockfile
   validation, applicable repository checks, diff checks, and independent
   whole-diff review pass.

## Evidence map

| Criterion | Planned evidence |
| --- | --- |
| AC1 | pnpm config inspection, frozen-lockfile install/check, lockfile diff |
| AC2, AC4 | `node --test devtools/tests/mobile-plan.test.mjs`; happyctl smoke calls |
| AC3 | two-metadata fingerprint comparison for both platforms |
| AC5, AC6 | Android and iOS release smoke scripts |
| AC7 | fixture-backed mobile report smoke script |
| AC8 | syntax, targeted suite, `workflow-check.py --applicable`, diff/review evidence |
