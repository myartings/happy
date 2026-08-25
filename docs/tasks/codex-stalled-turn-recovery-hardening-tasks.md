# Codex Stalled-Turn Recovery Hardening Tasks

## T1 — Tri-state delivery reconciliation — completed

- Add failing tests for uncertain steer delivery and recovery failure.
- Preserve unresolved input without blind queue/start retry.
- Reconcile again after recovery and queue only on confirmed absence.
- Acceptance: H1–H2.

## T2 — Start-timeout reconciliation — completed

- Add failing tests for accepted, absent, and unknown `turn/start` timeouts.
- Preserve the stable client ID and resolve the dequeued input without loss or
  duplicate delivery.
- Acceptance: H3.

## T3 — Recovery error ownership and visibility — completed

- Add a deterministic failing test for reconnect/resume rejection.
- Catch detached recovery failures and emit outcome-accurate status.
- Acceptance: H4–H5.

## T4 — Verification — completed

- Run targeted Codex/router/queue tests, CLI typecheck, diff checks, workflow
  validation, and final whole-diff review.
- Acceptance: H6.
