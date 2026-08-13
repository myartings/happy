# Context: `studio-ui-parallel-integration`

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

- Accepted visual evidence and design notes live under `docs/design/` and the
  accepted Studio checkpoint workflow/spec documents already present at base
  commit `fb26bb46`.
- `batch-plan.md` is the authoritative writer ownership and merge contract.
- The integration worktree is the only place that builds/installs the combined
  desktop client and captures final comparison screenshots.
