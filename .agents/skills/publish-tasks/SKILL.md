---
name: publish-tasks
description: Publish accepted local Tasks to GitHub Issues when they need external queueing or fresh-Session handoff; do not use for direct one-Issue capture or plan decomposition.
---

# Publish Tasks

1. Read the selected Tasks, their dependencies, `.ai/project.json`, and
   `docs/agents/issue-tracker.md`. Resolve personal Project configuration from
   the active global guidance; do not write that identity into the repository.
2. Preview the exact Tasks, reused or new Issue titles, Task links, labels,
   blocker links, Project status, and any native aggregate relationship. An
   accepted `generate-tasks` proposal supplies publication authority when it
   previewed this exact plan; an explicit request to publish named Tasks does
   the same. Otherwise wait for approval before the external writes, and stop
   for renewed approval when the plan changes.
3. Reuse a bounded incoming Issue when it represents one selected Task. If an
   existing broad Issue was accepted as several slices, keep it as their native
   aggregate and create one sub-issue per Task. Otherwise create standalone
   Issues; never manufacture an aggregate Issue from a PRD or Feature Spec.
4. Publish blockers first. Each Issue links to exactly one repository-stable
   Task path and projects that Task's Goal and completion conditions into the
   tracker-owned scope and acceptance fields. Mirror hard Task dependencies as
   native blocked-by relationships; hierarchy never implies execution order.
5. Apply the configured triage labels and add each Issue to the configured
   Project as Ready when unblocked or Blocked otherwise. Keep the Task files
   unchanged and return their full Issue URLs to the coordinator.

Publication creates no branch, worktree, model choice, Session, launch, or
implementation authority. This is the only Agent-owned Issue creation path;
other Task-less tracker items are created by the user and enter through
`triage`.
