# Context: `workspace-project-picker-discoverability`

## Goal

Keep workspace-project discovery visible and usable when the selected Windows
machine has many recent project paths.

## Accepted scope

- Keep the custom path input unchanged.
- Render the Workspace Projects search control and discovery status above the
  scrollable project list so they are visible when the picker opens.
- Show at most five Recent entries initially, with an explicit control to show
  or collapse the remaining Recent entries.
- Make the constrained desktop/web result region explicitly vertically
  scrollable and expose its scrollbar.
- Preserve existing project selection, discovery RPC, filtering, and path
  normalization behavior.

## Out of scope

- Multiple configurable workspace roots, including `D:\Dev`.
- A unified search/path omnibox or a separate project-browser screen.
- CLI, daemon, RPC, scanner, release, or installation changes.

## Acceptance criteria

1. The Workspace Projects search control is rendered outside and above the
   scrollable Recent/results region.
2. With more than five Recent entries, only five are initially shown and the
   hidden count is available to the disclosure control.
3. Showing all Recent entries and collapsing them again preserves order.
4. The embedded desktop/web result region has a bounded height and explicit
   vertical scrolling.
5. Existing workspace discovery tests and Happy app type checking pass.

## Implementation and verification context

- See `contexts/implement.jsonl` and `contexts/check.jsonl`.
