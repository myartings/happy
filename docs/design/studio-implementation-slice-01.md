# Studio Implementation Proposal 01 — Desktop Sidebar Frame

## Status

Superseded by the accepted v2 design. Do not implement this 275 pt proposal.

## One visible improvement

This proposal targeted the accepted v1 but no longer matches v2. V2 preserves
Happy's richer session information and uses a 316 pt reference sidebar rather
than a Codex-like 275 pt shell.

## Included

- Add the minimum desktop-only `Default` / `Studio` visual-style seam needed to
  preview and persist this change without affecting standalone web or mobile.
- In `Studio`, set the 1470 px reference-window sidebar to 275 px while keeping
  bounded responsive behavior for other desktop window widths.
- In `Studio` light appearance, use sidebar `#FCFCFC`, canvas `#FFFFFF`, and a
  restrained divider from the accepted `#E4E4E5` family.
- Preserve every existing sidebar control, session row, project group, action,
  navigation behavior, and desktop title-bar behavior unchanged.

## Explicitly excluded

- Session-row height, typography, avatars, metadata, selection styling, and
  project-group density.
- Header, conversation column, messages, tool cards, composer, popovers, dark
  appearance, mobile, and standalone web.

## Expected review result

No review result is expected because this proposal is superseded and must not be
implemented. See `studio-implementation-slice-v2-01.md` for the next proposal.
