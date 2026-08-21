# Context: `happy-desktop-official-release`

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

- Implementation is serial in the isolated feature worktree; no writer agents
  are needed because the shell command, tests, docs, and Skill share one tight
  interface.
- The runtime baseline worktree is `.baseline/worktree/official-main` and is
  distinct from this implementation worktree.
- Scope is local macOS build/install only; no public release mutation.
