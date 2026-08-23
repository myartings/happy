# Validation: `active-session-runtime-status-label`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-23` | initial focused wiring test | unavailable | New worktree had no dependencies; Vitest executable was absent, so this was setup drift and not counted as RED. |
| `2026-08-23` | `pnpm install --frozen-lockfile` | passed | Installed the exact workspace lockfile dependencies. |
| `2026-08-23` | `pnpm --filter happy-app test --run sources/utils/activeSessionRuntimeStatusWiring.test.ts` | RED | One test failed because the compact row contained no `status.running` mapping or rendered status label. |
| `2026-08-23` | focused wiring plus existing resolver tests | passed | 6/6 tests pass: 2 compact-row wiring checks and 4 state-precedence checks. |
| `2026-08-23` | `pnpm --filter happy-app typecheck` | passed | TypeScript completes with no errors after using the same disconnected `activeAt` invariant as the historical row. |
| `2026-08-23` | `pnpm --filter happy-app test --run` | passed with accepted baseline gaps | New wiring tests pass. The known Studio sidebar source-string assertion still fails; blob encryption failed only under full-suite concurrency. |
| `2026-08-23` | JSON reporter full-suite confirmation | baseline gaps confirmed | 1307/1317 tests passed; failures were 9 blob cases plus the one known Studio assertion, with no failure in changed behavior. |
| `2026-08-23` | `pnpm --filter happy-app test --run sources/encryption/blob.test.ts` | passed | 9/9 passed in isolation, confirming the full-suite blob failures are concurrency-sensitive rather than caused by this UI patch. |
| `2026-08-23` | focused tests and typecheck after unread-color review fix | passed | 6/6 tests and TypeScript pass; runtime text retains the true state color while unread attention remains on the existing dot. |
| `2026-08-23` | focused idle-color regression test | RED | The new third wiring assertion failed because the compact row had no waiting-specific status text color. |
| `2026-08-23` | first idle-color GREEN attempt | failed test cleanup | The new idle-color assertion passed, while an older assertion still required the replaced inline `baseStatus.color`; no production defect was observed. |
| `2026-08-23` | `pnpm --filter happy-app test --run sources/utils/activeSessionRuntimeStatusWiring.test.ts sources/utils/sessionRuntimeStatus.test.ts` | passed | 7/7 tests pass after updating the superseded wiring assertion. |
| `2026-08-23` | `pnpm --filter happy-app typecheck` | passed | TypeScript completes with the waiting label using the existing secondary indicator color. |
| `2026-08-23` | `pnpm --filter happy-app test --run --reporter=json --outputFile=<temp>` | passed with accepted baseline gap | 1317/1318 tests passed across 451 suites; the only failure is the previously accepted unrelated `studioSidebarWiring.test.ts` source assertion. All three compact-row wiring tests and all blob tests passed. |
| `2026-08-23` | `python3 scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption valid. |
| `2026-08-23` | `python3 scripts/test-workflow-core.py` | passed | 14/14 tests passed in 24.446 seconds. |
| `2026-08-23` | `python3 scripts/test-workflow-ci.py` | passed | 14/14 tests passed in 55.469 seconds. |
| `2026-08-23` | `python3 scripts/workflow-audit.py --strict --require-active active-session-runtime-status-label` | passed with expected future gaps | Strict audit reports only the pending check, review, and finish gates. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Compact active rows render localized labels for all four runtime states | verified | 3 compact-row wiring tests pass in isolation and in the full App suite. |
| Label is independent of optional runtime metadata setting | verified | Wiring test proves the label precedes and is outside the optional runtime metadata block. |
| Existing state signals and protocol remain unchanged | verified | Whole-diff inspection confirms changes are limited to compact-row presentation, a source-wiring test, and workflow evidence. |
| Idle text matches the existing waiting indicator color | verified | RED/GREEN regression proves waiting selects `theme.colors.textSecondary`; focused and full App tests pass. |

## Remaining gaps

- Installed-client smoke pending after merge and Manager refresh.
- The full App suite retains the previously accepted unrelated Studio sidebar
  source-wiring baseline failure; 1317/1318 tests pass in this worktree.

## Review

- Whole-diff review passed with no remaining finding. The Idle label now uses
  the same secondary theme color as the unchanged waiting indicator. Thinking,
  permission-required, disconnected, unread attention, draft indicators, and
  status derivation remain unchanged.
