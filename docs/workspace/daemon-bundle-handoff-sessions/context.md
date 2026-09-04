# Context: `daemon-bundle-handoff-sessions`

`context.md` is the human-readable overview. When an accepted task actually
dispatches implementation or verification work, materialize only the needed
machine-readable, role-scoped manifests:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

Do not create these files for serial work that remains in the current context.

## Implementation context

- For dispatched implementation work, see `contexts/implement.jsonl`.

## Verification context

- For dispatched verification work, see `contexts/check.jsonl`.

## Notes

- Remove irrelevant placeholders.
- Add feature-specific source and test files to the appropriate role manifest.
