# Studio v2 Implementation Proposal 06 — Tighter Session Content Alignment

## Status

Approved by the user on 2026-08-13.

## One visible improvement

Tighten only the packaged-desktop Studio session row's leading status/title and
metadata alignment so the content column starts 8 pt closer to the row edge.

## Included

- Reduce the leading status slot from 16 pt to 10 pt in Studio.
- Reduce the status-to-title gap from 8 pt to 6 pt in Studio.
- Reduce the aligned metadata inset from 24 pt to 16 pt in Studio.
- Apply the same 16 pt inset to environment, runtime/provider, and identity
  metadata variants so every secondary line remains aligned with the title.
- Preserve status colors, pulse behavior, draft/unread icons, title, pin and
  shortcut badges, metadata content, row hit target, 62 pt row height, selected
  state, navigation, context menu, and archive behavior.
- Default, standalone web, iOS, and Android retain their current presentation.

## Explicitly excluded

- No session-row height, outer inset, radius, vertical padding, typography,
  metadata content, section heading, project heading, or list behavior changes.

## Acceptance

Build and install the real Happy (dev) Studio preview. The user reviews only
the status/title/metadata left alignment, then explicitly accepts or rejects it
before any seventh slice.
