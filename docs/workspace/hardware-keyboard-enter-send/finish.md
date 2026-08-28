# Finish Review: `hardware-keyboard-enter-send`

## Summary

Implemented Apple-native hardware-keyboard Return handling for existing-session
and new-session composers. Unmodified hardware Return uses the existing guarded
send or suggestion-selection path; Shift+Return and software-keyboard Return
retain multiline behavior. A marked-text guard prevents IME candidate
confirmation from sending.

## Verification

- 11 focused policy, native-contract, fallback, and wiring tests passed.
- `happy-app` and configured `happy-server` typechecks passed.
- Expo autolinking and the podspec resolved the local module.
- The native module compiled for both iOS Simulator architectures.
- A signed `Happy Personal 1.7.0 (9)` IPA containing
  `HardwareKeyboardCommand (1.0.0)` built, installed, and launched on the
  physical iPad.
- The user confirmed hardware Return sends, Shift+Return inserts a newline,
  software-keyboard Return remains unchanged, and Chinese IME marked-text
  Return commits the candidate without sending.
- The complete app suite reported 1538 passes and 16 unrelated pre-existing
  failures, recorded in `validation.md`.

## Whole-diff review

Passed with no blocking findings. The change remains Apple-only, routes through
existing submission guards, adds no protocol or stored-state changes, and does
not include generated native project files.

## Rollback or mitigation

Remove the two composer boundary integrations, the Apple/fallback boundary
files, the pure policy, and the app-local native module. No migration or data
rollback is required. The visible send button remains available if the native
module is unavailable.

## Lessons promoted

- `CONTEXT.md`: none; behavior is fully captured by the feature spec and tests.
- `docs/ARCHITECTURE.md` or ADR: none; this is a narrow local input seam rather
  than a cross-system architecture decision.
- Skill/workflow rule: none; no repeated workflow failure was observed.

## Follow-up

- Optional physical smoke tests remain for autocomplete selection and the
  new-session composer; deterministic policy/wiring tests cover both paths.
- No commit, merge, tracker mutation, or public release was requested.
