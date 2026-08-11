# Journal: `client-performance-hotspots`

## `2026-08-11`

- Started workflow.
- Created `myartings/client-performance-hotspots` from `dev` so the separate
  unmerged session-cache fixes are not included.
- Implemented the three independent slices with subagents and integrated their
  shared `sync.ts` changes.
- Whole-diff review found that removing Web's 500-row render mode also required
  calling `scrollToIndex` on Web before DOM reveal retries; corrected the seam.
- Independent review then found unbounded stale `onScrollToIndexFailed` retries;
  retries are now tied to the active request, capped at three, and cancelled on
  target/session changes or unmount.
- Targeted tests, Happy app typecheck, and the final single-worker full suite
  (110 files, 1081 tests) passed. The default-worker suite exposed an unrelated
  fixed-timeout blob-test fluctuation; isolated and single-worker reruns passed.
