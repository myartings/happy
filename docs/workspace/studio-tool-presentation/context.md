# Context: `studio-tool-presentation`

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

- This is the tool-presentation child of a user-authorized parallel Studio UI batch.
- Parent owns merge order, packaged capture, and human visual acceptance.
- No ai-coding-template synchronization is part of this workflow.
