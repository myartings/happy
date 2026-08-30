# Decisions: `hardware-keyboard-enter-send`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Should the app detect hardware-keyboard connection state? | resolved | No. Apple `UIKeyCommand` is generated only for attached hardware keyboards, so the event path provides the boundary without persistent state. |
| D2 | Should Return behavior be changed through React Native `onKeyPress`? | resolved | No. RN 0.83 exposes only `key`, and JS cancellation cannot synchronously override UIKit text insertion. |
| D3 | How is Shift+Return preserved? | resolved | Register only an unmodified Return command. Shift+Return does not match and falls through to the existing multiline input. |
| D4 | How is software-keyboard behavior preserved? | resolved | Keep current `TextInput` submit/newline props unchanged; use a hardware-only native command view. |
| D5 | Third-party library or local native seam? | resolved | Use an app-local Expo module. The evaluated external-keyboard wrapper reports modifiers but always continues native propagation, so it cannot prove newline suppression before the JS event. |
| D6 | How is IME composition protected? | resolved | The native command is unavailable while a descendant first responder reports a non-null `markedTextRange`. |
