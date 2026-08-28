# Validation: `hardware-keyboard-enter-send`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/keyboard/hardwareKeyboardSubmitPolicy.test.ts` | failed as expected | RED: module did not exist |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/keyboard/hardwareKeyboardSubmitPolicy.test.ts sources/keyboard/hardwareKeyboardCommandContract.test.ts` | passed | 11 focused policy, native-contract, fallback, and wiring tests |
| `2026-08-28` | `pnpm --filter happy-app typecheck` | passed | no TypeScript errors |
| `2026-08-28` | `pnpm --filter happy-server typecheck` | passed | configured workflow check; no errors |
| `2026-08-28` | `pnpm --filter happy-app exec expo-modules-autolinking resolve --platform apple --json` | passed | resolves `HardwareKeyboardCommandModule` and its Pod |
| `2026-08-28` | `pod ipc spec packages/happy-app/modules/hardware-keyboard-command/ios/HardwareKeyboardCommand.podspec` | passed | valid Pod specification |
| `2026-08-28` | `pod install` in generated iOS project | passed after one retry | first attempt hit an unrelated GitHub timeout downloading `libdav1d`; retry installed 185 Pods including `HardwareKeyboardCommand (1.0.0)` |
| `2026-08-28` | `xcodebuild -workspace Happydev.xcworkspace -scheme HardwareKeyboardCommand -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build` | passed | native module compiled for arm64 and x86_64; `BUILD SUCCEEDED` |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run` | failed outside changed scope | 1538 passed, 16 pre-existing/unrelated failures in Studio presentation/wiring, a missing settings fixture, and a 1 MB encryption timeout; focused keyboard tests passed in the same run |
| `2026-08-28` | local EAS `personal` iOS build and physical iPad install | passed | Ad Hoc IPA build 9 included `HardwareKeyboardCommand (1.0.0)`; installation succeeded and the installed app reported `Happy Personal 1.7.0 (9)` |
| `2026-08-28` | physical iPad + external keyboard: Return, Shift+Return, software-keyboard Return | passed | user confirmed all three behaviors: hardware Return sends, hardware Shift+Return inserts a newline without sending, and software-keyboard Return retains its existing newline behavior |
| `2026-08-28` | physical iPad + external keyboard: CJK marked-text Return | passed | user confirmed the first hardware Return commits the pending Chinese IME candidate without sending; the following Return sends |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | focused policy/wiring tests, native module build, and user-confirmed physical-iPad hardware Return smoke test |
| AC2 | verified | empty-modifier native command contract plus user-confirmed physical-iPad Shift+Return smoke test |
| AC3 | verified | hardware-only command contract plus user-confirmed physical-iPad software-keyboard smoke test |
| AC4 | verified | marked-text responder guard contract, native build, and user-confirmed physical-iPad Chinese IME smoke test |
| AC5 | verified | deterministic policy test routes visible suggestions to the existing selection handler |
| AC6 | verified | deterministic wiring test confirms the new-session boundary calls the existing `canSend`-guarded `handleSend` flow |
| AC7 | verified | non-Apple wrapper is a fragment; policy ignores other platforms; typecheck and focused tests pass |
| AC8 | verified | local module autolinks; tracked diff contains no generated `ios/**`, `android/**`, or protocol files |

## Remaining gaps

- Autocomplete selection and new-session Return have not been exercised on the physical iPad; both are covered by deterministic policy/wiring tests and are not release-blocking under the accepted risk controls.
- The primary responder-chain delivery, no-newline consumption, Shift+Return, and software-keyboard behaviors are verified on the physical iPad.
- The complete happy-app suite is not green on this worktree for failures outside the changed scope; none of the failing files or behaviors are touched by this change.
