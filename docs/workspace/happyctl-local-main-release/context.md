# Context: `happyctl-local-main-release`

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

- Existing official-baseline spec and smoke test own this regression.
- Implementation is isolated in the existing task worktree and affects only
  the source synchronization guard plus its test.
