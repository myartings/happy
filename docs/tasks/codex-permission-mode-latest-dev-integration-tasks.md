# Codex Permission Mode Latest Dev Integration Tasks

## Delivery slice

One serial high-risk merge-local integration slice; these are internal units,
not separate tracker items.

## T1 - Pin parents and resolve conflicts

- Scope: preserve the Issue #87 parent and `origin/dev@03936270` contracts.
- Dependencies: explicit user authorization.
- Ownership: current Root, serial due overlapping metadata type seam.
- Acceptance: MI1-MI4.
- Validation: parent/blob inspection, archive overlay preflight, focused tests,
  typechecks, and whitespace/unmerged checks.

## T2 - Verify and independently review the candidate

- Scope: bind the complete staged candidate to applicable checks and capable
  Spec/Standards review.
- Dependencies: T1.
- Ownership: Root verification; independent read-only reviewers.
- Acceptance: MI5.
- Validation: `workflow-check.py --applicable`, review receipts, and workflow
  audit.

## T3 - Finish and deliver

- Scope: finish/archive this workflow in the pending merge, pass staged and
  committed workflow CI, create an ordinary merge commit, push, and merge PR
  #90 after GitHub checks pass.
- Dependencies: T2.
- Ownership: current Root, serial.
- Acceptance: MI6.
- Validation: Git parent/SHA checks and current GitHub PR/check state.
