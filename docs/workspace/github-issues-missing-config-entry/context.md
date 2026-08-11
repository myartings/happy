# Context: `github-issues-missing-config-entry`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- The installed `c7244a65` macOS client showed `not_configured` in the existing
  GitHub Issues settings route, while the Session entry converted the same state
  into an empty `lookup-failed` repository picker.
- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Notes

- This is a low-risk boundary fix. It does not alter authentication, credential
  storage, permissions, or Issue CRUD.
