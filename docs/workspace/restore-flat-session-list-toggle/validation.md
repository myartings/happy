# Validation: `restore-flat-session-list-toggle`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-24` | `pnpm --filter happy-app exec vitest run sources/utils/flatSessionListPreferenceWiring.test.ts --reporter=dot` | RED: failed 2/2 | Both failures identified the intended missing switch and forced runtime value. |
| `2026-08-24` | `pnpm --filter happy-app exec vitest run sources/utils/flatSessionListPreferenceWiring.test.ts --reporter=dot` | passed 2/2 | GREEN after restoring both wiring seams. |
| `2026-08-24` | `pnpm --filter happy-app exec vitest run sources/utils/flatSessionListPreferenceWiring.test.ts sources/sync/localSettings.test.ts sources/utils/flatSessionList.test.ts --reporter=dot` | passed 21/21 | Focused regression plus nearest preference and row-building coverage. |
| `2026-08-24` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed with no errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Features settings visibly expose the Flat Session List switch. | verified | Focused wiring test and source inspection. |
| Home session list reads the persisted preference. | verified | Focused wiring test rejects the forced-true implementation. |
| Existing persisted values and grouped default remain unchanged. | verified | `localSettings.test.ts` passed; production migration/default code is untouched. |
| Regression coverage protects both seams. | verified | RED then GREEN evidence above. |

## Remaining gaps

- None for the bounded fix.
