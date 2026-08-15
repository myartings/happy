# Context: `remote-workspace-project-discovery`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- First slice: T1 bounded daemon-side scanner.
- Specialist flow: `tdd`, then `implement`.
- Test seam: temporary workspace fixtures behind filesystem APIs; assert marker
  discovery, bounds, skips, containment, deduplication, and deterministic order.
- Incremental validation: targeted scanner Vitest suite, then
  `pnpm --filter happy typecheck`.

## Verification context

- Verify the accepted spec and task evidence, then run targeted CLI/App suites,
  both package typechecks, workflow checks, benchmark, smoke, and whole-diff
  forbidden-surface inspection.

## Notes

- Scoping result: ready.
- Intensity: Feature.
- Branch/worktree: `feature/remote-workspace-project-discovery-doc` in the
  current clean product worktree plus expected planning evidence.
- Tracker: local-only because no external publication or coordination was
  requested.
- Accepted contracts: `docs/PRD.md`, feature spec, task list, and decisions.
- Open material decisions: none.
- Risk: privacy trigger cleared with controls recorded in `decisions.md`.
- Protected/generated paths: none are needed for T1.
- T1 allowed implementation area: focused scanner module and tests under
  `packages/happy-cli/src/`.
