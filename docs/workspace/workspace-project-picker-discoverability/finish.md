# Finish Review: `workspace-project-picker-discoverability`

## Summary

- Kept the Workspace Projects search and discovery status above the constrained
  results scroller so many Recent entries cannot hide the entry point.
- Limited the initial Recent preview to five items and added an expand/collapse
  disclosure without changing item order or selection values.
- Made the embedded desktop/web result region explicitly vertically scrollable.

## Verification

- Targeted workspace discovery suite: 13/13 passed.
- `pnpm --filter happy-app typecheck`: passed.
- `git diff --check`: passed with Windows line-ending warnings only.
- Full Happy app suite: 1505 passed and 17 failed; all 17 failures were
  reproduced in the clean base checkout at the same commit and are unrelated to
  the Project picker files.

## Whole-diff review

- Passed with no blocking findings after renaming the nested ready-state group
  to `Workspace Results` to avoid duplicate adjacent section labels.
- No RPC, scanner, storage, machine-selection, authentication, or sync contract
  changed.

## Rollback or mitigation

- Revert the three product/test files in this workflow to restore the previous
  picker layout; no data migration or operational rollback is required.
- Packaged Windows visual smoke remains a deployment follow-up and does not
  affect the deterministic code checks.

## Lessons promoted

- `CONTEXT.md`: none; this is task-specific presentation behavior.
- `docs/ARCHITECTURE.md` or ADR: none; architecture boundaries are unchanged.
- Skill/workflow rule: none.

## Follow-up

- After a separately authorized Desktop refresh, visually confirm on Windows
  that search is visible on open, Recent expands/collapses, and wheel scrolling
  works inside the result region.
