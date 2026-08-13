# Validation: `studio-todo-row-v2-04`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run sources/features/studio-visual-style/studioVisualStyle.test.ts` | RED as expected | Two tests failed only because `resolveDesktopTodoRowStyle` did not exist |
| `2026-08-13` | same targeted Studio resolver command | passed | 1 file, 11 tests after minimal resolver implementation |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run sources/features/studio-visual-style/studioVisualStyle.test.ts sources/sync/projectTodos.test.ts` | passed | 2 files, 23 tests after optional component/SidebarView wiring |
| `2026-08-13` | `pnpm --filter happy-app typecheck` | passed | Optional presentation prop and host seam typecheck |
| `2026-08-13` | `git diff --check` | passed | No whitespace errors |
| `2026-08-13` | `rg -n "<ProjectTodoButton" packages/happy-app/sources --glob '*.tsx'` | passed | Four callers found; only SidebarView passes `presentationStyle` |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run` | passed | 112 files, 1107 tests |
| `2026-08-13` | `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio pnpm --filter happy-app tauri:build:dev` | passed with local signing gap | Expo export, optimized Rust build, and `.app` creation passed; configured Developer ID signing was unavailable on this Mac |
| `2026-08-13` | ad-hoc sign, verify, install, and launch `Happy (dev).app` | passed | Previous installed app backed up under `/Users/myartings/Sync/tmp/happy-studio-v2/app-backup/`; installed Studio build launched successfully |
| `2026-08-13` | compare SHA-256 of built and installed executables | passed | Both `c7a8a2e405cf0365846e557c8296b35dccc0a464e1b8355ab5cfe4e9de74c65e` |
| `2026-08-13` | `macos-window-capture` lossless installed-window capture | passed | 1470 x 873 points, 2940 x 1746 pixels, 2x scale; PNG SHA-256 `cec8b51d7aa22e92148754b58ddd4b838e7cfb2d425d75130b13862758886441` |
| `2026-08-13` | `validate_visual_evidence.py --record ... --check-paths` | passed | 3 claims, 1 reproduction screenshot, overall quality high |
| 2026-08-13 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-13 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-13 | `pnpm --filter happy-app exec vitest run` | passed | test |
| 2026-08-13 | `pnpm --filter happy-server test` | passed | test |
| 2026-08-13 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-13 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-13 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-13 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Studio sidebar Todo resolves 36/10/12/4 pt metrics and no shadow | verified | Exact resolver TDD plus installed-client reproduction screenshot |
| Existing 16 pt outer inset and hairline remain | verified | Host style inspection plus installed-client reproduction screenshot |
| Todo count, label, icon, feature flag, hit target, pressed state, accessibility, and navigation remain | verified | Bounded diff inspection and complete 1107-test Happy App suite |
| Other Todo instances and all adjacent UI remain unchanged | verified | Optional-prop caller audit, bounded diff, and reproduction screenshot |
| Default, standalone web, iOS, and Android remain unchanged | verified | Default/non-Tauri resolver tests and conditional activation inspection |
| User accepts the installed visible result | verified | User explicitly replied “通过” after reviewing the installed-client screenshot on 2026-08-13 |

## Remaining gaps

- The local preview is ad-hoc signed because the configured Developer ID certificate is unavailable on this Mac; release signing configuration was not changed.
