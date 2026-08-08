# Context: `workflow-adoption`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Happy root rules and current branch topology.
- Selective adoption manifest and project configuration.
- Workflow runtime, documentation, templates, and mirrored skills copied from
  `ai-coding-template` without replacing target-only files.

## Verification context

- Selective-adoption validator, workflow runtime tests, strict audit, Git diff,
  and staged workflow CI.

## Notes

- No Happy product code or dependencies are in scope.
- The template source is external provenance; this repository records the exact
  adopted subset in `.ai/template-adoption.json`.
