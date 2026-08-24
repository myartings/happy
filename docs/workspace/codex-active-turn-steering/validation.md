# Validation: `codex-active-turn-steering`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-24` | `codex app-server generate-ts --out <temp>` | passed | Stable Codex 0.148.0 schema includes `turn/steer` with an expected-turn precondition. |
| `2026-08-24` | `pnpm --filter happy exec vitest run --project unit src/codex/codexAppServerClient.test.ts` (RED) | failed as expected | `client.steerTurn is not a function`. |
| `2026-08-24` | same targeted client test (GREEN) | passed | 21 client tests passed after adding the steering request. |
| `2026-08-24` | targeted client expected-turn test (RED) | failed as expected | Request used the replacement turn instead of the caller's snapshotted turn ID. |
| `2026-08-24` | same expected-turn test (GREEN) | passed | Explicit expected turn is preserved in the request. |
| `2026-08-24` | `pnpm --filter happy exec vitest run --project unit src/codex/codexUserMessageRouter.test.ts` (RED) | failed as expected | Routing module did not exist. |
| `2026-08-24` | active `/clear` routing test (RED) | failed as expected | `/clear` was initially steered instead of isolated. |
| `2026-08-24` | router suite (GREEN) | passed | 4 tests cover active steering, rejection fallback, clear isolation, idle/control queueing. |
| `2026-08-24` | `pnpm --filter happy typecheck` | passed | Happy CLI TypeScript check passed. |
| `2026-08-24` | `pnpm --filter happy exec vitest run --project unit src/codex` | passed | 18 files, 131 tests passed. |
| `2026-08-24` | `pnpm --filter happy test` | passed | Full Happy CLI build and unit suite: 90 files, 829 tests passed. |
| 2026-08-24 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-24 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-24 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-24 | `pnpm --filter happy-server test` | passed | test |
| 2026-08-24 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-24 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-24 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-24 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| `2026-08-24` | baseline hash comparison against `origin/dev` | passed | Both failing Studio tests and their source files exactly match `origin/dev`; this branch has no Happy App diff. |
| `2026-08-24` | two failing Happy App tests rerun directly | baseline failure | 2 of 6 assertions fail identically: missing ChatList drag handler and stale Markdown selectable source assertion. Unrelated to Codex steering. |
| `2026-08-24` | final `pnpm --filter happy typecheck` plus targeted steering suites | passed | Typecheck passed; 2 files and 25 steering/client tests passed after API tightening. |
| `2026-08-24` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Client test asserts `turn/steer`, thread ID, and snapshotted expected turn ID. |
| AC2 | verified | Router success test proves no queue call after steering. |
| AC3 | verified | Router rejection test proves one steer attempt and one queue insertion. |
| AC4 | verified | Router tests preserve idle, host-control, and active `/clear` queue behavior. |
| AC5 | verified | Client payload includes `localImage`; router preserves original attachments on fallback. |
| AC6 | verified | Full CLI suite, CLI typecheck, server checks, workflow core checks, and diff check pass. |

## Remaining gaps

- The repository-wide Happy App suite has two pre-existing Studio test failures.
  The failing tests and their source files hash-identically match `origin/dev`,
  this feature has no App diff, and the Desktop build/typecheck path is unaffected.
