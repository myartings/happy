# Context: `side-chat-quick-panel`

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

- Reference Codex only for the visible desktop interaction captured by the user.
- Preserve Happy's existing side-chat machinery and lifecycle.
- Keep the feature behind a device-local Personal Development switch.
