# Validation: `codex-desktop-active-state`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-25` | Live Happy Codex log inspection | passed | CLI received `task_started` at 23:21:13, set `thinking=true`, and had no completion before the Desktop-side investigation. |
| `2026-08-25` | Source-shape comparison | corrected | CLI persists a direct session envelope, but `normalizeRawMessage` mutates it into the canonical wrapper before lifecycle detection. The initial parser-mismatch hypothesis was rejected before production edits. |
| `2026-08-25` | `pnpm --filter happy-app exec vitest run sources/sync/reducer/sessionUpdateMerge.test.ts` | RED | Failed because the merge boundary did not exist; this captured the missing behavior before production code was added. |
| `2026-08-25` | `pnpm --filter happy-app exec vitest run sources/sync/reducer/sessionUpdateMerge.test.ts` | passed | GREEN: 1 regression test passed. |
| `2026-08-25` | `pnpm --filter happy-app exec vitest run sources/sync/reducer/sessionUpdateMerge.test.ts sources/sync/typesRaw.spec.ts` | passed | 67 tests passed after integrating the latest-session merge into `update-session`. |
| `2026-08-25` | `pnpm --filter happy-app typecheck` | failed | Regression-test metadata fixture omitted required `host`; production code emitted no reported type error. Fixture corrected before rerun. |
| `2026-08-25` | `pnpm --filter happy-app exec vitest run sources/sync/reducer/sessionUpdateMerge.test.ts && pnpm --filter happy-app typecheck` | passed | Regression test passed and TypeScript completed with no errors after correcting the fixture. |
| `2026-08-25` | `pnpm --filter happy-app exec vitest run` | passed | Complete Happy App family: 142 files and 1,270 tests passed. |
| 2026-08-25 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-25 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-25 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-25 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| `2026-08-25` | `pnpm --filter @slopus/happy-wire build` | passed | Refreshed the workspace wire build after fast-forwarding `dev` by 140 commits. |
| `2026-08-25` | `pnpm --filter happy-app exec vitest run sources/sync/reducer/sessionUpdateMerge.test.ts sources/sync/typesRaw.spec.ts` | passed | Post-merge integration: 68 tests passed, including preserved upstream `projectId` behavior. |
| `2026-08-25` | `pnpm --filter happy-app typecheck` | passed | Post-merge integration typecheck passed. |
| `2026-08-25` | `pnpm --filter happy-app exec vitest run` | failed | Latest `origin/dev` baseline: 1,506 passed and 15 unrelated UI expectation failures in ToolView/Markdown tests; none touch the session update merge scope. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| A live `thinking=true` update survives a concurrent asynchronous `update-session` decrypt | verified | `sessionUpdateMerge.test.ts` and production integration re-read the current session after decrypt. |
| Metadata and versions from `update-session` still apply | verified | `sessionUpdateMerge.test.ts`. |
| Existing lifecycle normalization remains compatible | verified | `typesRaw.spec.ts` (66 tests) and complete Happy App suite. |

## Remaining gaps

- Live multi-device Desktop observation requires a rebuilt client and is outside this non-deployment slice.
- The latest integrated `dev` baseline has 15 unrelated ToolView/Markdown UI test failures; targeted session tests and Happy App typecheck pass.
