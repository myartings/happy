# Context: `github-issues-inaccessible-repository`

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

- Runtime reproduction on the signed macOS client detected `iOSTemplate` but
  showed `The detected repository is not available to the GitHub App` inside a
  generic picker containing unrelated repositories.
- The resolver currently discards the detected repository when returning
  `reason: 'inaccessible'`; the Session button therefore cannot route a
  repository-specific access state.
- Scope is limited to preserving that identity, routing the state, rendering
  the message, translations, focused tests, and the personal macOS rebuild.
