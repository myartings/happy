---
name: handoff
description: Create a durable status handoff for another AI session or human. Use before pausing incomplete work, switching agents or machines, reaching context limits, or when blocked work needs precise continuation instructions.
---

# Create Handoff

## Workflow

1. Update active workflow through gate/transition commands, then update decisions,
   journal, and validation. Do not edit generated `state.md` directly.
2. Record goal, accepted scope, current phase, completed work, changed files,
   exact commands/results, blockers, unresolved decisions, and dirty state.
3. Distinguish facts from hypotheses and attempted fixes.
4. Name protected/user-owned changes that must be preserved.
5. Provide one smallest next action plus the files required to resume.
6. For work spanning sessions, agents, worktrees, or machines, run
   `python3 scripts/workflow-state.py session <slug> <scope>` and complete the
   generated summary; ensure `session-index.md` contains the link.
7. Save durable task-specific detail in repository workflow files; keep the
   conversational summary concise.

Run strict workflow audit and record its failures as handoff blockers rather than
repairing history.

Do not describe work as complete when checks are missing. Do not rely on chat
history as the only handoff artifact.
