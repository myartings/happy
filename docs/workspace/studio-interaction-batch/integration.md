# Integration: `studio-interaction-batch`

## Shared contracts landed first

- No new cross-region product API is required. Existing Studio resolvers are
  read-only dependencies; each writer owns a region-local adapter.
- Parent spec/tasks and ownership matrix are the serial Batch 0 contract.

## Merge order

`tool presentation -> composer states -> interaction states`

The interaction track lands last because it spans sidebar and overlay state
presentation and therefore has the broadest direct seams.

## Parent-owned validation

- Combined focused tests and Happy App typecheck.
- Formal workflow check and whole-diff review.
- Packaged build, stable signing, recoverable installation, fixed-size state
  capture, and explicit user accept/revise decisions.

## Conflicts and resolutions

- Preserve the parent `docs/workspace/ACTIVE.md` during all child integrations.
- Retain every child `docs/workspace/archive.md` row.
- Any unexpected overlap in product files is a stop condition, not an automatic
  conflict resolution.
