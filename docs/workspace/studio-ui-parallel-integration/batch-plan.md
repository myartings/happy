# Parallel Batch Plan

## Base and integration

- Accepted checkpoint: `fb26bb46`
- Integration branch: `feature/studio-ui-integration`
- Integration worktree: `/Users/myartings/workspace/happy/.dev/worktree/studio-ui-integration`
- Maximum active implementation sessions: 4
- Remote pushes: forbidden

## Ownership matrix

| Track | Branch | Exclusive product ownership |
| --- | --- | --- |
| A Sidebar | `feature/studio-sidebar` | `SidebarView.tsx`, `SidebarNavigator.tsx`, `SessionsList.tsx`, sidebar group/row/metadata components, `features/studio-visual-style/**` |
| B Conversation | `feature/studio-conversation-layout` | `-session/SessionView.tsx`, `components/ChatList.tsx`, `components/ChatHeaderView.tsx`, `features/studio-conversation-layout/**` |
| C Semantic text | `feature/studio-semantic-text` | `features/studio-semantic-text/**`, `components/markdown/MarkdownView.tsx`, `components/MessageView.tsx`, explicitly text-only tool presentation files |
| D Composer | `feature/studio-composer` | `components/AgentInput*.tsx`, `features/studio-composer/**` |
| E Overlays/pages | `feature/studio-overlays-pages` | overlay primitives, menus, palette, selectors, sheets, representative settings/session subpages, `features/studio-overlays/**` |
| Integration | `feature/studio-ui-integration` | merges, conflict resolution, build/install, screenshots, validation evidence; no independent redesign |

## Shared-file rules

- Only Track A may edit `features/studio-visual-style/studioVisualStyle.ts`.
- Tracks B–E may import its public resolver but create their own region-local
  styling modules.
- No child edits the accepted checkpoint spec/task/design files.
- If an unexpected product file is required outside the allowlist, stop and
  record the request; do not silently cross ownership.
- Child workflows use distinct slugs. During merge, preserve the integration
  branch's `docs/workspace/ACTIVE.md` and retain all child evidence elsewhere.

## Merge order

`semantic text -> conversation -> composer -> sidebar -> overlays/pages`

Semantic text lands before conversation because it defines text roles consumed
inside the conversation region. Overlays land last because they touch the widest
set of shared interaction primitives.

## Human visual gate

Passing tests allows a child commit to enter the integration branch. It does not
constitute visual acceptance. The integration owner captures one comparable
screenshot group per region and asks the user to accept or request revision.

## Revision batch 3 — user-directed visual corrections

The first integrated screenshot pass produced two explicit revision directions.
They remain independent and may run concurrently in their original isolated
worktrees:

| Track | Revision | Product boundary | Stop condition |
| --- | --- | --- | --- |
| A Sidebar | Remove the large project-group card shell and present groups as a lightweight unboxed list. | Existing Track A ownership only. | Stop if navigation semantics, callbacks, or non-Studio paths would need to change. |
| E Command Palette | Narrow the palette, lighten the scrim, and compress header/row/internal spacing. | Command Palette and Track E regional style files only. | Stop if commands, keyboard behavior, closing, or non-Studio paths would need to change. |

Integration order is Track A then Track E. The parent reruns combined checks,
rebuilds the packaged desktop artifact, and captures the same sidebar and
Command Palette states for the next user accept/revise decision.
