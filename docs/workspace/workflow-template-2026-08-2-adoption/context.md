# Context: `workflow-template-2026-08-2-adoption`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Happy's current selective adoption boundary and project-owned authority.
- The pinned `ai-coding-template` release tag and immutable commit.
- The schema-2 upstream synchronization contract and distributed runtime.
- The accepted feature specification, decisions, task graph, and risk controls.

## Verification context

- Happy's authoritative commands and selective-adoption validator.
- Source identity, pre/post dry-run output, changed-path inspection, active
  Workspace compatibility, and final review evidence.

## Notes

- This is a local-only, current-session migration rebuilt on the exact remote
  integration base `origin/dev@f23b9d756d3e3c20b9c41392102c4728b4ab8e15`.
  The user explicitly authorized creation of an isolated branch, its push, and
  a pull request targeting `dev`; no tracker write or merge is authorized.
- Product code, dependencies, product CI, devtools, protocols, and release
  behavior are outside scope.
- The source release is external provenance; only the accepted allowlist enters
  this repository.
