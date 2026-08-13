# Context: `macos-stable-signing`

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

- The installed client is ad-hoc signed with no Team Identifier even though a
  valid Apple Development identity is available.
- `devtools/happyctl` explicitly applies `codesign --sign -` after copying the
  built app, which changes the requester identity across rebuilds and causes
  access-control prompts for the GitHub Issues keychain item.
- Scope is limited to the macOS devtools signing/install/verification path,
  focused smoke coverage, workflow evidence, and one exact recoverable
  keychain entry. Product authentication behavior is unchanged.
