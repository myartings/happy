# Codex Initial Permission Mode Sync Dev Integration Tasks

## T1 — Preserve both parent contracts

- Scope: the pending merge conflicts in `runCodex.ts` and `apiSession.test.ts`.
- Dependencies: source `910097e4`, target `b6a79dbe`.
- Owner: current Root; serial; not a parallel candidate.
- Acceptance: retain launch initialization/awaitable publication plus reconnect
  hydration, fail-closed credentials, stale confirmed-route clearing while the
  new launch is pending, and CAS revision preservation.
- Validation: marker check, target-relative diff, focused tests, CLI typecheck/full tests.

## T2 — Verify and independently review the candidate

- Scope: complete staged two-parent integration and this lifecycle evidence.
- Dependencies: T1.
- Owner: Root for checks; independent capable Spec and Standards reviewers.
- Acceptance: full applicable checks pass and both reviewers accept the exact candidate.
- Validation: structured check receipt and candidate-bound review package.

## T3 — Archive, commit, publish, and reconcile

- Scope: terminal projection and user-authorized GitHub delivery.
- Dependencies: T2.
- Owner: current Root; serial.
- Acceptance: staged/committed CI passes; ordinary merge commit is pushed;
  hosted checks pass; PR merges into `dev`; local `dev` fast-forwards cleanly.
- Validation: workflow CI, commit parents, GitHub PR/check state, divergence counts.
