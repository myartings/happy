# Context: `studio-command-palette-density`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.
- Exclusive write scope is the Command Palette component family and the existing
  Studio overlay presentation resolver/tests.
- The existing overlay behavior and Studio visual-style resolver are read-only
  contracts.
- All other overlays and application regions are blocked.

## Verification context

- See `contexts/check.jsonl`.
- Verify pure Studio-only gating and exact metrics first, then actual component
  conditional wiring, Happy App typecheck, workflow checks, and whole-diff review.

## Parent boundary

- Parent owns cherry-pick order, packaged build/install, screenshots, and human
  visual acceptance.
- This child may make one local commit but must not push or merge.
