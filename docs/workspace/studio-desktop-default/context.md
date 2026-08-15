# Context: `studio-desktop-default`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.
- The regression occurred because the Tauri build did not embed the Studio preview
  variable and the central resolver honored a stale device-local Default value.
- The implementation is limited to the central resolver, the compatibility default,
  Tauri export configuration, and focused tests.

## Verification context

- See `contexts/check.jsonl`.
- Verification must cover both policy behavior and the actual production export
  command, then produce a fresh packaged desktop bundle.

## Notes

- No tracker item is needed for this immediate, single-owner personal-client fix.
- Default rendering code remains intentionally present.
