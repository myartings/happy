# Context: `studio-interaction-states`

## Goal

Deliver Studio-only coherent light/dark sidebar and overlay surfaces with visible desktop hover, press, focus, selected, and keyboard-navigation states.

## Current status

The accepted Studio sidebar and overlay geometry is present on local `dev` at `f6617997`. Overlay colors already branch on `theme.dark`, but sidebar surface/selection colors are light-only and several existing Pressables expose only pressed or selected feedback.

## Constraints

- Preserve all existing behavior and accepted Command Palette geometry.
- Default style, standalone Web, iOS, and Android stay unchanged.
- Use the existing Unistyles theme signal; do not introduce global theme infrastructure.
- Work only in the isolated assigned worktree and product ownership; parent owns integration.

## Evidence links

- PRD: `none` (bounded continuation of the accepted Studio visual design)
- Spec: `docs/specs/studio-interaction-states.md`
- Tasks: `docs/tasks/studio-interaction-states-tasks.md`
- Tracker: `none` (local-only delegated visual slice; parent workflow is the human-visible coordination boundary)

## Next action

Pass acceptance/decision/scoping/risk gates, then implement T1 presentation contracts.
