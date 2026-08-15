# Studio Interaction States

## Status and target

- Accepted source: the user approved continuing the Studio visual refinement batch on 2026-08-13.
- Runtime: packaged Happy Desktop (`Tauri`) with `visualStyle=studio`.
- Delivery: isolated writer branch `feature/studio-interaction-states`; the parent owns integration and final visual acceptance.

## Scope

Make the existing Studio sidebar and overlay family coherent in both light and dark appearance, and make existing desktop interaction states visibly distinct:

1. Resolve Studio-only light/dark sidebar surfaces and row/control state colors from the existing Unistyles dark signal.
2. Wire hover, pressed, focus, and selected states into existing sidebar controls, session rows, and project headers without changing their actions.
3. Refine Studio floating overlays, session action rows, and Command Palette input/results so light/dark surfaces and hover/focus/keyboard-selected states use one presentation family.
4. Keep the already accepted Command Palette geometry unchanged.

## Non-goals

- No command, search, navigation, selection, menu, shortcut, dismissal, animation, route, or persistence changes.
- No composer, conversation, Markdown/message, tool-call, or global theme infrastructure changes.
- No iOS, Android, standalone Web, or Default-style presentation changes.
- No edits outside the parent-assigned sidebar and overlay presentation ownership. Stop and return a gap if another region becomes necessary.

## Acceptance criteria and evidence

1. Studio Tauri resolves distinct light and dark sidebar/overlay surfaces with readable selected, hovered, pressed, and focused states. Evidence: pure resolver tests for both appearances.
2. Default style and non-Tauri paths retain their prior styles. Evidence: resolver gating tests and component conditional-style tests.
3. Compact and historical sidebar rows consume actual hover/focus/pressed/selected state, with selected and keyboard focus remaining distinguishable. Evidence: component state wiring tests plus focused source seam checks.
4. Existing Studio sidebar buttons and project headers expose visible pointer and keyboard focus feedback. Evidence: actual Pressable state callbacks or bounded source wiring tests where rendering the host is impractical.
5. Session action rows expose hover, focus, and pressed feedback; Command Palette keyboard selection and input focus consume the shared Studio overlay presentation. Evidence: component tests against actual state callbacks and focus handlers.
6. Command Palette width, height, row geometry, behavior, and close/keyboard dispatch remain unchanged. Evidence: existing Palette suites and whole-diff review.
7. Focused tests, Happy App typecheck, workflow validation/audit/CI, and whole-diff review pass. Evidence: `validation.md` receipts.
8. Packaged Tauri screenshots capture exact light, dark, hover/focus/selected, and Palette/menu states; final aesthetic acceptance remains with the parent/user.

## Rollback

Remove the Studio interaction presentation seam and Studio-only conditional state styles. Existing Default styles and behaviors remain authoritative.
