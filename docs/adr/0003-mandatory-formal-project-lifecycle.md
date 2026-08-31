# ADR 0003: One complete lifecycle for every formal project task

## Status

Superseded for new work by ADR 0006 on 2026-08-19. Historical Workspaces remain
valid evidence.

## Context

Intensity-based routing allowed Low-risk work to stay inline and bounded Feature
work to avoid structured state. That made intensity decide which lifecycle steps
existed, not merely how deeply they were performed.

This conflicts with the template's purpose: formal AI coding projects need a
consistent planning, scoping, implementation, verification, review, finish, and
archive discipline. The integrated methods operate as one system, not as
independently adoptable fragments.

## Decision

Every task in a formal project uses a structured workflow directory and records
the complete lifecycle. A compact task file can hold the feature contract, but
cannot replace machine state, topology-required context/session evidence, gate
receipts, validation, finish review, or terminal archive.

Intensity controls evidence depth, test breadth, risk controls, rollback, and
review independence. It does not waive core lifecycle steps. Explicitly
disposable work remains outside the formal template.

ADR 0005 introduces a separate strict Micro delivery channel for bounded
documentation changes. Micro is not a formal task: it is machine-classified,
commit-bound evidence with explicit acceptance, assessment, verification, and
dual review. Unknown scope escalates to this ADR's complete formal lifecycle.

## Consequences

- Formal projects follow one predictable lifecycle across agents and sessions.
- Low-risk receipts may be concise but remain durable and auditable.
- Terminal archive applies consistently; context/session materialization follows
  execution topology without removing evidence.
- Existing lightweight state needs an explicit evidence-preserving upgrade.

## Superseded guidance

This supersedes ADR 0001 where it allows inline or compact-only execution state.
ADR 0001 still defines the compact task file as a useful contract inside the
complete workflow.

## Reversal conditions

Revisit only if repeated evidence shows complete receipts reduce delivery quality
and a replacement still preserves machine-auditable planning, verification,
review, finish, and terminal archive.
