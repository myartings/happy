# Context: `studio-activity-transcript`

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

- Continue from the pushed `feature/studio-visual-convergence` branch, which
  already contains Studio rich text and the shell transcript renderer.
- The missing data is observable at `CodexAppServerClient` but discarded by
  `mapCodexEventToSessionEnvelopes` when building `tool-call-end`.
- Preserve existing activity grouping and localization; add only the missing
  additive result contract and Studio presentation layer.
