# Studio v2 Implementation Proposal 05 — Compact Section Headers

## Status

Approved by the user on 2026-08-13.

## One visible improvement

Compact only the packaged-desktop Studio sidebar's first-level session-list
section headers so they form a quieter hierarchy with the accepted 62 pt rich
session rows.

## Included

- Use 12 pt type with 16 pt line height and medium-equivalent 500 weight.
- Use 18 pt horizontal padding, 14 pt top padding, and 6 pt bottom padding.
- Apply the same presentation to existing first-level headers such as today,
  earlier, needs-attention, archive/history, and projects headings.
- Preserve every title string, item order, visibility rule, search behavior,
  scrolling, list virtualization, and session/project rendering.
- Default, standalone web, iOS, and Android retain their current presentation.

## Explicitly excluded

- No new overflow menu or ellipsis action from the Pencil design.
- No project-card header, session-row, Todo, top-control, Settings, sidebar
  frame, main-content, data, or interaction changes.

## Acceptance

Build and install the real Happy (dev) Studio preview. The user reviews only
the section-header density and its relationship to the accepted session rows,
then explicitly accepts or rejects it before any sixth slice.
