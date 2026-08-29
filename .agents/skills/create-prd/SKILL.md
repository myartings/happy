---
name: create-prd
description: Turn clarified project intent into durable, testable requirements. Use for new projects, substantial features, changed user outcomes, high-risk behavior, or requests to create or update `docs/PRD.md`.
---

# Create PRD

## Workflow

1. Inspect existing project context, code, feedback, and related specs.
2. Route material unresolved choices through Matt-owned `grilling`: inspect
   discoverable facts first, then ask the whole currently unblocked design-tree
   frontier in a numbered round with recommendations and trade-offs.
3. Define the problem, users, desired outcomes, observable success, scope,
   non-goals, constraints, and unresolved decisions.
4. Separate project commitments from implementation details.
5. Make acceptance language observable and falsifiable.
6. Update `docs/PRD.md` incrementally; preserve unrelated commitments.
7. Record unresolved choices in `decision-map`, resolve user-owned choices
   through `grilling`, then route accepted scope to `generate-spec`.

Do not use a PRD as a task list or architecture document. Low-risk maintenance work
does not require a new PRD when an existing contract already covers it.
