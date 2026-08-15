# Validation: `studio-panel-resize-interaction-projection`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/features/studio-panel-resize/studioPanelResizePolicy.test.ts sources/sync/localSettings.test.ts` | RED (expected) | Closed-loop drag reprojected backward to 259/341, keyboard target helper absent, and active-side persistence default absent: 4 intended failures. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/features/studio-panel-resize sources/sync/localSettings.test.ts --testTimeout=15000` | pass | Final focused family: 5 files / 33 tests, including real handle event → stored target → joint projection loops and wide-window max bounds. |
| `2026-08-14` | `pnpm --filter happy-app typecheck` | pass | No diagnostics. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run --testTimeout=15000` | pass | Full app suite: 135 files / 1203 tests. |
| `2026-08-14` | `git diff --check` | pass | No whitespace errors. |
| 2026-08-14 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-14 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Target and rendered width are distinct | verified | Handle props, accessibility value, and component tests exercise target 420/rendered 261. |
| Constrained left +10 drag moves rendered left from 261 to 271 | verified | Handle pointer event updates stored target; subsequent active-side joint projection asserts 271/329. |
| ArrowRight changes constrained rendered geometry | verified | Closed-loop policy and handle tests reproject keyboard target with active-side priority. |
| Reset returns intrinsic default and reallocates budget | verified | Joint loop asserts left 275/right 325 under 1200pt. |
| Collapse/reopen, restart, and window-change persistence | verified | Pure loops preserve targets through visible-only/reopen and 1200→1540 projection; local settings round-trip a non-null last active side backward-compatibly. |
| Studio Tauri-only/non-Studio unchanged | verified | Existing host activation and fallback wiring unchanged; focused wiring tests/typecheck pass. |

## Remaining gaps

- Packaged pointer feel remains parent-owned visual evidence.
