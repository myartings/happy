# Context: `client-performance-hotspots`

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

- Prompt navigation work is limited to the rail, message-target request, chat
  virtualization configuration, and focused utilities/tests.
- Visibility work is limited to session entry/reconnect ownership and sync APIs.
- Encryption work preserves public cache behavior while changing internal LRU
  bookkeeping.

- Remove irrelevant placeholders.
- Add feature-specific source and test files to the appropriate role manifest.
