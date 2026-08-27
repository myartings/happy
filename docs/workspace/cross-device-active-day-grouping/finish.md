# Finish Review: `cross-device-active-day-grouping`

## Summary

Fixed cross-device active-session day grouping by consuming the canonical
`SessionRowData.lastActivityAt` projection instead of device-local
`lastMessageSentAt`. Added a regression that models missing and conflicting
device-local activity timestamps.

## Verification

- Focused RED reproduced the exact cross-device inversion; GREEN passed.
- Targeted and neighboring activity/list coverage passed: 2 files, 26 tests.
- Happy App typecheck passed.
- Workflow validation/core/CI tests passed: 28 tests total.
- Full Happy App suite passed 170/175 files and 1528/1544 tests. The user
  explicitly accepted the 16 failures in five untouched baseline families on
  2026-08-28.

## Whole-diff review

Independent read-only review found no actionable findings. The product diff is
one canonical activity-key expression plus a focused regression fixture/test.
No protocol, persistence, security, privacy, concurrency, or data-integrity
boundary changed.

## Rollback or mitigation

Revert the production expression in
`packages/happy-app/sources/utils/visibleSessionListViewData.ts` and its focused
regression test. No migration, persisted-state cleanup, or server rollback is
required.

## Lessons promoted

- `CONTEXT.md`: none; the existing projection boundary already states the rule.
- Architecture or ADR: none; this was a stale consumer of an existing contract.
- Skill/workflow rule: none; the repository workflow correctly caught and
  recorded unrelated full-suite failures without expanding the fix.

## Follow-up

- No tracker or PR reconciliation is required; this was recorded as a local-only
  immediate user request.
- The unrelated baseline failures remain available in `validation.md` for a
  separately authorized maintenance task.
- No commit was requested; archive with `commit=pending`.
