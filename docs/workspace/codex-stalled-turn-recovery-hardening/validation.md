# Validation: `codex-stalled-turn-recovery-hardening`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-26` | Final review of staged recovery diff | blocked | Found uncertain-steer duplicate risk, recovery-exception loss, start-timeout loss, and detached rejection. |
| `2026-08-26` | Router RED: unknown result and reconciliation rejection | failed as expected | Existing code queued unknown delivery and propagated reconciliation failure. |
| `2026-08-26` | `pnpm --filter happy exec vitest run --project unit src/codex/codexUserMessageRouter.test.ts src/utils/MessageQueue2.test.ts` | passed | 33/33 after pending-delivery queue GREEN. |
| `2026-08-26` | App-server RED: start acknowledgement delivered/absent/unknown | failed as expected | Existing 30s request path timed out the new tests and had no reconciliation behavior. |
| `2026-08-26` | Inactivity recovery rejection RED | failed as expected | Vitest captured an unhandled rejection and outcome-inaccurate event. |
| `2026-08-26` | Old-runtime correlation RED | failed as expected | Runtime 0.147 path retried twice without a transmitted correlation ID. |
| `2026-08-26` | Final-review recovery serialization RED | failed as expected | Successful and failed automatic recovery tests returned before the outcome event, proving the main loop could race reconnect/resume. |
| `2026-08-26` | Recovery serialization focused GREEN | passed | Stale-notification, successful recovery, and rejected recovery tests all pass; only an actual reconnect/recovery Promise delays turn completion. |
| `2026-08-26` | `pnpm --filter happy exec vitest run --project unit src/codex/codexAppServerClient.test.ts src/codex/codexUserMessageRouter.test.ts src/utils/MessageQueue2.test.ts` | passed with known platform baseline | 62/64 passed; only the two pre-existing Windows-only sandbox expectations failed. All 28 non-sandbox client tests, 11 router tests, and 23 queue tests passed. |
| `2026-08-26` | `pnpm --filter happy typecheck` | passed | TypeScript compile contract passed. |
| `2026-08-26` | `git diff --check` | passed | No whitespace errors; Git emitted expected line-ending notices only. |
| 2026-08-26 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-26 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-26 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-26 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| 2026-08-26 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-26 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-26 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-26 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| H1 | verified | `resolveCodexUncertainDelivery` recovery-then-delivered test and pending queue test. |
| H2 | verified | Reconciliation rejection preserves input test; main loop retains unknown input. |
| H3 | verified | Delivered, confirmed-absent, unknown, and old-runtime start-timeout client tests. |
| H4 | verified | Inactivity reconnect rejection resolves deterministically with no Vitest unhandled rejection. |
| H5 | verified | Recovery events now include `recovery_resumed` and optional `recovery_error`; success/failure tests pass. |
| H6 | verified | Targeted behavior, typecheck, build, diff, and workflow checks pass; two unrelated Windows sandbox tests remain documented baseline failures. |

## Remaining gaps

- Full app-server test file remains red on Windows only for its two existing
  sandbox initialization expectations, which are disabled by product code on
  Windows and were present before this hardening.
