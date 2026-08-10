# Context: `pinned-sessions-projects`

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

- Implementation uses the existing Settings sync path, visible-list projection,
  session quick actions, compact session rows, and project-card header.
- Verification covers deterministic ordering, settings compatibility, app
  typecheck, and repository workflow checks.
