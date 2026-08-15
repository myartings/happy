# Studio Interaction States Tasks

## T1 — Presentation contracts

Status: complete.

- Scope: `features/studio-visual-style/**` and `features/studio-overlays/**`.
- Acceptance: theme-aware Studio-only surface/state colors resolve for light and dark; Default and non-Tauri remain inert.
- Check: focused Vitest.

## T2 — Sidebar state wiring

Status: complete.

- Depends on: T1.
- Scope: `SidebarView`, `MainView`, `SessionsList`, `ActiveSessionsGroupCompact`, and `ProjectGroup` only.
- Acceptance: existing controls/rows expose visible hover, pressed, focus, and selected states without behavior changes.
- Check: focused component/wiring Vitest.

## T3 — Overlay state wiring

Status: complete.

- Depends on: T1.
- Scope: `FloatingOverlay`, `SessionActionsPopover`, and Command Palette state/color files only.
- Acceptance: existing menu/Palette states consume the theme-aware presentation; accepted geometry and behavior remain unchanged.
- Check: focused component Vitest plus existing Palette suites.

## T4 — Package, verify, review, and return

Status: complete.

- Depends on: T2 and T3.
- Acceptance: focused tests, Happy App typecheck, workflow gates, staged CI, packaged screenshots, and whole-diff review pass; clean local commit returned to parent.
