# Studio v2 Implementation Proposal 07 — Whitespace-Only Period Separation

## Status

Approved by the user on 2026-08-13.

## One visible improvement

Remove the residual full-width boundary below packaged-desktop Studio active
period groups, so “Active today” and “Active earlier” are separated only by
the accepted heading spacing rather than a rule.

## Included

- Suppress the web group-shell shadow/boundary for Studio active-session period
  groups.
- Preserve the existing period headings and their current vertical spacing.
- Preserve session order, row geometry, selected state, metadata, scrolling,
  navigation, context menu, and archive behavior.
- Default, standalone web, iOS, and Android retain their current presentation.

## Explicitly excluded

- No heading, row, top-control, Todo, sidebar-frame, settings-footer, canvas, or
  functional-layout changes.

## Acceptance

Build and install the real Happy (dev) Studio preview. The user reviews only
the whitespace-only boundary between active periods, then explicitly accepts
or rejects it before any eighth slice.
