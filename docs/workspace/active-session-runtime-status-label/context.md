# Context: `active-session-runtime-status-label`

PR #46 added deterministic labels to historical rows and session details, but
the default active-session path renders `CompactSessionRow`, which currently
shows only a status dot. This follow-up adds the missing compact-row text seam.

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

- Remove irrelevant placeholders.
- Add feature-specific source and test files to the appropriate role manifest.
