# Selective Adoption Plan

## Source

- Repository: `https://github.com/myartings/ai-coding-template.git`
- Release: `workflow-2026.08.2`
- Commit: `8d07a74931f8dcf6a668c2a6a4dcaf9c490a2842`
- Applying checkout:
  `/private/tmp/happy-adopt-workflow-2026-08-2.GO0XDA/source`
- Source state before dry-run: detached and clean at the accepted commit.

## Pre-apply dry-run

Command:

```text
python3 <pinned-source>/scripts/sync-template.py <Happy worktree> \
  --manifest <Happy worktree>/.ai/template-adoption.json
```

Result: passed with 71 required changes.

| Classification | Count | Disposition |
| --- | ---: | --- |
| `changed` | 36 | Adopt canonical distributed content |
| `missing` | 32 | Add canonical distributed content |
| `would-retire` | 3 | Retire only after exact fingerprint preflight |
| `unchanged` | 36 | Keep identical content |

## Manual translations

- `AGENTS.md`: retain Happy authority and add compatible task/no-task,
  historical-state, check, review, finish, and session-root semantics.
- `.ai/project.json`: retain Happy identity and product commands; add portable
  Python commands, check selection, and review profiles.
- `.codex/config.toml`: retain Paper MCP and add the accepted model defaults.
- `scripts/validate-happy-workflow.py`: validate the selective schema and Happy
  authority instead of applying upstream template-only skill assumptions.
- `scripts/happy-workflow-state-upgrade.py`: bridge an active pre-release Happy
  Workspace without modifying the canonical runtime or rewriting history.

## Preserved and rejected surfaces

- Preserve `.claude/`, Happy custom skills, `CONTEXT.md`, `docs/PRD.md`, product
  workflows, `devtools/`, product code, dependencies, protocols, and releases.
- Reject upstream root replacement, full `.codex` replacement, project/source
  template validation, project generation, template CI, release planning, and
  fleet synchronization.
- Verification uses `git diff --exit-code --` on preserved tracked surfaces and
  a final changed-path allowlist; no persisted machine-specific hash becomes a
  future authority over user changes.

## Post-reconciliation zero-drift proof

The complete staged candidate was written to an unreferenced synthetic commit
whose parent is the immutable task baseline
`df1362e3e7bab34e3ff56ad1613eba22584137d4`. A clean detached temporary
worktree at that snapshot was checked with the same pinned source synchronizer
and target manifest; no branch or tag reference was updated.

Result: all distributed entries were `unchanged`, all three fingerprint-retired
tests were `retired-absent`, and the final summary was
`dry-run: 0 change(s) require update`. The temporary worktree was then removed.
