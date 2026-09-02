# Context: `dev-desktop-cli-rpc-compatibility`

## Goal and accepted source

Implement the single operational Slice accepted in GitHub Issue #98: a macOS
Dev refresh must pair the Desktop with a locally built CLI daemon that exposes
the Saved Projects Machine RPC, and fail before Desktop replacement otherwise.

The current Root is the confirmed fresh Issue session in the exact registered
worktree and branch. Live Issue content matches the launch handoff and accepted
contract. No writer delegation or alternate worktree is selected.

## Current evidence

- `packages/happy-cli/src/api/apiMachine.ts` registers
  `list-saved-projects`, but the pre-fix `packages/happy-cli/dist/index.mjs`
  and running locally installed daemon predate that registration.
- macOS `refresh_desktop` builds, installs, verifies, and launches only the
  Desktop client; report fields mention only aggregate CLI versions.
- `packages/happy-cli/scripts/install-local.cjs` already defines the local
  build, daemon stop, npm link, daemon start, and CLI version sequence.
- Existing devtools shell smokes source the public `happyctl` functions and can
  stub operational seams without mutating the real runtime.

## Allowed implementation scope

- `devtools/happyctl`, focused `devtools/tests/` smoke coverage, and bounded
  `devtools/README.md` documentation.
- This feature spec, task plan, launch handoff, and Workspace evidence.
- Test-only fixtures and helper seams needed to prove stage ordering and
  fail-closed behavior.

## Blocked and protected scope

- App product behavior, CLI Machine protocol redesign, scanner/Recent fallback,
  npm publication, official-baseline behavior, and broad Windows/Linux changes.
- Protected native directories, credentials, destructive Git recovery, force
  pushes, tracker mutation, and public distribution.

## Execution topology and tests

Execution is serial in the current Root/session/worktree. T1-T3 overlap the
same shell transaction; T4-T5 depend on that integrated result, so there are no
independent ready units and no batch receipt.

The incremental seam is a sourced-shell smoke fixture with stubbed build,
install, daemon, compatibility, Desktop, and report operations. Final evidence
adds CLI/App focused tests, complete applicable checks, independent review, and
the separately authorized real runtime refresh boundary.
