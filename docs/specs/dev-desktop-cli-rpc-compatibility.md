# Specification: Dev Desktop and local CLI RPC compatibility

## Status and source

- Status: accepted for implementation on 2026-09-02.
- Delivery source: [GitHub Issue #98](https://github.com/myartings/happy/issues/98).
- Boundary: one operational Feature Slice. CLI build/install, daemon restart,
  compatibility verification, and Dev Desktop replacement form one fail-closed
  refresh transaction.

## Goal

A successful macOS `refresh-desktop` leaves Happy Dev Desktop and the locally
running Happy CLI daemon on a workspace build that exposes the Saved Projects
Machine RPC required by the App. The workflow must stop before replacing or
launching the Desktop client if it cannot establish that compatibility.

## Observable behavior

1. A macOS Dev refresh that will rebuild the Desktop also builds and installs
   the `packages/happy-cli` workspace package, verifies that npm's global
   package resolves to that exact workspace package, restarts the daemon through
   that installed package's exact `bin/happy.mjs`, and confirms a live daemon
   PID that differs from the post-install daemon when one existed.
2. Before Desktop replacement, refresh verifies that the installed CLI bundle
   contains the `list-saved-projects` registration required by the current App.
3. CLI build, install, daemon restart, compatibility verification, Desktop
   build/install, or Desktop verification failure returns nonzero, identifies
   the failed stage, and does not launch an unverified client.
4. `refresh-desktop --dry-run` describes the paired Desktop/CLI operation,
   daemon restart, and compatibility gate without building, installing,
   stopping/starting processes, writing reports, or changing Git/local state.
5. The update report records separate CLI build, install, daemon restart, and
   compatibility outcomes in addition to the existing Desktop outcomes.
6. A no-update refresh without `--force` preserves the existing skip behavior;
   a synchronized no-Desktop-change result does not replace either runtime.

## Interfaces and state transitions

- The public command remains
  `devtools/happyctl refresh-desktop [--dry-run] [--force] [--keep-backups N]`.
- The CLI source authority is the synchronized `HAPPY_DEVTOOLS_FINAL_BRANCH`
  checkout under `packages/happy-cli`; no npm registry publication or
  `happy@latest` installation is part of this flow.
- Compatibility is established from the globally installed local package's
  compiled bundle, not from TypeScript source or a stale workspace bundle.
- Daemon lifecycle and compatibility inspection resolve from the same npm
  global package. A different `happy` executable earlier on `PATH` is ignored.
- Runtime transition order is:
  Desktop build -> workspace CLI build -> workspace CLI link -> exact installed
  executable daemon restart/health check ->
  Saved Projects RPC compatibility check -> Desktop backup/install/verify ->
  launch.
- A new CLI with the previous Desktop is the permitted partial state if a later
  Desktop install/verify step fails; the retained RPC is backward-compatible.
  The inverse state (new Desktop with an unverified old CLI) is forbidden.

## Failure and compatibility behavior

- A missing or non-workspace global CLI package, missing installed bundle,
  missing RPC marker, failed exact-executable daemon restart/health command, or
  nonzero install command fails the refresh.
- The failure report names the stage and preserves all completed-stage results.
- Nonzero build, link, daemon stop/start, and compatibility command statuses are
  preserved by the public refresh command and its stage-specific report.
- Existing installed-app backup/rollback behavior remains authoritative for
  Desktop replacement.
- Linux and Windows refresh behavior is unchanged.
- Old App/new CLI compatibility is preserved; new App/old CLI must be rejected
  by the refresh gate rather than hidden behind scanned-project fallback.

## Non-goals

- Public npm release or installation of `happy@latest`.
- Official-baseline Desktop behavior.
- Product-facing old-CLI messaging tracked by Issue #86.
- Restoring workspace scanning or Recent-project fallback.
- Broad New Session UI changes, protocol redesign, or Windows/Linux changes.

## Acceptance and evidence mapping

| ID | Verifiable criterion | Planned evidence |
| --- | --- | --- |
| DC-01 | Rebuild refresh installs the workspace CLI before Desktop replacement. | Devtools orchestration smoke test and dry-run inspection. |
| DC-02 | The daemon is restarted and health-checked after local CLI install through the exact npm-linked workspace executable, independent of `PATH`. | Devtools success/failure and mismatched-PATH smoke cases plus real daemon status. |
| DC-03 | Missing `list-saved-projects` in the installed bundle blocks Desktop install/launch. | Devtools missing-RPC fixture. |
| DC-04 | Every CLI/daemon/compatibility failure is nonzero and stage-specific. | Devtools failure matrix and report assertions. |
| DC-05 | Dry-run is descriptive and state-preserving. | Fixture snapshot before/after dry-run. |
| DC-06 | Reports record CLI build/install/restart/compatibility outcomes. | Report fixture assertions. |
| DC-07 | Saved Projects RPC remains compiled and its focused CLI tests pass. | CLI build and Saved Projects test files. |
| DC-08 | Existing New Session Saved Projects behavior remains green. | Focused App tests. |
| DC-09 | A real forced refresh installs/launches Happy Dev with a healthy compatible daemon. | Authorized macOS `refresh-desktop --force`, installed bundle/daemon/App checks, and New Session observation. |
