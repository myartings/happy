# Finish Review: `prompt-rail-edge-hit-targets`

## Summary

Prevented the prompt rail's older/newer arrow hit targets from intercepting the
top and bottom tick regions while preserving outward and horizontal expansion.

## Verification

- Happy App typecheck passed.
- Targeted navigation tests passed (13/13).
- Full Happy App suite passed (1030/1030).
- `git diff --check` passed.

## Whole-diff review

Reviewed both arrow edges, track adjacency, retained accessible hit area,
component usage, test coverage, and workflow-only changes. No unrelated product
changes or blocking findings remain.

## Rollback or mitigation

Restore scalar `hitSlop={8}` on both arrow pressables and remove the shared
geometry constant/test. No persisted state is affected.

## Lessons promoted

- `CONTEXT.md`: not needed; local pointer geometry only.
- `docs/ARCHITECTURE.md` or ADR: not needed; no architecture boundary changed.
- Skill/workflow rule: not needed; existing lifecycle captured the regression.

## Follow-up

Publish through a PR to `dev`, rebuild the desktop client, and manually click
the first and last several ticks in a long session.
