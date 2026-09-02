# Issue #98 Session Launch

## Goal

Fix [Issue #98](https://github.com/myartings/happy/issues/98): ensure a Happy Dev Desktop refresh installs and verifies an RPC-compatible local Happy CLI daemon so New Session does not remain on `Loading saved projects` with Send disabled.

## Accepted scope

- Work from `issue/98-keep-happy-dev-desktop-and-local-cli-daemon-rpc` in `/Users/myartings/workspace/.worktrees/happy-issue-98`.
- Base: `refs/remotes/origin/dev@03936270022bdbb635f66a0cbab647a7b9e9b92b`.
- Implement the single delivery Slice defined by the live Issue: paired macOS Dev Desktop/CLI build and install, daemon restart, compatibility verification, devtools regression tests, and a real forced refresh.
- Keep product-facing old-CLI messaging in #86. Do not restore scanned-project fallback or publish npm packages.

## Completed work

- Diagnosed the shared root cause of both reported symptoms.
- Confirmed App source requests `list-saved-projects`, while the installed workspace CLI bundle predates and lacks that RPC registration.
- Confirmed `refresh-desktop` currently builds only the Desktop app.
- Created Issue #98 with the accepted outcome, criteria, boundaries, verification plan, dependencies, and right-sizing assessment.
- Prepared this isolated worktree from the verified `origin/dev` base. No implementation or local lifecycle Workspace has been created by the coordinator.

## Validation

- Deterministic pre-fix seam: `packages/happy-cli/src/api/apiMachine.ts` contains `list-saved-projects`, while `packages/happy-cli/dist/index.mjs` does not.
- Running daemon observed as Happy CLI 1.2.2, started 2026-08-31; CLI dist timestamp is 2026-08-28 and source timestamp is 2026-09-02.
- Focused App tests passed: 3 files, 16 tests covering Saved Project loader/RPC/New Session wiring.
- Shared checkout was clean at `dev@03936270022bdbb635f66a0cbab647a7b9e9b92b` before preparation.

## Dirty state

- This handoff file is the only expected coordinator-created uncommitted file in the Issue worktree.
- The shared checkout remains on clean `dev` and must not be modified by the receiving Issue session.

## Blockers

- Local acceptance is still pending in the receiving Root. The new session must re-read the live Issue and repository instructions before creating or accepting its Workspace.
- Do not begin sustained implementation unless the session confirms it is bound to this exact worktree and branch.

## Stop conditions

- Stop if the live Issue materially differs from this capsule, the branch/worktree/base identity does not match, unrelated dirty files appear, or lifecycle/risk/scoping gates fail.
- Stop before public npm publication, force pushes, destructive Git recovery, scanned-project fallback, or changes to official-baseline behavior.
- Preserve installed-app backups and fail closed on CLI build/install, daemon restart, compatibility verification, Desktop build/install, or launch verification failure.

## Next action

Re-read the live Issue and repository, confirm the user's accepted Slice, create and bind the local Workspace to Issue #98, run risk/scoping gates, then implement the smallest tested fix through check, independent review, finish, and the authorized real Dev refresh.
