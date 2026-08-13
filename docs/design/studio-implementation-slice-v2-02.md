# Studio v2 Implementation Proposal 02 — Desktop Session Rows

## Status

Approved by the user on 2026-08-12.

## One visible improvement

Redesign only packaged-desktop Studio session rows into the accepted 62 pt rich
row family. Keep all Happy information and behavior while removing the existing
stacked-card treatment.

## Included

- Use a 62 pt Studio row frame with compact internal spacing and a clear title,
  environment, and runtime/status hierarchy.
- Keep session title, branch/worktree, project/device, provider/model, activity,
  status, pin, draft, unread, permission, and shortcut information when the
  corresponding existing setting or state makes it visible.
- Render ordinary Studio rows transparently over the sidebar Region.
- Render the selected Studio row with a quiet `#E8EAEA` fill, 9 pt radius, no
  border, and no shadow.
- Keep the full row as the existing click/context-menu target.
- Reuse the packaged-desktop-only Studio resolver; Default, standalone web,
  iOS, and Android keep their current styles.

## Explicitly excluded

- Project headers, new/archive/Todo controls, sidebar width/background/divider,
  main conversation, messages, tools, composer, popovers, typography loading,
  dark appearance, or any session data/ordering/navigation behavior.

## Acceptance

Build and install the real Happy (dev) Studio preview. The user reviews only
row density, information readability, card removal, and selected-row treatment.
Stop before proposing or implementing another visual change.
