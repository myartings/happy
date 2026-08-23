# Validation: `restore-grouped-session-list-default`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-23` | `pnpm --filter happy-app exec vitest run sources/sync/localSettings.test.ts` | RED then passed | RED proved persisted `flatSessionList: true` remained enabled; GREEN passed 14/14 after the one-time migration. |
| `2026-08-23` | `pnpm --filter happy-app exec vitest run sources/sync/localSettings.test.ts sources/utils/flatSessionList.test.ts sources/utils/activeSessionRuntimeStatusWiring.test.ts sources/hooks/useVisibleSessionListViewData.test.ts` | passed | 41/41 related settings, list, status, and visibility tests passed. |
| `2026-08-23` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed without errors. |
| `2026-08-23` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| New installations use grouped compact layout | verified | `localSettingsDefaults.flatSessionList` regression and source inspection. |
| Existing persisted flat-list default migrates back once | verified | `localSettingsParse({ flatSessionList: true })` regression. |
| A later explicit flat-list opt-in remains respected | verified | Marker-present parse regression. |

## Remaining gaps

- Installed-client visual smoke remains mandatory after merge and Manager rebuild.
