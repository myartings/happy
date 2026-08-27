# Context: `cross-device-active-day-grouping`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Canonical activity is projected once into `SessionRowData.lastActivityAt`.
- The active-list presentation must consume that projection for both ordering
  and day grouping.
- See `contexts/implement.jsonl` for the bounded source set.

## Verification context

- Start with the focused visible-list test, then neighboring activity tests,
  Happy App typecheck, and the complete Happy App test family.
- See `contexts/check.jsonl`.

## Notes

- Do not alter server, wire, persistence, session presence, or timezone code.
