---
name: generate-tasks
description: Create a dependency-aware execution checklist when an accepted delivery slice has multiple steps, acceptance criteria, internal dependencies, or a high-risk audit need.
---

# Generate Tasks

## Workflow

1. Read the accepted task source, optional tracker Issue, spec section, and
   acceptance-to-evidence mapping.
2. Confirm the slice maps to one `docs/workspace/<slug>/`. If it is
   self-contained and none of the checklist triggers apply, record `not
   required — self-contained slice` in `task-links.md` and stop.
3. Identify shared contracts that must land serially before independent slices.
4. Treat plan tasks as internal work units, not child Slices. If current
   evidence reveals independently deliverable outcomes, stop task generation
   and return a parent/child right-sizing proposal with exact dependency
   interfaces; do not hide a second delivery queue inside one checklist.
5. Create tasks that each produce a coherent, reviewable result without
   creating a second delivery queue.
6. For every task, record scope, allowed files when known, dependencies,
   likely ownership boundary, parallel-candidate status, acceptance criteria,
   and the closest deterministic validation. Candidate status is advisory;
   `scoping` owns the initial execution route.
   Mark tasks same-shape only when acceptance, validation, and review surfaces
   all match; shared dependencies alone do not justify batching.
7. Add integration and whole-slice verification tasks.
8. Mark blocked questions instead of converting assumptions into tasks.
9. Save to `docs/tasks/<slug>-tasks.md` and link it from `task-links.md`.
10. Use a tracker Issue when the accepted task needs an external queue or
   coordination boundary. Route publication through `tracker-workflow`.
   Drafting tasks does not authorize creating Issues; show proposed titles,
   dependencies, and acceptance coverage before publishing.

Avoid line-by-line coding instructions. Tasks should constrain outcomes and
boundaries while leaving local implementation judgment to the coding session.
