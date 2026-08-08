---
name: scoping
description: Route implementation work to the right context, tests, risk gates, and execution mode before editing. Use for Feature or High-risk work, non-trivial bugs, queued issues, cross-module changes, or whenever scope, tests, risks, context, and ownership must be confirmed before edits.
---

# Scoping

## Gate

1. Inspect dirty state and confirm the target repository, branch, and worktree.
2. Classify work with `docs/workflow/intensity-matrix.md`.
3. Confirm the active workflow links accepted behavior: a concise durable task
   contract for Low-risk work or applicable PRD/spec/tasks for deeper work.
4. Confirm open decisions are resolved or explicitly accepted.
5. Check `.ai/project.json` for commands, protected paths, generated paths, and
   risk triggers.
6. Confirm whether this task needs a human-visible tracker boundary for delayed
   pickup, delegation, cross-contributor coordination, or PR delivery. If it
   does, require a configured target or linked item and use `tracker-workflow`
   to resolve it. Otherwise record the local-only reason in `task-links.md`.
7. Select the smallest implementation context and relevant specialist skill.
8. Define the test seam, incremental validation, and final applicable commands.
9. Record decision and risk assessments. Use evidenced `not_required` only when
   no material trigger applies; otherwise run the owning gate skill.
10. For queued, delegated, or isolated writing, require `batch-plan`. A writer
   subagent must use an isolated worktree.

Return `ready`, `ready-with-recorded-gaps`, or `blocked`, with evidence and the
next action. Do not edit code while the result is `blocked`.

Persist the result before every formal implementation:

1. Record accepted contract evidence with the `acceptance` gate.
2. Record required decision and risk receipts through their owning skills.
3. Record `scoping=passed` only for `ready`; use `blocked` when unresolved.
4. Run `python3 scripts/workflow-state.py ready <slug> implementation`.

Chat text is not a gate receipt. Every non-pending gate requires concise durable
evidence.
