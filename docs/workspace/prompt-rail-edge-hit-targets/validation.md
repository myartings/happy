# Validation: `prompt-rail-edge-hit-targets`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run sources/utils/sessionPromptHistory.test.ts sources/utils/messageTarget.test.ts sources/utils/webMessageReveal.test.ts` | passed | 3 files, 13 tests passed. |
| `2026-08-10` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed with no errors. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run` | passed | Full app suite: 102 files, 1030 tests passed. Expected negative-fixture stderr remained unchanged. |
| `2026-08-10` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| The older arrow does not extend its hit target downward into the track. | verified | Geometry test asserts `bottom: 0`. |
| The newer arrow does not extend its hit target upward into the track. | verified | Geometry test asserts `top: 0`. |
| Both arrows retain outward and horizontal hit-target expansion. | verified | Geometry test asserts 8px on outer, left, and right edges. |

## Remaining gaps

- Installed desktop interaction remains to be checked after publication and build.
