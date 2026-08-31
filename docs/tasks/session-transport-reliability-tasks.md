# Session Transport Reliability Tasks

Status: all T1–T6 completed and evidenced in
`docs/workspace/session-transport-reliability/validation.md`.

## T1 — Baseline and failure matrix

Completed.

- Inventory message send/receive, reconnect, daemon restart, Codex resume, and
  RPC deadline paths in the allowed packages.
- Run focused existing tests and record reproducible failures or missing
  coverage.
- Validation: workflow audit plus baseline commands in `validation.md`.

## T2 — Ordered receive convergence

Completed.

- Add deterministic duplicate, stale, gap, reorder, reconnect, and pagination
  races around the persisted sequence cursor.
- Fix only failures demonstrated by those tests.
- Depends on T1. Validation: focused happy-cli transport tests.

## T3 — Idempotent send and lost acknowledgements

Completed.

- Inject post-persist acknowledgement loss and retry.
- Prove one `(sessionId, localId)` record, ordered outbox draining, and no
  receive-cursor corruption.
- Depends on T1. Validation: focused CLI/server contract or integration tests.

## T4 — Restart and Codex resume

Completed with the live-provider limitation recorded in `validation.md`.

- Exercise CLI/daemon restart identity recovery and requested Codex thread
  resume, including unavailable/ambiguous identity failures.
- Depends on T1. Validation: focused resume and daemon integration tests.

## T5 — Dead RPC bounded completion

Completed.

- Exercise absent target, target death during a call, silent target, reconnect
  inside grace, and grace expiry with deterministic clocks/time bounds.
- Depends on T1. Validation: server socket RPC tests.

## T6 — Repeated stress and whole verification

Completed.

- Run all critical fault schedules for multiple consecutive rounds with fixed
  bounds; record rounds, duration, and zero-loss/duplicate/reorder assertions.
- Run relevant unit/integration suites, typecheck/build, strict workflow audit,
  and whole-feature verification.
- Depends on T2–T5. Record limitations and rollback in `validation.md`.

## Allowed boundary

Product edits are limited to `packages/happy-cli`, `packages/happy-server`, and
`packages/happy-wire`. Tests/harnesses and this workflow's documentation are
allowed. `packages/happy-app`, Studio, theme, and visual files are forbidden.
