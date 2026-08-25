# Validation: `codex-stalled-turn-recovery`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-26` | `pnpm install --frozen-lockfile` | unavailable | Dependencies restored from the local store, then the repository's React Native Skia postinstall failed because it invokes Unix `rm` on Windows. Required CLI test binaries were installed; lockfile and tracked files were unchanged. |
| `2026-08-26` | targeted client-message ID test (RED) | failed as expected | `turn/steer` omitted `clientUserMessageId`. |
| `2026-08-26` | same client-message ID test (GREEN) | passed | Steering payload preserves the stable client ID. |
| `2026-08-26` | uncertain-steer correlation test (RED) | failed as expected | Router queued a message even when reconciliation reported it delivered. |
| `2026-08-26` | router suite (GREEN) | passed | 6 tests cover steering, correlation, ID-preserving fallback, clear, and idle behavior. |
| `2026-08-26` | missed-completion reconciliation test (RED) | failed as expected | `reconcilePendingTurn` did not exist. |
| `2026-08-26` | same reconciliation test (GREEN) | passed | Thread history correlation settles an idle pending turn without duplicating input. |
| `2026-08-26` | activity-deadline test (RED) | failed as expected | Fixed wall timeout returned `{ aborted: true }` despite intervening output. |
| `2026-08-26` | same activity-deadline test (GREEN) | passed | Intervening app-server activity extends the inactivity deadline. |
| `2026-08-26` | automatic restart/resume event test (RED) | failed as expected | Recovery event lacked the `automatic_recovery` marker. |
| `2026-08-26` | same automatic recovery test (GREEN) | passed | Inactive active turn is reconciled, interrupted, force-restarted, resumed, and marked. |
| `2026-08-26` | stale-turn activity test (RED) | failed as expected | A notification for another thread postponed the current turn's recovery deadline. |
| `2026-08-26` | same stale-turn activity test (GREEN) | passed | Activity is now scoped by thread and turn identity. |
| `2026-08-26` | `pnpm --filter happy exec vitest run --project unit src/codex/codexAppServerClient.test.ts -t <new recovery cases>` | passed | 7 selected client lifecycle and compatibility tests passed. |
| `2026-08-26` | `pnpm --filter happy exec vitest run --project unit src/codex/codexUserMessageRouter.test.ts` | passed | 6 tests passed. |
| `2026-08-26` | `pnpm --filter happy exec vitest run --project unit src/utils/MessageQueue2.test.ts` | passed | 22 tests passed, including separate ordered client-ID deliveries. |
| `2026-08-26` | `pnpm --filter happy typecheck` | passed | Happy CLI TypeScript check passed. |
| `2026-08-26` | `pnpm --filter happy exec vitest run --project unit src/codex src/utils/MessageQueue2.test.ts` | baseline failure | 162/167 passed. Five Windows-only baseline failures: two sandbox assertions whose production path is explicitly non-Windows, and three POSIX-path image-cache assertions. No feature diff touches those implementation paths. |
| `2026-08-26` | `pnpm --filter happy test` | baseline failure | CLI build and declaration bundles passed; unit run passed 820/854. All 34 failures are existing Windows/POSIX-assumption or packaged-ripgrep environment failures outside this diff. |
| `2026-08-26` | `git diff --check` | passed | No whitespace errors. |
| 2026-08-26 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-26 | `pnpm --filter happy-server typecheck` | failed (2) | typecheck |
| 2026-08-26 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-26 | `pnpm --filter happy-server test` | failed (1) | test |
| 2026-08-26 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-26 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-26 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-26 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| `2026-08-26` | Windows `Happy (dev)` runtime acceptance, session `cmt8wvzzqsgauzc0uobcbeej8` | passed | Built CLI and desktop were exercised through the installed Tauri client. Two messages were steered into the active turn and confirmed; a third message arriving just after `turn/completed` was queued, started in a new turn, and confirmed without manual stop or another user message. Test worktree `quick-mountain` remained clean. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Start and steer payload tests plus 0.148 runtime compatibility gate; installed-client runtime logged `turn/steer` acceptance for messages #1 and #2. |
| AC2 | verified | Router correlation test and thread-history client ID support. |
| AC3 | verified | Router ID-preserving exactly-once queue test; installed-client runtime delivered each of #1, #2, and #3 exactly once. |
| AC4 | verified | Idle/terminal reconciliation client test; runtime message #3 arrived after `turn/completed`, entered `MessageQueue2` at `01:05:09.983`, started a new turn at `01:05:10.189`, and was confirmed at `01:05:12.769`. |
| AC5 | verified | Activity-aware deadline client test. |
| AC6 | verified | Automatic interrupt/restart/resume client test. |
| AC7 | verified | Automatic recovery marker test and `runCodex` existing-protocol session-message inspection. |
| AC8 | verified | Targeted tests, CLI typecheck/build, diff check, and all workflow-core checks pass; unrelated Windows/environment baselines are recorded below. |

## Remaining gaps

- Full Windows unit suite has 34 pre-existing platform/environment failures;
  targeted affected suites and the CLI build/typecheck pass.
- Repository setup postinstall invokes Unix `rm` from React Native Skia on
  Windows; cached dependencies were nevertheless restored sufficiently for all
  applicable CLI checks.
- Happy Server typecheck/tests could not establish a clean environment baseline
  because Prisma generation did not complete after the Skia postinstall
  failure. There is no App or Server product diff in this task.

## Installed-client runtime acceptance

- Target: Windows `Happy (dev) 0.1.0` with locally built Happy CLI
  `1.2.1-beta.2` and Codex `gpt-5.6-sol`.
- Session: `cmt8wvzzqsgauzc0uobcbeej8`; worktree `quick-mountain`.
- Message #1: `turn/steer` was accepted in 15 ms (`01:04:29.730` to
  `01:04:29.745`); the agent confirmed it while the original turn continued.
- Message #2: `turn/steer` was accepted in 2 ms (`01:04:50.107` to
  `01:04:50.109`); the agent confirmed it before the original turn completed.
- Message #3: it arrived at the completion boundary, was queued at
  `01:05:09.983`, triggered `turn/start` at `01:05:10.189`, and received an
  explicit confirmation at `01:05:12.769` without another user action.
- The test worktree remained clean, confirming the task stayed read-only.
