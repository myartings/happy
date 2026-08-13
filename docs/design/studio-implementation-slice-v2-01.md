# Studio v2 Implementation Proposal 01 — Desktop Style Seam and Sidebar Frame

## Status

Awaiting explicit user approval. This document does not authorize code changes.

## One visible improvement

Implement only the accepted v2 desktop sidebar frame and its Studio activation
seam. At the 1470×870 packaged-desktop review window, the sidebar should render
at 316 pt with the v2 near-white Region surface, a single hairline boundary,
and the existing Happy controls/content otherwise unchanged.

## Included

- Add the minimum packaged-desktop-only `Default` / `Studio` style seam needed
  to persist and preview this one change.
- Keep the existing responsive behavior, but make the Studio width resolve to
  316 pt at the named 1470×870 review state instead of hard-coding one width for
  every window.
- Apply the accepted v2 sidebar/canvas boundary: quiet near-white Region against
  a white Canvas with one restrained divider.
- Preserve current traffic lights, zen/back/forward controls, new-session,
  archive, Todo, session grouping, rows, footer, actions and navigation logic.
- Keep the visual-style implementation in a Studio-owned module with only a
  narrow host seam in the official components.

## Explicitly excluded

- 62 pt rich-session-row redesign, selected-row styling, typography and metadata
  hierarchy; those require a later separate proposal.
- Conversation header, reading column, messages, tools, composer, popovers,
  dark appearance, Windows-specific chrome, mobile and standalone web.

## Why this is first

It establishes the desktop-only style boundary and validates the overall
sidebar/main proportion without simultaneously changing complex session-row
content. The host diff remains small and easier to reconcile with upstream.

## Expected review result

Build the real packaged macOS client at 1470×870 and capture the same populated
conversation state. The visible acceptance question is only whether the 316 pt
sidebar, Region/Canvas surfaces and divider match v2 while all Happy behavior
and internal components remain unchanged. Stop for user acceptance before any
second proposal.
