# Studio v2 Implementation Proposal 04 — Compact Todo Utility Row

## Status

Approved by the user on 2026-08-13.

## One visible improvement

Compact only the packaged-desktop Studio sidebar Todo utility row. The shared
Todo component already supplies the accepted 36 pt height and 10 pt radius, so
this slice preserves those values and removes the remaining oversized sidebar
instance spacing.

## Included

- Keep the labeled Todo control at 36 pt height and 10 pt radius.
- Retain one light hairline and remove any shadow/elevation in Studio.
- Keep the existing 16 pt sidebar outer inset.
- Tighten Studio horizontal content padding from the sidebar override of 14 pt
  to 12 pt and icon/label/count gap from 5 pt to 4 pt.
- Preserve pending count, label, icon, hit target, pressed state, accessibility,
  feature flag, and navigation behavior.
- Default, standalone web, iOS, Android, and other `ProjectTodoButton` instances
  retain their current presentation.

## Explicitly excluded

- Top controls, project/session rows and headers, Settings, sidebar frame, main
  content, and all Todo data/behavior changes.

## Acceptance

Build and install the real Happy (dev) Studio preview. The user reviews only
the Todo row density and relationship to the accepted top controls, then
explicitly accepts or rejects it before any fifth slice.
