# Context: `codex-main-window-pencil`

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

- Goal: produce one reviewable Happy Studio main-window Pencil design using the
  validated Codex Desktop reference package.
- Scope: documentation plus `studio-main-window-v1.pen/.png`; no product code.
- Stop condition: present the PNG and wait for explicit user acceptance.
