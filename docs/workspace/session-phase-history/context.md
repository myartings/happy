# Context: `session-phase-history`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Preserve optional text phase through Wire, Codex mapping, App normalization,
  reducer conversion, and phase-aware grouping. See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Notes

- Accepted behavior: `docs/specs/session-phase-history.md`.
- Work queue: `docs/tasks/session-phase-history-tasks.md`.
- Product source is limited to protocol/mapping/normalization/grouping seams.
