# Tasks: Selective Workflow 2026.09.2 Adoption

Status: T1-T5 complete; T6 has passed the final check. Candidate-bound review,
finish, archive, and staged CI receipts are recorded only after their respective
gates accept this unchanged terminal candidate.

## T1 — Freeze source and accepted contract

- Scope: record Issue #104, exact source/tag/plan identity, Happy base, runtime
  capability, predecessor reconciliation, Spec, decisions, and risk controls.
- Dependencies: none.
- Ownership: current Root; serial; not a parallel candidate.
- Acceptance: one stable `.2` delivery Slice and no unresolved entry gate.
- Validation: Git/status/plan inspection and strict active workflow audit.

## T2 — Classify the selective dry-run

- Scope: update manifest provenance in a controlled candidate, run the pinned
  source dry-run, and classify all updates, translations, preservation, and
  retirement states before apply.
- Dependencies: T1.
- Ownership: current Root; serial because it fixes the apply contract.
- Acceptance: no unexplained or forbidden surface and no unsafe retirement.
- Validation: dry-run output, manifest inspection, changed-path classification.

## T3 — Adopt canonical allowlisted workflow artifacts

- Scope: execute only the schema-2 selective synchronizer's transactional
  apply from the clean pinned `.2` source.
- Dependencies: T2.
- Ownership: current Root; serial; overlaps the final integration surface.
- Acceptance: canonical paths match the pinned source and excluded paths do not
  change.
- Validation: apply output, whole-diff inventory, protected/product negative check.

## T4 — Reconcile Happy-owned translations

- Scope: incorporate compatible `.2` semantics into `.ai/project.json`,
  validators/adapters, and other manifest-preserved workflow files while
  retaining every Happy-specific authority and fail-closed invariant.
- Dependencies: T3.
- Ownership: current Root; serial integration task.
- Acceptance: translation diff is bounded and final pinned dry-run is zero.
- Validation: validator tests, project-config inspection, zero-drift dry-run.

## T5 — Verify the complete candidate

- Scope: run targeted workflow suites, applicable configured checks, strict
  active/all audit, changed-path checks, and candidate/staged enforcement.
- Dependencies: T4.
- Ownership: current Root; serial verification.
- Acceptance: deterministic configured gates pass with exact evidence.
- Validation: `workflow-check.py --applicable --record` plus focused commands.

## T6 — Review, finish, and prepare delivery boundary

- Scope: pin one candidate, run independent capable Spec and Standards axes,
  remediate findings, finish/archive, stage the accepted candidate, and pass
  staged workflow CI.
- Dependencies: T5.
- Ownership: current Root integrates; independent reviewers are read-only.
- Acceptance: both review axes pass the same candidate and finish evidence is
  complete.
- Validation: review conclusions, finish receipt, archive projection, staged CI.
- Stop: no commit, push, PR, merge, Issue write/closure, or cleanup without
  separate authorization.
