---
name: continue
description: Advance the active repository task through the correct workflow gate. Use when the user says continue, proceed, resume, keep going, or asks to work through a ready task queue without naming the next operation.
---

# Continue Work

## Routing

1. Use `start` to recover active state.
2. Route by phase:
   - `planning`: resolve open decisions, PRD, spec, and task gaps.
   - `implementation`: run `scoping`, then implement the next accepted slice.
   - `verification`: use `check`, then `review`, and address evidenced failures.
   - `finish`: use `finish-work`.
3. If several ready tasks exist, use `batch-plan` before selecting or
   parallelizing work.
4. Advance resumable state only with guarded commands:
   `python3 scripts/workflow-state.py transition <slug> <phase> "<next>"`.
   Do not edit `workflow.json` or generated `state.md` directly.

Do not interpret “continue” as permission to skip unresolved project decisions,
risk gates, protected paths, or deterministic verification.
