# Codex Permission Mode Dev Integration Tasks

## Delivery slice

One serial, high-risk merge-local integration Slice. The tasks below are
internal units, not independent tracker items.

## T1 - Freeze merge sources and semantic contract

- Scope: verify both parents, Issues/PRs, overlap, archive union, and the shared
  permission-mode meaning.
- Dependencies: user authorization and existing pending merge.
- Ownership/topology: current Root, serial; not a parallel candidate.
- Acceptance: MI1-MI2 and decisions D1-D3 are resolved.
- Validation: Git/source inspection and deterministic diff comparison.

## T2 - Resolve and validate the permission-mode seam

- Scope: retain both parent behaviors and remove only merge artifacts such as
  duplicate type declarations; do not invent new runtime behavior.
- Dependencies: T1.
- Ownership/topology: current Root, serial due overlapping authorization code.
- Acceptance: MI3-MI6.
- Validation: focused App/CLI integration tests, typechecks, and diff checks.

## T3 - Candidate-bound verification and review

- Scope: stage the complete pending-merge candidate, run configured checks,
  and dispatch fresh capable Spec/Standards review.
- Dependencies: T2.
- Ownership/topology: Root checks; independent read-only reviewers.
- Acceptance: MI7-MI8.
- Validation: structured check and review receipts for one fingerprint.

## T4 - Finish pending merge and update PR

- Scope: finish/archive the merge-local Workspace into the same pending merge,
  pass staged and committed merge CI, create the normal merge commit, and push.
- Dependencies: T3.
- Ownership/topology: current Root, serial.
- Acceptance: MI9; PR #90 becomes non-conflicting and points at remote HEAD.
- Validation: workflow CI before/after archive and after commit, Git parents,
  remote SHA, PR state.
