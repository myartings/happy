---
name: continue
description: Advance an accepted repository task continuously through applicable lifecycle gates until completion or a real interaction boundary. Use when the user says continue, proceed, resume, keep going, 按顺序, or asks to work through a ready task queue without naming the next operation.
---

# Continue Work

## Continuous execution boundary

When the user's instruction broadly authorizes execution of the accepted
delivery slice, advance across every applicable internal lifecycle gate through
finish and archive in one logical run. Machine gates are internal checkpoints,
not routine user-confirmation points. Share concise progress updates while work
continues; progress updates do not ask permission to enter the next internal
gate.

Pause only at a real interaction boundary:

- an unresolved material product, architecture, or risk decision;
- missing authority for an external write, session launch, protected-scope
  expansion, destructive action, or risk waiver;
- unavailable required evidence or a workflow-defined bounded-recovery limit;
  or
- a user instruction that explicitly limits the requested output or phase.

An explicitly narrow request stops at its named boundary. A generic
continuation instruction never grants unrelated external-write, session-launch,
protected-scope, or risk-waiver authority.

## Routing

1. Use `start` to inspect repository and active task state.
2. If no Trellis task is active, continue the accepted bounded request through
   the matching Matt engineering skill. Do not manufacture lifecycle evidence.
   If the remaining scope is complex, high-risk, likely cross-session, or needs
   durable coordination, ask before creating a task.
3. If a task is active, route by phase:
   - `planning`: resolve open decisions, PRD, spec, and task gaps.
   - `implementation`: run `scoping`, then implement the next accepted slice.
   - `verification`: use `check`, then `review`, and address evidenced failures.
   - `finish`: use `finish-work`.
4. If several independent ready units exist, use `batch-plan` before selecting or
   parallelizing work.
5. During an existing batch, compare the current ready/dependency/ownership graph with the last recorded
   topology. If it materially changed during implementation, record
   `parallel-reassess` before choosing the next slice; unchanged graphs need no
   new receipt.
6. Advance resumable task state only with guarded commands:
   `python3 scripts/workflow-state.py transition <slug> <phase> "<next>"`.
   Do not edit `workflow.json` or generated `state.md` directly.

Apply every required decision, risk, protected-path, review, and deterministic
verification gate during the continuous run.

Classify material growth on first discovery under
`docs/workflow/discovered-work-scope-containment.md`; do not wait for the
two-boundary continuation breaker. Route new acceptance, risk/waiver choices,
unknown-root blockers, and independently rejectable prerequisites to exactly
one owning authority without editing the active contract or tracker. Severity
does not confer blocking authority.

At a continuation boundary after two consecutive blocked implementation
attempt receipts or two blocked review boundaries without an intervening
accepted boundary, record a complete `workflow-state.py right-sizing <slug>
continuation ...` receipt before another broad attempt. Premature receipts are
rejected. Choose exactly one evidenced route: `continue`, `diagnose`,
`reconcile-contract`, or `split-remainder`. Only `continue` authorizes another
bounded implementation attempt; every other route keeps broad implementation
paused. Match the trigger to the route: `no-progress` to `continue`,
`same-root-failure` to `diagnose`, `contract-conflict` or
`reviewer-scope-expansion` to `reconcile-contract`, and
`independent-remainders` to `split-remainder`. Turn count triggers reassessment
but never proves oversizing. A split
recommendation preserves completed evidence,
names independent remainders, dependency interfaces, and the smallest safe stop,
then pauses for any scope or tracker authority; it never rewrites the active
contract or activates remainder Workspaces.

During review remediation, batch compatible actionable findings within the
accepted slice, repin the complete candidate, and continue while conclusions
show productive in-scope convergence. Revision count alone is never a pause.
Repeated unsuccessful repair of the same root cause must use the structured
diagnosis/capability-escalation response before reporting the circuit breaker
as exhausted. Scope or acceptance change, protected-scope expansion, new risk
or waiver, destructive action, and unauthorized external mutation remain real
interaction boundaries at every revision.
