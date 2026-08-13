# Validation: `studio-sidebar-frame-v2-01`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-12` | `pnpm --filter happy-app exec vitest run sources/features/studio-visual-style/studioVisualStyle.test.ts` | RED as expected | Failed only because `./studioVisualStyle` did not yet exist |
| `2026-08-12` | `pnpm --filter happy-app exec vitest run sources/features/studio-visual-style/studioVisualStyle.test.ts sources/sync/localSettings.test.ts` | passed | 2 files, 16 tests |
| `2026-08-12` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed with no errors |
| `2026-08-12` | `git diff --check` | passed | No whitespace errors |
| `2026-08-12` | `pnpm --filter happy-app exec vitest run` | passed | Complete applicable Happy App family: 112 files, 1101 tests |
| `2026-08-12` | `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio pnpm --filter happy-app tauri:build:dev` | passed with local-signing gap | Frontend export and optimized release binary completed; bundle signing failed because the configured Bulka, LLC Developer ID is unavailable on this machine |
| `2026-08-12` | `codesign --force --deep --sign - --identifier com.slopus.happy.dev <bundle>` | passed | Local review bundle verified with identifier `com.slopus.happy.dev` and ad-hoc signature |
| `2026-08-12` | install and launch `/Applications/Happy (dev).app` | passed | Rebuilt Studio preview is running from the installed application bundle; prior development bundles remain recoverable under `/Users/myartings/Sync/tmp/happy-studio-v2/app-backup/` |
| `2026-08-12` | `macos_window_capture.py capture --owner 'Happy (dev)' ...` | unavailable | Window identity was unambiguous, but macOS `screencapture` rejected both window-ID and exact-rect capture; no screenshot was fabricated or resized |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Default sidebar formula remains unchanged | verified | Resolver test asserts 1470→360 and Default surfaces |
| Studio resolves 316 pt at 1470 | verified | Resolver test asserts exact accepted frame |
| Studio remains responsive | verified | Resolver test covers 900→250 and 1800→360 clamps |
| Standalone web/mobile remain Default | verified | Non-Tauri resolver test |
| Device-local persistence is backward compatible | verified | Local settings tests cover default and older settings |
| Packaged desktop renders accepted visible result | verified | User explicitly replied `通过`; rebuilt Studio preview is installed and running. Screenshot automation is unavailable on the current macOS permission channel, so user inspection is the authoritative visual evidence for this slice |

## Remaining gaps

- The configured Developer ID is unavailable locally, so this review build uses
  an ad-hoc signature. This does not validate release signing.
- Automated window capture is unavailable on the current macOS permission
  channel. The user explicitly accepted the visible result; there is no stored
  pixel baseline for this slice.
