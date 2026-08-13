# Studio Overlays and Menus — First Batch

## Status

- Accepted implementation source: the user-authorized parallel Studio visual redesign
- Parent visual contract: `docs/specs/codex-visual-theme.md`
- Reference system: `docs/design/system/studio-desktop-adoption.md`
- Target: packaged Happy Desktop (`Tauri`) with `visualStyle=studio`
- Excluded: standalone Web, iOS, Android, and Default visual style

## Scope

The first batch establishes one Studio presentation family for existing desktop
floating surfaces without changing their information architecture or behavior:

1. `FloatingOverlay` consumes a Studio-only L5 shell.
2. `SessionActionsPopover` consumes the same L5 shell and an undimmed click-away
   backdrop while retaining its existing action rows, shortcuts, positioning,
   viewport clamping, dismissal, and callbacks.
3. Command Palette removes hard-coded light colors in Studio and uses a
   theme-aware provisional L6 treatment. Its final modal geometry and motion
   remain pending matched Codex modal evidence and human visual acceptance.

## Acceptance criteria

1. Studio styling is effective only when the renderer is Tauri and the resolved
   visual style is `studio`; all other runtimes and styles preserve defaults.
2. Studio L5 uses a near-opaque theme-aware surface, visible neutral hairline,
   `17` candidate radius, and broad neutral `0 8 24` shadow.
3. Non-blocking Studio popovers do not visibly dim application content.
4. Session actions preserve row actions, destructive color, shortcut labels,
   outside-click dismissal, above/below flipping, and viewport clamping.
5. Studio Command Palette colors are theme-aware; its search, selection, hover,
   categories, keyboard behavior, command actions, and dismissal are unchanged.
6. No shared theme token, sidebar, composer, conversation, semantic-text, route,
   protocol, native-mobile, or standalone-Web behavior is modified.
7. Pure resolver and placement tests pass, Happy App typecheck passes, and the
   whole diff has no blocking review findings.
8. Visual completion is not claimed until the user reviews a packaged Studio
   comparison screenshot.

## Rollback

Remove the Studio overlay feature module and the conditional Studio style seams
from the three owned component families. Default styles remain in place and do
not depend on the new module.
