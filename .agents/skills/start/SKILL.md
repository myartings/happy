---
name: start
description: Resume or begin repository work from durable project state. Use when starting a coding session, returning after a pause, switching agents or worktrees, or when the active task and next workflow gate are unclear.
---

# Start Work

## Workflow

1. Read `AGENTS.md`, `.ai/project.json`, and `CONTEXT.md`.
2. Inspect `git status --short`; preserve unrelated or user-owned changes.
3. Run `python3 scripts/workflow-state.py active` when the helper exists.
4. If a workflow is active, read its `workflow.json`, generated `state.md`,
   `context.md`, `decisions.md`, `validation.md`, latest journal entries, and
   the latest relevant entry linked from `session-index.md`.
5. Confirm linked PRD/spec/tasks and check whether they still match the codebase.
6. If `task-links.md` names an external tracker item and fresh remote context is
   required, route read-only discovery through `tracker-workflow`. Snapshot any
   accepted remote change into local contracts; tracker state never substitutes
   for local workflow gates.
7. Classify the next action as planning, implementation, verification, or finish.
8. Load only the role manifest needed for the next action:
   `contexts/implement.jsonl` for implementation or `contexts/check.jsonl` for
   verification.
9. Report a short resume brief: goal, current phase, evidence, blockers, and one
   concrete next action.

Run `python3 scripts/workflow-audit.py --strict --require-active <slug>` before
resuming implementation or finish. Every formal task requires a workflow folder.
A legacy workflow without `workflow.json` uses `migrate`; legacy auto-waived
state uses `upgrade-policy`. Never infer historical success or plan only from chat.
