# Context: `main-push-guard`

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

- The existing allowlist and equivalence validator in `devtools/happyctl` are
  the single source of truth for an eligible personal `main`.
- The public seam is a real `git push` into a temporary bare repository.
