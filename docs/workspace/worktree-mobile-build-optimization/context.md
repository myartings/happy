# Context: `worktree-mobile-build-optimization`

## Goal and accepted source

Implement the user-accepted P0/P1 optimization for mobile packaging in Git
worktrees: correct pnpm configuration, add a conservative three-state mobile
plan, add Android release-command parity, and make mobile build provenance
auditable without forcing expensive artifact downloads.

This is an approved local-only, single-session delivery slice. No GitHub Issue,
writer subagent, client launch, or external coordination boundary is needed;
the lifecycle's independent read-only reviewers remain required.

## Current system evidence

- The current session root is this `swift-cloud` worktree, fast-forwarded to the
  clean `dev` baseline before task creation.
- pnpm 10.11 warns that the root `package.json#pnpm` settings are ignored.
- Personal EAS profiles are `personal` and `personal-store`, both on channel
  `personal`; Android internal builds are APKs.
- Current Expo fingerprints include `expoConfig.extra.app` build commit fields,
  so changing only build metadata changes the native fingerprint.
- EAS build JSON exposes build ID, profile, platform, channel, fingerprint,
  timestamps, and artifact URLs, but no binary SHA-256.
- Existing mobile release orchestration and tests are Unix/Bash and iOS-only.

## Allowed implementation scope

- `package.json`, `pnpm-workspace.yaml`, and lockfile only if the package manager
  proves a required deterministic change.
- `packages/happy-app/fingerprint.config.cjs`, plus a behavior-preserving
  `app.config.js` indirection and `native-assets.cjs` manifest that prevent the
  planner's native-image classification from drifting from Expo config.
- `devtools/happyctl`, `devtools/config.example.env`, the mobile-command safety
  notes in `devtools/AGENTS.md`, a bounded portable planner under `devtools/`,
  relevant smoke/unit tests, and `devtools/README.md`.
- The bounded workflow prerequisite in `scripts/workflow-state.py`,
  `scripts/workflow-check.py`, and `scripts/workflow-ci.py`, plus its public CLI
  regression in `scripts/test-happy-workflow-runtime.py`: bind an explicitly
  accepted failed check run to the exact candidate and carry it through review,
  finish, archive, and staged CI without weakening integrity validation.
- This feature spec, task checklist, and active workflow evidence.

## Blocked and protected scope

- `packages/happy-app/ios/**` and `packages/happy-app/android/**`.
- App product behavior, dependency upgrades, Expo/EAS profile redesign, Play
  submission, PowerShell mobile parity, actual builds/releases/installations,
  and tracker/Git mutations.
- Cross-worktree `node_modules` or pnpm virtual-store symlinks.

## Execution topology and tests

Execution is serial in the current Root/session/worktree. All implementation
units share configuration or `happyctl`, so there are no independent ready
units and no batch/delegation route.

Capability assessment: the current Root owns the release-safety and planner
semantics judgments, then performs the bounded deterministic edits and tests in
the same session. No model switch, isolated writer, or specialist handoff is
required.

The primary seams are the portable planner's exported decision functions and
the `happyctl` public commands. The closing prerequisite uses the public
`workflow-state.py review-conclusion` CLI integration seam. Validation proceeds
from focused Node/smoke tests to syntax/config checks and the repository-
applicable gate.
