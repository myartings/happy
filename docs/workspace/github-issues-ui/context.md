# Context: `github-issues-ui`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Product contract, current GitHub connection, route hosts, settings seams, and
  feature-local modules only. See `contexts/implement.jsonl`.

## Verification context

- API contracts, authorization/error behavior, flags, route visibility, and
  cross-platform navigation. See `contexts/check.jsonl`.

## Notes

- Do not expose GitHub tokens to Happy clients.
- Do not fold GitHub behavior into `projectTodos`.
- Keep host integration guarded and reviewable.
