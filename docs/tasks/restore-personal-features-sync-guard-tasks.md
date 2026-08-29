# Restore Personal Features and Guard Synchronization

## T1 — Lock the regression — completed

- Scope: focused app wiring test and `happyctl` guard smoke fixtures.
- Acceptance: tests fail because the dedicated surface and guard do not exist.
- Validation: targeted Vitest file and `bash devtools/tests/happyctl-refresh-guards-smoke.sh`.

## T2 — Establish the personal feature boundary — completed

- Depends on: T1.
- Scope: dedicated feature module, Expo route, visible Settings entry, and a
  small Developer Tools navigation seam.
- Acceptance: all protected switches use their existing keys from one module;
  no duplicate inline control set remains in Developer Tools.
- Validation: targeted app wiring tests and Happy App typecheck.

## T3 — Add the final-branch synchronization guard — completed

- Depends on: T1 and the T2 contract.
- Scope: deterministic `happyctl` validation after final local integration and
  before push/build/install.
- Acceptance: complete fixture passes; each missing invariant fixture fails;
  public sync function invokes the guard.
- Validation: refresh-guard smoke test.

## T4 — Integrate and verify — completed

- Depends on: T2 and T3.
- Scope: focused tests, nearest devtools suite, Happy App typecheck, workflow
  validation/audit, and whole-diff review.
- Acceptance: all applicable checks pass and rollback/remaining gaps are
  recorded before archive.
