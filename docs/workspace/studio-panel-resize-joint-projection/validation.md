# Validation: `studio-panel-resize-joint-projection`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/features/studio-panel-resize/studioPanelResizePolicy.test.ts sources/features/studio-panel-resize/StudioPanelResizeHandle.test.ts sources/features/studio-panel-resize/studioPanelResizeWiring.test.ts` | RED (expected) | Joint projection export absent, two host wiring assertions failed, and reset still required stale opposite geometry: 6 intended failures. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/features/studio-panel-resize sources/sync/localSettings.test.ts` | pass | GREEN final focused family: 5 files / 29 tests. |
| `2026-08-14` | `pnpm --filter happy-app typecheck` | pass | No TypeScript diagnostics. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run --testTimeout=15000` | pass | Complete Happy App family: 135 files / 1199 tests. |
| 2026-08-14 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-14 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| 1200pt, stored 420/520, both visible uses full safe 600pt panel budget | verified | Pure policy test asserts deterministic 261/339 output. |
| Reset restores intrinsic defaults without min lock | verified | Policy and handle tests assert 275/360 targets and containable 261/339 narrow rendering. |
| Drag/keyboard remain adjustable under constrained joint layout | verified | Handle test asserts constrained 261 can request 277; policy keeps intrinsic bounds. |
| Collapse/reopen preserves stored targets | verified | Joint policy tests visible-only 300/0 projection without mutating inputs; existing persistence/wiring tests pass. |
| Studio Tauri-only and non-Studio fallback | verified | Existing host wiring plus typecheck; activation/fallback seams unchanged. |

## Remaining gaps

- Packaged drag feel remains parent integration evidence; deterministic behavior
  and host contracts are covered here.
