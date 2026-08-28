# Validation: `session-realtime-recovery`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-28` | official issue/code/local-log diagnosis | passed | #988 matches the visible symptom; #989 motivates liveness defense; local red replay proves child completion can precede continued primary work. |
| `2026-08-28` | inspect `AGENTS.md`, `.ai/project.json`, intensity matrix, source seams, and current branch | passed | High-risk workflow required by Session protocol and cross-device synchronization triggers; accepted scope is local-only on a feature branch. |
| `2026-08-28` | `pnpm --filter happy exec vitest run --project unit src/codex/codexAppServerClient.test.ts -t "keeps the primary turn active while a child thread starts and completes"` | RED then passed | RED showed child completion lacked thread scope and cleared the primary turn. GREEN preserves the primary turn/waiter and steers the follow-up to it. |
| `2026-08-28` | `pnpm --filter happy exec vitest run --project unit src/codex/__tests__/sessionProtocolMapper.test.ts -t "does not end the primary protocol turn for subagent-scoped lifecycle events"` | RED then passed | RED proved child `task_started` replaced the unified protocol turn; GREEN ignores subagent-scoped top-level lifecycle. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/sync/apiSocket.test.ts` | RED then passed | REDs proved no acknowledged health probe and no reconnect after two timeouts. GREEN adds active-only probe, two-failure reconnect guard, diagnostics, and timer cleanup. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/sync/sessionRealtimeRecovery.test.ts` | RED then passed | REDs proved terminal, periodic, foreground, reconnect, and done reconciliation were absent. GREEN adds visible-only immediate/trailing and 30-second recovery. |
| `2026-08-28` | `pnpm --filter happy exec vitest run --project unit src/codex/codexAppServerClient.test.ts src/codex/__tests__/sessionProtocolMapper.test.ts` | passed | 63/63 focused Codex lifecycle and protocol tests. CLI build/typecheck also ran through the unit project pretest. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/sync/apiSocket.test.ts sources/sync/sessionRealtimeRecovery.test.ts sources/sync/reducer/activityUpdateAccumulator.test.ts sources/sync/sessionMessageCachePolicy.test.ts` | passed | 26/26 App socket, recovery, activity batching, and visible-cache policy tests. |
| `2026-08-28` | `pnpm --filter happy-app typecheck` | passed | App TypeScript check completed with no errors. |
| `2026-08-28` | `git diff --check`; workflow validate; strict active audit | passed | Diff integrity and structured workflow are valid; only future implementation/check/review/finish receipts were pending at this point. |
| 2026-08-28 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-28 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-28 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-28 | `pnpm --filter happy-server test` | passed | test |
| 2026-08-28 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-28 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-28 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-28 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| `2026-08-28` | mixed legacy/raw completion and stale same-socket health-probe regressions | RED then passed | RED reproduced duplicate primary completion and stale-probe failure-count pollution; generation and primary-alias dedupe fixes turned both GREEN. |
| `2026-08-28` | independent high-risk review, first pass | blocked then remediated | Four findings: conflicting unscoped child lifecycle, bidirectional legacy/raw dedupe, reconnect probe generation, and monotonic message cursor. All four received code and regression-test changes; second-pass review pending. |
| `2026-08-28` | `pnpm --filter happy exec vitest run --project unit src/codex/codexAppServerClient.test.ts src/codex/__tests__/sessionProtocolMapper.test.ts` | passed | 63/63 after raw/legacy ordering and conflicting unscoped-turn coverage. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/sync/apiSocket.test.ts sources/sync/sessionRealtimeRecovery.test.ts sources/sync/reducer/activityUpdateAccumulator.test.ts sources/sync/sessionMessageCachePolicy.test.ts` | passed | 28/28 after same-socket reconnect generation and monotonic cursor coverage. |
| `2026-08-28` | `pnpm --filter happy-app typecheck` | passed | App TypeScript check completed with no errors after review remediation. |
| `2026-08-28` | `pnpm --filter happy test` | passed | CLI build/typecheck and 92 files / 869 tests passed. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run --reporter=dot` | baseline failure | 174 files / 1541 tests passed; 4 files / 15 tests failed in unmodified flat-session/Studio presentation and rich-text wiring tests. No failing file is in this task's diff. |
| `2026-08-28` | ignored child legacy followed by raw primary `agentMessage`; replaced-socket delayed events | RED then passed | RED reproduced dropped primary text and old-socket state mutation. GREEN defers legacy protocol selection to primary events and identity-guards every registered socket handler. |
| `2026-08-28` | final `pnpm --filter happy test`; App sync-focused suite; App typecheck | passed | CLI 92 files / 869 tests; App 4 files / 29 tests; TypeScript clean after second-review remediation. |
| `2026-08-28` | independent high-risk review, final pass | passed | All six reported concurrency/protocol findings are closed; reviewer reran Codex 63/63, App 29/29, App typecheck, and `git diff --check` with no remaining blocking finding. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1-AC3 | verified | 63-test Codex focused suite preserves primary turn, steering, completion, and unified protocol lifecycle. |
| AC4-AC5 | verified | `apiSocket.test.ts` proves acknowledged ping, two-timeout reconnect, timer replacement, cleanup, and diagnostics. |
| AC6-AC8 | verified | `sessionRealtimeRecovery.test.ts` and host wiring prove terminal/trailing/periodic visible-only reconciliation without `onSessionVisible` reference mutation. |
| AC9 | verified | All changed CLI/App behavior, CLI full suite, App/server typechecks, server tests, workflow checks, diff integrity, and independent whole-diff review pass. App full suite retains 4-file/15-test failures confined to unmodified flat-session/Studio tests. |

## Remaining gaps

- App full-suite baseline remains red in four unmodified flat-session/Studio tests (15 failures); this task adds no failures in changed or adjacent synchronization suites.
