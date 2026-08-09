# Validation: `prompt-rail-reliable-jump`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run sources/utils/sessionPromptHistory.test.ts sources/utils/messageTarget.test.ts sources/utils/webMessageReveal.test.ts` | passed | 3 files, 12 tests passed. |
| `2026-08-10` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed with no errors. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run` | passed | Full app suite: 102 files, 1023 tests passed. Expected negative-fixture stderr remained unchanged. |
| `2026-08-10` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| A newer prompt selection cancels all scheduled reveal attempts for the previous target. | verified | `webMessageReveal.test.ts` proves the old target stops after cancellation while the new target completes all retries. |
| A current selection continues retrying long enough for a delayed virtualized row to mount. | verified | `webMessageReveal.test.ts` mounts the target on the third lookup and verifies centering. |

## Remaining gaps

- Desktop UI interaction was not manually smoke-tested; automated cancellation,
  delayed-mount, full-suite, and typecheck coverage passed.
