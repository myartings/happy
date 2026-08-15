# Integration: `studio-visual-convergence`

## Shared contracts landed first

- `docs/specs/studio-visual-convergence.md`
- `docs/tasks/studio-visual-convergence-tasks.md`
- Exclusive file ownership and fixed rich-text role matrix

## Merge order

1. Track A — resizable desktop panels.
2. Track B — sidebar density and hierarchy.
3. Track C — conversation rich text.

The tracks are designed to be file-disjoint. Parent records any actual conflict
and returns semantic conflicts to the owning child.

## Parent-owned validation

- Full Happy App tests and typecheck.
- Applicable Server checks if shared packages change.
- Workflow validation/core/CI/audit and staged workflow CI.
- Whole-diff review.
- Packaged macOS build, stable signing, recoverable install, fixed-window
  screenshots, and final user visual acceptance.

## Conflicts and resolutions

- None before child creation.
