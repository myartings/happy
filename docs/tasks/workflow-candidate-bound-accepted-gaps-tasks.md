# Tasks: Candidate-bound accepted check gaps

## T1 — Freeze the diagnosed contract

- Record the preserved Windows run, current parser/state/CI behavior, accepted
  terminology, decisions, risks, scope, and one-archive-row delivery boundary.
- Keep the work serial in the current Windows Native session root.
- Validation: strict active audit and exact changed-path inspection.

## T2 — Add public-boundary RED coverage

- Extend the temporary-repository runtime suite with a complete staged run
  containing one successful and one failed command.
- Prove exact acceptance is currently unavailable and generic
  `gate check accepted_gaps` cannot be an acceptable substitute.
- Add mismatch, duplicate, missing-approval, successful-index, and tamper
  rejection coverage at the public CLI boundary.
- Validation: focused new tests fail for the diagnosed reason before runtime
  implementation changes.
- Depends on: T1.

## T3 — Bind exact accepted failures in workflow state

- Add the explicit `check-receipt accepted_gaps` interface and versioned state
  contract.
- Validate a complete current staged run, exact failed command indexes,
  canonical result/exit-code pairs, and approval evidence.
- Preserve successful receipt behavior and clear every downstream binding on a
  blocked receipt or implementation reset.
- Reject generic candidate-bound check gate outcomes.
- Validation: focused receipt and state/audit tests reach GREEN.
- Depends on: T2.

## T4 — Propagate the binding through terminal CI

- Revalidate accepted failure indexes in active binding checks, pre-archive
  CI, archived staged CI, and committed CI.
- Preserve run fingerprint, candidate, scope, configuration, and command-set
  drift protection.
- Validation: accepted-gap lifecycle passes staged and committed CI; stale or
  tampered evidence fails.
- Depends on: T3.

## T5 — Verify, review, finish, and isolate delivery

- Run the focused test, complete workflow runtime suite, validator suites,
  applicable staged check, strict audits, and diff checks.
- Obtain independent Spec and Standards review of the frozen candidate.
- Finish and archive exactly this workflow delivery, pass staged workflow CI,
  and create one atomic commit and one dev PR.
- Do not combine the pending Windows delivery because workflow CI permits one
  new archive row per submission range. Resume Windows only after this
  prerequisite is present on verified dev.
- Depends on: T4.

## Progress

- `2026-08-30`: T1 complete; diagnosis, decisions, controls, scope, and delivery
  topology recorded.
- `2026-08-30`: T2 RED reproduced 3/3 expected failures at the public CLI.
- `2026-08-30`: T3-T4 GREEN; four focused scenarios and all ten runtime
  scenarios pass, together with validator and state-upgrade suites.
- `2026-08-30`: first frozen-candidate Spec and Standards reviews blocked on
  approval-only drift; Spec also required positive-exit wording reconciliation.
- `2026-08-30`: remediation in progress with a canonical accepted-policy
  fingerprint and approval-tamper coverage across active and terminal gates.
- `2026-08-30`: remediation GREEN; focused receipt/terminal cases and complete
  10-scenario public runtime suite pass, with approval drift rejected by every
  applicable downstream consumer.
- `2026-08-30`: fresh finalized-candidate review found three adjacent lifecycle
  gaps: non-final receipt selection, binding drift between axis conclusions and
  terminal review, and repeated receipt state corruption after review.
- `2026-08-30`: second remediation RED reproduced all 3 findings; focused GREEN
  passed 3/3 in 103.694 s and the expanded runtime suite passed 12/12 in
  218.644 s. Receipts now require the final run and pending review, while the
  terminal review gate revalidates the binding.
- `2026-08-30`: T5 in progress; final staged profile, review, archive, commit,
  push, and PR remain.
