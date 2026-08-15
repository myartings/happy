# Batch Plan: `studio-interaction-states`

## Delegation boundary

- Parent/orchestrator: `/root`, owns integration, cross-track conflict resolution, and user acceptance.
- Writer: `/root/interaction_states` in `/Users/myartings/workspace/happy/.dev/worktree/studio-interaction-states` on `feature/studio-interaction-states`.
- Base: local accepted `dev` integration at `f6617997`.
- Delivery: one local commit; no push or merge.

## Ownership

Allowed product files are the assigned sidebar components, `FloatingOverlay`, `SessionActionsPopover`, Command Palette state/color files and tests, and `features/studio-visual-style/**` plus `features/studio-overlays/**`.

Blocked: Command Palette geometry, command behavior, composer, tools, conversation/Markdown/message, routes, theme infrastructure, native projects, parent workflow, and unrelated files.

## Dependencies and conflict map

1. Serial Batch 0: establish theme/state resolver contracts and focused tests.
2. Batch 1: sidebar and overlay consumers follow those stable contracts.
3. Batch 2: combined checks, packaged screenshots, whole-diff review, one commit.

No additional writer is spawned because this delegated writer already owns both tightly coupled presentation seams; splitting the same contracts would create shared-file conflicts.

## Stop conditions

- Stop if a behavior or cross-region edit is required.
- Stop if Default/standalone Web/native presentation changes are unavoidable.
- Stop if accepted Palette geometry must move.

## Return contract

Report commit hash, changed files, exact checks, screenshot paths/states, remaining visual gaps, and a clean worktree. Parent cherry-picks in its chosen order.
