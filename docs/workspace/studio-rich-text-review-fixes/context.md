# Context: `studio-rich-text-review-fixes`

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

- Incremental follow-up to commit `2d794d46` for integration-review findings 1
  and 3 on `feature/studio-rich-text`.
- Allowed product files remain `components/markdown/**` and
  `features/studio-semantic-text/**` only.
- `MessageView`, tool/diff renderers, SimpleSyntaxHighlighter, layout, sidebar,
  Composer, protocol, and storage are excluded.
- Return contract: focused behavior tests, Happy App typecheck, review, staged
  workflow CI, and one local incremental commit; no push or merge.
