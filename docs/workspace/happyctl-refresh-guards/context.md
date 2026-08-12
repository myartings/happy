# Context: `happyctl-refresh-guards`

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

- The first forced refresh after the devtools migration failed because personal
  `main` legitimately contains one allowlisted devtools commit above
  `upstream/main`, while refresh rejected every positive ahead count.
- A prior refresh also printed missing GitHub Issues build identifiers but
  continued because the validation function's failure was not propagated by
  `build_desktop` while the caller had `set +e`.
