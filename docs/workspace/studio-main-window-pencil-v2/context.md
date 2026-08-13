# Context: `studio-main-window-pencil-v2`

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

- Goal: create one 1470×870 Happy main-window v2 Pencil design that keeps the
  current functional map but boldly adopts the extracted Codex visual system.
- Evidence: private lossless Happy and Codex window baselines plus the validated
  Codex producer package and accepted v1 design.
- Boundary: design/documentation only; no product code.
- Stop condition: present v2 PNG and wait for explicit user acceptance.
