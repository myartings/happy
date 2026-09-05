---
name: generate-tasks
description: Create self-contained local Task plans for accepted slices moving to fresh implementation Sessions.
---

# Generate Tasks

Use this when accepted work must leave its planning context. Immediate bounded
work in the current Session needs no Task.

1. Read the accepted Feature Spec when one exists, plus applicable PRD,
   research, context, ADRs, architecture, and any incoming Issue selected for a
   fresh-Session handoff.
2. Propose one independently deliverable Task per slice. Each Task must fit one
   fresh context, state an observable Goal and completion conditions, and list
   only hard dependencies on other proposed or existing Tasks. Shared contracts
   land before their dependants; independent Tasks remain parallel candidates.
3. Show the proposed Task paths, outcomes, completion coverage, dependency
   edges, and the Issue that `publish-tasks` will reuse or create for each Task.
   State that accepting a fresh-Session proposal also authorizes that exact
   Issue publication. Resolve material slicing or publication questions before
   writing.
4. After the user accepts the breakdown, create or update each
   `docs/tasks/<task>.md` from `docs/tasks/template.md` with Status, Steps,
   resumable Notes, and optional Feature Spec or Research links. Preserve
   still-valid progress and Notes when updating an existing Task.
5. Immediately route accepted fresh-Session Tasks to `publish-tasks`. If its
   Issue plan differs from the approved preview, stop for renewed approval.

A Task remains readable and resumable without tracker access, but every
accepted Task must have exactly one Issue before launch. Do not create or
mutate Issues, Project items, branches, worktrees, models, Sessions, or launch
state; `publish-tasks` owns the external write.
