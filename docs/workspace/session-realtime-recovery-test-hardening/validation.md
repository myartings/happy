# Validation: `session-realtime-recovery-test-hardening`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-28` | scope, source seam, and prior acceptance review | passed | User selected recommended test hardening; three bounded gaps and stable TDD seams are recorded in context/decisions/spec/tasks. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/sync/apiSocket.test.ts -t "restarts one health monitor after reconnect and permits a later recovery cycle"` | RED then passed | RED observed only two probes because the passive double never delivered reconnect handlers. GREEN adds a stateful Socket.IO boundary fake; targeted test passes. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/sync/apiSocket.test.ts` | passed | 5/5 health tests pass with reconnect-handler, timer-restart, stale-event, and cleanup coverage. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/sync/sync.realtimeRecovery.test.ts` | RED then passed | RED reached the owned module and failed with `Sync is not a constructor`. GREEN exports only the host/test subscription seam; 1/1 test proves the real `InvalidateSync` + REST path, activity/done/reconnect recovery, monotonic cursor under a delayed REST/socket race, balanced visibility, and one-time Git/voice focus effects. |
| `2026-08-28` | `pnpm --filter happy exec vitest run --project unit src/codex/__tests__/primaryTurnLifecycle.test.ts` | RED then passed | RED failed because the final lifecycle consumer did not exist outside `runCodex`. GREEN extracts the consumer used by `runCodex`; 2/2 tests prove exact primary completion/abort effects, duplicate idempotence, and child lifecycle no-op behavior. The command's test workspace also completed the CLI build/typecheck setup successfully. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/sync/apiSocket.test.ts sources/sync/sessionRealtimeRecovery.test.ts sources/sync/sessionMessageCachePolicy.test.ts sources/sync/sync.realtimeRecovery.test.ts` | passed | 4 files, 17/17 focused App tests pass. |
| `2026-08-28` | `pnpm --filter happy-app typecheck` | passed | App TypeScript contract passes after exporting the narrow `Sync` host seam. |
| `2026-08-28` | `pnpm --filter happy test` | passed | CLI build/typecheck and complete unit suite pass: 93 files, 871/871 tests. |
| `2026-08-28` | `python3 scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption valid. |
| `2026-08-28` | `python3 scripts/test-workflow-core.py` | passed | 14/14 workflow-core tests pass. |
| `2026-08-28` | `python3 scripts/test-workflow-ci.py` | passed | 14/14 workflow-CI tests pass. |
| `2026-08-28` | `python3 scripts/workflow-audit.py --strict --require-active` | passed with expected future gates | Active workflow is valid; only check/review/finish remained pending at this verification point. |
| `2026-08-28` | whole-diff review plus `git diff --check` | passed | No blocking correctness, regression, boundary, data, or test-integrity finding. Added `afterEach` cleanup so the real host test cannot leak fake timers or storage state. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| TH1 | verified | Real `Sync` host test enters through visibility and subscription APIs, establishes cursor 12, races a delayed REST page with socket seq 13, then proves activity/done/reconnect use the monotonic incremental path and one hide stops terminal reconciliation. |
| TH2 | verified | Stateful Socket.IO fake drives handlers; targeted RED/GREEN and 5/5 socket suite prove timer restart, no duplicate recovery, and later reuse. |
| TH3 | verified | The extracted consumer is imported and invoked by `runCodex`; focused primary/child completion and abort sequences pass with exact keepalive/reset counts. |
| TH4 | verified | Focused App tests, App typecheck, CLI 871/871, workflow checks, diff integrity, and whole-diff review pass. The known unrelated App full-suite baseline remains unchanged. |

## Remaining gaps

- App full-suite baseline has the same unrelated flat-session/Studio failures
  recorded by the parent workflow; it is not an accepted target of this slice.
