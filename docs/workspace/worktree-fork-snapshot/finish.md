# Finish Review: `worktree-fork-snapshot`

## Summary

Implemented a separate `Fork in isolated Worktree` flow for eligible Claude
and Codex sessions. The approved sheet distinguishes clean and dirty sources,
offers exact dirty-state inheritance or HEAD-only creation, and leaves the
existing fork, duplicate, and side-chat flows unchanged.

## Verification

The Happy App typecheck and complete 1024-test suite passed. The Happy CLI
typecheck/bundle and 22 affected tests passed, including real Git repositories,
cross-directory Claude transcripts, target-cwd Codex forking, and pre-spawn
rollback. The native-Windows full CLI unit suite retains unrelated
POSIX-assumption failures documented in `validation.md`.

## Whole-diff review

Reviewed all product, test, localization, and workflow changes. Git commands
use `execFile` argument arrays; cleanup uses opaque machine-owned tokens;
snapshot paths and Git-returned paths are bounded; source HEAD, index, status,
and copied overlays are revalidated before success. Provider spawn failure
removes only the worktree and branch created by the active operation.

## Rollback or mitigation

Before spawn success, rollback removes the owned worktree and `happy/fork/*`
branch. After spawn success, ownership transfers to the session and existing
conservative archive cleanup applies. The feature can be reverted as one
feature commit without changing stored server schemas.

## Lessons promoted

- `CONTEXT.md`: none; behavior is captured in the feature spec and tests.
- `docs/ARCHITECTURE.md` or ADR: none; no shared architectural contract changed.
- Skill/workflow rule: retained exact commands and the native-Windows suite gap in workflow validation evidence.

## Follow-up

Merge into `dev`, build, and upgrade Happy Desktop only when explicitly
requested. A future cleanup improvement may surface retained dirty worktrees in
a dedicated manager, but it is outside this interaction.
