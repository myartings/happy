# Studio UI Parallel Integration

## Goal

Apply the accepted Codex-derived Studio visual language to Happy Desktop while
preserving Happy's functional information architecture and keeping upstream
merge seams small.

## Scope

The implementation is split into five independently owned visual regions:

1. Sidebar hierarchy and density.
2. Conversation canvas, header, message measure, and vertical rhythm.
3. Semantic text hierarchy inside messages and tool output.
4. Composer shell, attachments, autocomplete, and controls.
5. Floating overlays, context menus, command surfaces, and secondary pages.

The integration branch owns merges, conflict resolution, the runnable desktop
build, screenshot evidence, and the user acceptance loop. It does not redesign
Happy's navigation model or move features between regions.

## Acceptance criteria

- AC1: Each region has an exclusive file allowlist and does not edit another
  region's owned files.
- AC2: Studio styling remains desktop-only and leaves mobile behavior intact.
- AC3: Happy's existing functional layout and navigation remain recognizable;
  detailed component size, spacing, type, surfaces, borders, and interaction
  states may change to match the accepted Studio design.
- AC4: Every child branch passes focused tests, Happy app typecheck, and a
  whole-diff review before integration.
- AC5: The integration branch preserves its own `docs/workspace/ACTIVE.md`
  pointer while retaining child workflow evidence under distinct slugs.
- AC6: A single integration build produces comparable screenshots for each
  completed region; visual acceptance is decided by the user, not inferred
  from passing tests.
- AC7: Rejected visual batches are revised within their owning branch before
  the next unrelated visual expansion is accepted.
- AC8: No child or integration session pushes to a remote.

## Non-goals

- Mobile styling.
- Functional navigation redesign.
- Backend or protocol changes.
- A one-shot claim that the entire visual redesign is complete.

## Visual acceptance loop

`regional batch -> focused verification -> integration merge -> one desktop build -> region screenshots -> user accept/revise -> next batch`
