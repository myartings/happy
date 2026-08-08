---
name: generate-tasks
description: Break an accepted specification into dependency-aware, reviewable implementation tasks. Use after a feature spec is stable, when preparing an issue or work queue, or when work needs clear ownership and validation boundaries.
---

# Generate Tasks

## Workflow

1. Read the accepted spec and its acceptance-to-evidence mapping.
2. Identify shared contracts that must land serially before independent slices.
3. Create tasks that each produce a coherent, reviewable result.
4. For every task, record scope, allowed files when known, dependencies,
   acceptance criteria, and the closest deterministic validation.
5. Add integration and whole-feature verification tasks.
6. Mark blocked questions instead of converting assumptions into tasks.
7. Save to `docs/tasks/<slug>-tasks.md` and link it from workflow state.
8. When the accepted workflow requires a human-visible tracker boundary, or the
   user requests publication, route the approved vertical slices through
   `tracker-workflow`. Drafting tasks does not authorize creating Issues; show
   the proposed titles, dependencies, and acceptance coverage before publishing.

Avoid line-by-line coding instructions. Tasks should constrain outcomes and
boundaries while leaving local implementation judgment to the coding session.
