# Context: `studio-sidebar-convergence`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Goal

Implement Track B of the accepted Studio visual-convergence batch: quieter,
denser Studio sidebar rows and transparent resting top navigation actions while
preserving information, interaction states, callbacks, accessibility, and every
non-Studio path.

## Boundary

- Parent: `studio-visual-convergence` at shared Batch 0 commit `d54c2fea`.
- Branch/worktree: `feature/studio-sidebar-convergence` at
  `/Users/myartings/workspace/happy/.dev/worktree/studio-sidebar-convergence`.
- Allowed product files: `SidebarView.tsx`, `SessionsList.tsx`,
  `ActiveSessionsGroupCompact.tsx`, `ProjectGroup.tsx`, and
  `features/studio-visual-style/**` except panel/frame width ownership.
- Packaged Tauri Desktop with Studio selected only. Default, standalone Web,
  iOS, and Android remain unchanged.
- No protocol, storage, navigation, authentication, synchronization, or backend
  behavior changes.

## Verification strategy

- Resolver tests prove Studio values and non-Studio gating.
- Source-wiring tests prove ordinary and compact rows consume the regular title
  typography and all three top actions retain callbacks and accessibility.
- Existing Studio interaction tests protect hover, focus, selected, and pressed
  semantics.
- Happy App typecheck and repository workflow checks cover integration.
