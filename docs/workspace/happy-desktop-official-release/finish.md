# Finish Review: `happy-desktop-official-release`

## Summary

Added a project-local agent Skill and macOS `happyctl` official-baseline
workflow. The manager validates `main` against `upstream/main`, prepares a
detached baseline worktree, builds a separately identified app, signs with a
stable Apple identity, backs up, installs, verifies, launches, reports, and can
roll back without replacing the personal development client.

## Verification

- Focused official-baseline, stable-signing, and refresh-guard smoke tests pass.
- Bash syntax, ShellCheck, Skill validation, PowerShell parsing, workflow tests,
  strict audit, and `git diff --check` pass.
- Real dry-run prints the canonical source, worktree, identity, and install path
  without mutation.
- Full build/install was intentionally deferred until local integration because
  the pre-existing runtime baseline worktree contains generated changes.

## Whole-diff review

Passed. The diff is limited to devtools, the new project-local Skill,
repository routing, tests, and formal workflow evidence. No product source,
credentials, generated artifacts, remote pushes, or public release actions are
included.

## Rollback or mitigation

- Revert the local commits to remove the workflow.
- `devtools/happyctl rollback-official-baseline` restores the latest separate
  official-baseline backup.
- Dirty baseline worktrees fail closed; no cleanup of unknown changes occurs.

## Lessons promoted

- `CONTEXT.md`: no product-domain learning required.
- `docs/ARCHITECTURE.md` or ADR: none; operational decisions are recorded in
  this workflow and repository instructions.
- Skill/workflow rule: repository-specific release procedure lives in the new
  Skill while deterministic behavior stays in `happyctl`.

## Follow-up

- Promote the allowlisted infrastructure subset locally to `main`, merge the
  completed feature into `dev`, and merge local `main` back into `dev`.
- Review or replace the pre-existing dirty `.baseline/worktree/official-main`
  before running the first real official-baseline refresh.
