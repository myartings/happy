# Publish Launch-Pinned Codex Effort Dev Integration Tasks

## T1 — Preserve both parent contracts

- Scope: pending merge and `docs/workspace/archive.md`.
- Dependencies: source `008f90c4`, target `124299f0`.
- Owner: current Root; serial; not a parallel candidate.
- Acceptance: exact parent-row union, no unresolved markers, no novel inherited
  product or workflow edits.
- Validation: parent/index comparison, `git diff --check`, and workflow validator.

## T2 — Verify and independently review the complete candidate

- Scope: complete staged two-parent integration plus this Workspace.
- Dependencies: T1.
- Owner: current Root for checks; independent Spec and Standards reviewers selected by the low-risk review profile.
- Acceptance: full applicable checks pass and both reviewers accept the same
  unchanged candidate.
- Validation: structured check receipt, review package, and dual conclusions.

## T3 — Archive, commit, publish, and reconcile

- Scope: canonical terminal projection and authorized GitHub delivery.
- Dependencies: T2.
- Owner: current Root; serial.
- Acceptance: pre-/post-archive staged CI and committed-range CI pass; ordinary
  merge commit is pushed without force; hosted CI passes; PR #106 merges; Issue
  #103 closes.
- Validation: workflow CI, commit parents, remote/PR/check/Issue state.
