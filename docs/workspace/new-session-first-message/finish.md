# Finish Review: `new-session-first-message`

## Summary

- First-message enqueueing now returns an explicit success signal.
- Both new-session launch surfaces clear and navigate only after local enqueue succeeds.
- Rejection, exception, and cancellation preserve the draft and reclaim the empty session through stop, kill, then archive fallback.

## Verification

- Focused new-session and Sync tests: 33 passed.
- Happy App and Happy Server typechecks: passed.
- `git diff --check`: passed.
- Full Happy App suite: 1623 passed and 16 unrelated failures in five untouched Studio/flat-list wiring test files; details are in `validation.md`.

## Whole-diff review

- Passed. The public return value is backward compatible for callers that ignore it.
- Success means local outbox enqueue, matching the existing non-blocking delivery contract.
- No server, protocol, auth, persistence, protected, generated, or credential files changed.

## Rollback or mitigation

- Revert the bounded client source/test changes. No data migration or server rollback is required.

## Lessons promoted

- `CONTEXT.md`: none; this is a localized regression rather than a new repository boundary.
- Architecture or ADR: none.
- Skill/workflow rule: none.

## Follow-up

- The unrelated Studio/flat-list test failures remain outside this task.
