# Context: `eas-archive-ignore`

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

- EAS resolves the upload from the monorepo root even when invoked from
  `packages/happy-app`, so the ignore file belongs at repository root.
- Keep `.easignore` aligned with `.gitignore` because EAS treats it as a
  replacement rather than an additive ignore file.
