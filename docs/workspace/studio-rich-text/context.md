# Context: `studio-rich-text`

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

- Child writer for Track C of the parent `studio-visual-convergence` batch.
- Branch/worktree: `feature/studio-rich-text` at
  `/Users/myartings/workspace/happy/.dev/worktree/studio-rich-text`.
- Allowed product scope is limited to `components/markdown/**`,
  `features/studio-semantic-text/**`, `SimpleSyntaxHighlighter` only when
  necessary, and a bounded fixture/demo seam.
- Layout, sidebar, Composer, tool presentation, overlays, protocol, storage,
  and parent shared workflow/spec/task files are excluded.
