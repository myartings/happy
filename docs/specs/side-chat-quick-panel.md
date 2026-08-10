# Side Chat Quick Panel

## Problem

Happy already supports isolated side-chat sessions, but desktop users must first
enable the file-diffs sidebar, open its panel picker, and choose **New side
chat**. That makes a lightweight contextual question feel heavier than the
equivalent Codex desktop interaction.

## Scope

This personal feature changes only the desktop/web presentation and entry
points. It reuses Happy's existing side-chat spawn, context, storage, sync,
archive, fullscreen, and multi-tab behavior without changing daemon, server, or
session protocol code.

## Acceptance criteria

1. A device-local **Side Chat Quick Panel** switch appears under Personal
   Development and defaults on for the personal client.
2. When enabled on a supported wide desktop/web session, the session header
   shows a Codex-inspired right-panel toggle and an adjacent overflow menu. The
   collapsed controls are pinned to the full session header's right edge rather
   than the centered title column.
3. Opening the toggle restores an existing side chat, or creates one through
   the existing `spawnSideChat` path when none exists; a repeated click while
   open only collapses the panel.
4. Collapsing the panel does not close, archive, or kill side-chat sessions.
   Explicit tab close continues to use Happy's existing close behavior.
5. The expanded side-chat panel uses a Codex-inspired selected panel toggle,
   top tab pills, a nearby add button, and the existing fullscreen action.
6. Git Changes and All Files remain functional and are reachable from the
   overflow menu. Switching panels does not close side chats.
7. Disabling the feature restores the existing Happy file-sidebar picker and
   side-chat UI without deleting stored panel or session state.
8. Narrow/mobile layouts, side-chat context inheritance, multiple side chats,
   persistence, recovery, daemon behavior, server behavior, and protocols stay
   unchanged.
9. The panel toggle uses the Codex reference icon structure: a rounded outline
   with a right-side vertical divider. Expanded state changes the button's
   selected treatment without swapping to a different icon glyph.

## Non-goals

- Reproducing Codex's session lifecycle or storage rules.
- Changing how side-chat context is forked.
- Removing Git Changes or All Files.
- Changing Happy CLI, daemon, server, encryption, or sync contracts.
- Copying proprietary Codex assets; the implementation uses Happy-native views
  and icons to reproduce the interaction pattern.

## Verification

- Unit coverage for quick-panel visibility and toggle decisions.
- Local-settings parse/default coverage for the new switch.
- Happy app typecheck and targeted Vitest suites.
- Manual desktop inspection remains required for final pixel-level comparison.
