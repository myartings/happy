# Finish Review: `client-performance-hotspots`

## Summary

- Prompt Navigator now starts from loaded messages, fetches older prompts only
  on demand in 100-message pages, and keeps the chat list virtualized.
- Session entry owns one Git status invalidation; socket reconnect refreshes
  only messages for mounted sessions.
- Encryption caches now use Map-order O(1) LRU touch and eviction.

## Verification

- Happy app typecheck passed.
- Targeted prompt-target, reconnect-selection, LRU, and Web reveal tests passed.
- Final full Happy app suite passed: 110 files, 1081 tests with one worker.
- Repository workflow validation/core/CI tests and `git diff --check` passed.

## Whole-diff review

- Independent reviewer found one medium issue: unbounded stale
  `onScrollToIndexFailed` timers after removing the 500-row render mode.
- The fix binds retries to the active request, caps them at three, and cancels
  timers/reveal loops on target or session changes and unmount.
- Independent re-review confirmed the finding resolved with no blockers.

## Rollback or mitigation

- Revert the feature commit. No protocol, persistence format, migration, or
  server behavior changed.

## Lessons promoted

- `CONTEXT.md`: no durable repository rule change needed.
- Architecture or ADR: none; this preserves existing client boundaries.
- Skill/workflow rule: no new global rule; retain the review lesson in this
  workflow evidence.

## Follow-up

- A mounted ChatList fake-timer test could directly cover lifecycle cleanup,
  but current pure retry tests and independent lifecycle review are sufficient
  for this bounded change.
