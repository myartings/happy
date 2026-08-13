# Studio Sidebar Unboxed Rows Follow-up

## Failure being corrected

The first unboxed-group implementation removed the explicit outer group card,
but the packaged integration screenshot still shows contiguous white session
rows, first/last group radii, and separators reconstructing the same large card.
That screenshot fails the visual acceptance criterion.

## Goal

Make the packaged-desktop Studio sidebar use one authoritative visual-style
decision from frame through every session-row renderer, and make ordinary
Studio rows incapable of rebuilding a group card through backgrounds, position
radii, clipping, or dividers.

## Acceptance criteria

- Sidebar session lists inherit the already-resolved sidebar frame visual style;
  they do not independently drift to Default inside a Studio frame.
- Ordinary unselected Studio rows have transparent wrappers and row surfaces,
  zero ordinary-row radius, no group-position radius, no clipping, and no row
  divider.
- Selected Studio rows may use the existing bounded selected fill and corner
  radius; hover/focus may use similarly local bounded affordances.
- Active compact rows, historical rows, and project/workspace rows consume the
  same tested row-chrome policy.
- Default, standalone web, iOS, and Android retain their existing card, radius,
  and divider behavior.
- Section order, row order, navigation, callbacks, context menus, swipe actions,
  metadata, and row geometry remain unchanged.
- Automated checks do not constitute visual acceptance; parent rebuilds and
  returns a same-state packaged screenshot to the user.

## Evidence map

| Criterion | Evidence |
| --- | --- |
| Studio style propagates from sidebar frame to the list | Focused visual-style input test and caller inspection |
| Ordinary Studio rows cannot recompose group cards | Focused row-chrome test for surface, radius, clipping, and dividers |
| Selected Studio fill remains bounded | Focused selected-row policy test |
| Default and non-Tauri paths remain unchanged | Focused Default/non-Tauri policy tests |
| Interaction and structural behavior remain unchanged | Whole-diff review and Happy App test family |
| Visible card is gone | Parent-owned packaged screenshot and explicit user review |
