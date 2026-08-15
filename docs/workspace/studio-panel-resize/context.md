# Context: `studio-panel-resize`

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

## Notes

- Child Track A of the parent `studio-visual-convergence` batch.
- Base commit: `d54c2fea` (contains parent Batch 0 contract; descendant of accepted
  integration baseline `b0307c71`).
- Isolated branch/worktree: `feature/studio-panel-resize` at
  `/Users/myartings/workspace/happy/.dev/worktree/studio-panel-resize`.
- Product writes are limited to the new `features/studio-panel-resize/**`
  module, `SidebarNavigator.tsx`, `SessionView.tsx`, and the minimum
  `localSettings.ts`/test seam.
- Parent owns merging, packaged build, fixed-size screenshots, and user visual
  acceptance. This child does not push or merge.
