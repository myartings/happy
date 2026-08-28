# Hardware Keyboard Enter-to-Send

## Outcome

On the native Apple client, a focused Happy composer treats an unmodified
Return from an attached hardware keyboard as Send while preserving the current
software-keyboard behavior and Shift+Return newline behavior.

## Scope

- Existing-session `AgentInput` composers on iOS/iPadOS.
- New-session prompt composers on iOS/iPadOS.
- A narrow app-local native keyboard-command view that participates in the
  focused text input's responder chain.
- The existing send validation and message/session creation paths.

## Non-goals

- Changing software-keyboard Return, newline, or send-button behavior.
- Changing Web, desktop, or Android keyboard behavior.
- Adding Cmd+Return or Ctrl+Return shortcuts.
- Detecting or persisting whether a hardware keyboard is connected.
- Changing session, message, or settings protocols.

## Observable behavior

1. With a Happy composer focused on iOS/iPadOS, unmodified hardware Return
   invokes the same send action as the visible send button and does not insert
   a newline.
2. Hardware Shift+Return is not intercepted and continues through the native
   multiline text input as a newline.
3. Software-keyboard input is not intercepted by the hardware-keyboard command
   view and retains its current behavior.
4. While marked text is active for an IME, hardware Return remains available to
   the text system and does not trigger Happy's send action.
5. When autocomplete suggestions are visible in an existing session, hardware
   Return selects the current suggestion instead of sending.
6. Empty, blocked, disabled, attachment-only, and active-turn submissions retain
   the same rules as pressing the existing send button.
7. The native integration is local to `packages/happy-app/modules/`; generated
   `packages/happy-app/ios/` content is not edited manually.

## Compatibility and fallback

- The hardware command is Apple-only. Other platforms render a transparent
  React wrapper and retain their existing keyboard behavior.
- If the native view is unavailable in a non-native runtime, the composer still
  renders and the existing send button remains usable.
- Removing the native wrapper restores the exact prior behavior without data or
  schema migration.

## Risk controls

- Blast radius is limited to Apple-native composers while their text input is
  first responder; there is no data, authentication, protocol, or server change.
- The command must be declared with priority over text input so unmodified
  hardware Return cannot both send and insert a newline.
- The command must be unavailable while marked text exists, while Shift or any
  other modifier is held, or when the wrapped composer is not in the responder
  chain.
- Generated `packages/happy-app/ios/**` and `android/**` files are read-only for
  this feature. Expo autolinking must discover the local module from source.
- Stop implementation if the local view cannot join the focused input's native
  responder chain without replacing the existing `TextInput`.
- Stop release if Return, Shift+Return, and CJK marked-text behavior have not
  been exercised on a physical iPad with an attached keyboard.
- Rollback is removal of the wrapper integration and local module; no stored
  state or migration requires reversal.

## Acceptance criteria

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | Unmodified hardware Return sends from an existing iPad session without adding a newline. | Focused policy/component tests plus physical-iPad smoke test |
| AC2 | Hardware Shift+Return inserts a newline and does not send. | Native command inspection plus physical-iPad smoke test |
| AC3 | Software-keyboard behavior is unchanged. | Native command contract inspection plus physical-iPad smoke test |
| AC4 | Marked-text confirmation is not intercepted. | Native policy test/inspection plus CJK IME smoke test |
| AC5 | Autocomplete Return selects a suggestion before any send. | Focused handler test or deterministic source seam plus iPad smoke test |
| AC6 | New-session hardware Return uses the existing guarded start flow. | Focused wiring test plus iPad smoke test |
| AC7 | Web, desktop, and Android behavior are unchanged. | Typecheck, focused tests, whole-diff review |
| AC8 | No generated native project files or external protocol contracts change. | `git diff --name-only` and whole-diff review |

## Accepted uncertainty

Automated JS and Swift checks cannot prove UIKit responder-chain delivery on the
user's keyboard and IME. Physical-iPad validation is therefore a required
release signal; absence of that signal must be reported as a remaining gap and
must not be described as verified behavior.
