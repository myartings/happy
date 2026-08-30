# Cross-device active-day grouping

## Problem

The globally sorted active-session list can classify the same session under
different day groups on different devices. The list row already contains the
canonical activity projection (`lastActivityAt`), but the grouping pass uses the
device-local `lastMessageSentAt` and falls back to `createdAt`.

## Accepted behavior

- AC1: Active-session ordering and the `today`/`earlier` split use the row's
  canonical `lastActivityAt` value.
- AC2: A session whose canonical activity is today remains in `today` even when
  the current device has no `lastMessageSentAt` value.
- AC3: Existing fallback construction of `lastActivityAt` remains unchanged;
  this slice does not change server APIs, synchronization payloads, persistence,
  session presence, or timezone semantics.

## Scope

- `packages/happy-app/sources/utils/visibleSessionListViewData.ts`
- `packages/happy-app/sources/hooks/useVisibleSessionListViewData.test.ts`
- Workflow evidence for this task

## Risk controls

- Keep the fix in the pure presentation projection; do not alter protocol or
  synchronized data.
- Add a regression test with identical canonical activity and absent local
  activity to model a newly opened or previously offline device.
- Run the targeted test, the nearest activity/list tests, Happy App typecheck,
  and the complete Happy App Vitest suite when dependencies are available.
- Rollback is the single production-line change plus its focused test.
