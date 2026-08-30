# ADR 0005: Scale evidence materialization for solo development

## Status

Superseded for new work by ADR 0006 on 2026-08-19. Historical Micro evidence
remains valid and immutable.

## Context

ADR 0003 prevents intensity from removing formal lifecycle stages, but the first
implementation equated complete evidence with eagerly creating many prose files
and required the formal task mechanism for every submitted change. A
representative High-risk Workspace contains sixteen files; that shape is
disproportionate for a bounded documentation correction.

Trellis v0.6.14 permits small-task opt-out, PRD-only lightweight tasks, and inline
execution without context manifests. Matt requires TDD where applicable, final
complete verification, and independent two-axis review, but not Workspace
artifacts. Superpowers v6.3.0 provides observational efficiency evidence.

## Decision

Formal tasks continue the complete ordered lifecycle and all receipts. Evidence
materialization scales independently:

- `compact-inline` formal tasks use a smaller canonical state/contract/evidence
  set and materialize session/context files only when topology needs them.
- A strict non-formal Micro channel may submit bounded documentation-only work
  with one commit-bound receipt while retaining explicit acceptance,
  assessments, fresh checks, and both Matt review conclusions.
- Applicable verification and reuse are deterministic and fail closed.
- Mechanical lifecycle actions may be orchestrated, but judgment evidence is
  caller-authored and external Git actions remain separate.
- A durable optimization registry and append-only records protect adopted local
  improvements from silent upstream overwrite. Changes require a new
  superseding record and explicit approval.

The repository lifecycle remains integration/commit authority. Source roles and
capability owners do not change.

## Consequences

- Solo work produces less repository noise and repeated tool work.
- Micro eligibility, optimization history, and staged CI become protected policy
  surfaces with behavioral tests.
- Formal Feature/High-risk rigor remains unchanged.
- Work exceeding Micro boundaries must restart as a formal Workspace.

## Rollback

Remove the Micro branch from staged CI, restore eager compact artifacts, and
route every submitted diff through ADR 0003. Historical Micro and optimization
records remain evidence and must not be deleted.
