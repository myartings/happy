# Validation: `client-performance-hotspots`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/utils/messageTarget.test.ts sources/utils/sessionPromptHistory.test.ts` | passed | 2 files, 11 tests. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/sync/sessionMessageCachePolicy.test.ts` | passed | 1 file, 5 tests. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/sync/encryption/lruMap.test.ts sources/sync/encryption/encryptionCache.test.ts` | passed | 2 files, 6 tests. |
| `2026-08-11` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed without diagnostics. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run` | passed | Pre-review run: 110 files, 1079 tests. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/utils/messageTarget.test.ts sources/utils/webMessageReveal.test.ts` | passed | Post-review retry-boundary fix: 2 files, 9 tests. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/encryption/blob.test.ts` | passed | 9 tests; isolated rerun confirmed prior full-suite timeout was worker contention. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run --maxWorkers=1` | passed | Final post-review run: 110 files, 1081 tests. Single worker avoids the unrelated 1MB blob test's fixed 5-second timeout under worker contention. |
| `2026-08-11` | `python scripts/validate-happy-workflow.py` | passed | Selective workflow adoption valid. |
| `2026-08-11` | `python scripts/test-workflow-core.py` | passed | 14 tests. |
| `2026-08-11` | `python scripts/test-workflow-ci.py` | passed | 14 tests. |
| `2026-08-11` | `git diff --check` | passed | No whitespace errors; Git emitted only Windows LF-to-CRLF checkout warnings. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Prompt history is lazy and paged at 100 | verified | `SessionPromptHistoryNavigator.tsx` effect/load review; `sync.ts` request-size review; app typecheck. |
| Target jumps remain virtualized and reliable | verified | `messageTarget.test.ts`; every platform calls `scrollToIndex` before the web reveal loop; failed-index retries are request-bound, capped at three, and cancellable. |
| Session entry avoids duplicate Git scans | verified | `SessionView.tsx` and `sync.ts` ownership review; `sessionMessageCachePolicy.test.ts`. |
| Reconnect refreshes visible messages only | verified | `selectVisibleSessionIds` tests and `apiSocket.onReconnected` integration review. |
| Encryption LRU eviction is O(1) | verified | `lruMap.test.ts`, `encryptionCache.test.ts`, and implementation review. |
| Existing Happy app behavior remains green | verified | Full Happy app Vitest run and typecheck. |

## Remaining gaps

- No automated mounted-component timing test asserts network-call counts or WebView scrolling; focused pure tests plus whole-diff inspection cover the stable seams.
