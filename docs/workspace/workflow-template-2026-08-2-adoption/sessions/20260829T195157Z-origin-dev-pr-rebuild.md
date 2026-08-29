# Session: `20260829T195157Z-origin-dev-pr-rebuild`

**Feature**: `workflow-template-2026-08-2-adoption`
**Date**: `2026-08-30`
**Agent / Scope**: origin-dev-pr-rebuild
**Branch / Worktree**: feature/workflow-template-2026-08-2-adoption
**Related Commit**: none; staged candidate based on `origin/dev@f23b9d756d3e3c20b9c41392102c4728b4ab8e15`

## Goal

- Rebuild the accepted selective workflow migration on the actual remote
  integration baseline and prepare one atomic PR targeting `dev`.

## Starting context

- Published backup `origin/sharp-harbor@5ee0818e...` contained the accepted
  migration but was based on an independent TestFlight delivery.
- Direct PR simulation was 2 commits ahead and 2 behind `origin/dev`, included
  two workflow archive rows, conflicted in `docs/workspace/archive.md`, and
  failed workflow CI.

## Changes made

- Preserved `origin/sharp-harbor` unchanged and created the isolated current
  branch from exact `origin/dev@f23b9d75...` without inheriting a tracking ref.
- Reused the accepted specification, tasks, and D1-D9 decisions; added D10 to
  require a no-rewrite rebuild with freshly generated base-bound evidence.
- Ran the pinned source synchronizer pre-apply dry-run, transactionally applied
  72 classified updates, and replayed the 82 nonterminal reviewed migration
  paths byte-for-byte from `5ee0818e...`.
- Upgraded the fresh active Workspace from schema 1 to schema 3 while preserving
  all gates and history and recording the user-approved local-only PR source.
- Proved the clean synthetic candidate has zero upstream adoption drift, then
  removed the temporary worktree without creating a ref.

## Decisions

- Keep the published cumulative branch only as a recovery reference; do not
  force-push or rewrite it.
- Regenerate check, review, finish, completion, and archive evidence on the
  exact PR base rather than copying terminal evidence from the stale base.
- Permit one normal branch push and one PR to `dev`; merge remains separately
  authorized.

## Commands / validation

| Command | Result | Notes |
| --- | --- | --- |
| direct `workflow-ci.py --base origin/dev` | rejected as designed | Two archive rows proved the old branch was cumulative. |
| pinned source pre-apply dry-run | passed | 36 changed, 32 missing, 3 retirements, 35 unchanged, 1 project-check merge. |
| pinned source `--apply` | passed | 72 transactional updates. |
| `test-happy-workflow-state-upgrade.py` | passed | 2/2. |
| `validate-happy-workflow.py` | passed | Exact pinned selective authority valid. |
| `test-validate-happy-workflow.py` | passed | 9/9. |
| `workflow-audit.py --all --strict` | passed | Repository and active Workspace valid. |
| clean synthetic pinned-source dry-run | passed | Zero changes; all retirements absent. |

## Blockers / risks

- No unresolved implementation blocker. Final candidate-bound checks and both
  independent review axes must still run on the complete candidate after this
  summary is staged.

## Next action

- Record implementation completion, stage the complete candidate, run the fresh
  applicable check and independent Spec/Standards review, then finish/archive.
