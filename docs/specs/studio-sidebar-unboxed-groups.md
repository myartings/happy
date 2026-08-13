# Studio Sidebar Unboxed Groups

## Goal

Make Studio sidebar project/session groups read as a lightweight continuous
list instead of large white cards, without changing the sidebar's functional
information architecture or interaction behavior.

## Scope

- Packaged-desktop Studio active-session groups and project/workspace groups.
- Group container and project-header surface treatment only.
- A shared, testable presentation decision used by both group renderers.

## Non-goals

- Reordering sections, projects, workspaces, or sessions.
- Changing row height, metadata, selected-row fill, callbacks, navigation,
  collapse/favorite controls, context menus, or mobile gestures.
- Changing Default theme, standalone web, iOS, or Android presentation.
- Claiming visual acceptance before the integrated desktop screenshot is
  reviewed by the user.

## Observable behavior

- Studio groups have no white group background, enclosing corner radius,
  outline, shadow, or clipped card boundary.
- Studio project headers sit directly on the sidebar background instead of a
  separate white rounded surface.
- Selected session rows retain their existing fill-only highlight; unselected
  rows remain transparent.
- Default and non-Tauri clients retain the existing card presentation.

## Acceptance-to-evidence map

| Criterion | Evidence |
| --- | --- |
| Studio resolves to unboxed group presentation | Focused presentation-policy unit test |
| Default and non-Tauri paths resolve to card presentation | Focused presentation-policy unit test |
| Both active-session and project/workspace renderers consume the shared presentation decision | Source/diff inspection plus Happy App typecheck |
| Functional layout and controls remain unchanged | Whole-diff review |
| Integrated result has the intended visual weight | Parent-owned packaged-desktop screenshot and explicit user review |
