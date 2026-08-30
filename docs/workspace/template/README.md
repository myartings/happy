# Workflow: `<feature>`

- Machine-readable phase, intensity, gates, and history: `workflow.json`
- Human-readable state projection (generated; do not edit): `state.md`
- Canonical contracts: `spec-links.md`
- Delivery source, acceptance slice, dependencies, and optional checklist: `task-links.md`
- Context overview: `context.md` (standard layout only)
- Role-scoped context: `contexts/implement.jsonl`, `contexts/check.jsonl`
  (materialize/use only for actual dispatch)
- Decisions: `decisions.md`
- Exact verification evidence: `validation.md`
- Running log: `journal.md`
- Structured session continuity: `session-index.md`, `sessions/` (only when the
  accepted task crosses a real session boundary)
- Finish review: `finish.md`
