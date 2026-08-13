# Context: `studio-visual-contract-reset`

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

- Goal: reset the rejected batch-style visual implementation contract before any
  new product-code work.
- In scope: `docs/specs/codex-visual-theme.md`, its linked task list, and this
  workflow's evidence.
- Accepted product decisions: neutral `Studio` name; Otty primary and Codex
  supporting reference; packaged macOS/Windows only; one proposal and one human
  result acceptance per implementation item.
- Out of scope: all product code, builds, screenshots, theme registration, and
  selection UI.
