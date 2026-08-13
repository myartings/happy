# Studio v2 Implementation Proposal 03 — Compact Top Controls

## Status

Approved by the user on 2026-08-13.

## One visible improvement

Compact only the packaged-desktop Studio sidebar's New Session and archive
control group so it matches the accepted v2 geometry.

## Included

- New Session control height: 38 pt.
- Archive control frame: 38 × 38 pt.
- Both controls use 10 pt radius, one light hairline, and no shadow.
- Tighten the icon/text gap and the gap between the two controls.
- Preserve the complete existing click targets, keyboard shortcut, archive
  visibility/selected state, labels, icons, and navigation behavior.
- Reuse the packaged-desktop-only Studio resolver. Default, standalone web,
  iOS, and Android keep their current presentation.

## Explicitly excluded

- Todo, project and session headers, session rows, sidebar frame, Settings,
  main conversation, messages, tools, composer, and all behavior/data changes.

## Acceptance

Build and install the real Happy (dev) Studio preview. The user reviews only
the New Session/archive size, shape, border, and spacing, then explicitly
accepts or rejects the result before any fourth slice.
