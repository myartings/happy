# Session Realtime Recovery Test Hardening

## Boundary

This follow-up strengthens deterministic coverage for the already accepted
`session-realtime-recovery` behavior. It may expose narrow testable seams and
make primary completion cleanup idempotent. It must not change protocol fields,
server behavior, persisted data, message ordering, or UI behavior.

## Acceptance criteria

### TH1 — Real Sync host path

- Tests enter through the `Sync` host's public visibility/update subscription
  interfaces rather than calling `SessionRealtimeRecovery` directly.
- A visible session's initial fetch establishes a real cursor; activity
  `thinking:true→false`, `session-event/done`, and socket reconnect cause the
  actual incremental `/messages?after_seq=<cursor>` path to run.
- Recovery does not add visibility references or repeat Git/voice focus side
  effects. After the one matching hide, hidden-session terminal signals do not
  reconcile.
- A delayed REST response racing with a socket-advanced cursor cannot rewind
  the next incremental request.

### TH2 — Stateful socket reconnect

- The Socket.IO fake drives registered disconnect/connect handlers and updates
  its connected state.
- Two consecutive health timeouts initiate exactly one reconnect.
- Successful reconnect creates exactly one health interval, resets failure
  state, and permits a later independent two-timeout cycle to reconnect once.

### TH3 — Final CLI lifecycle consumer

- The lifecycle state consumer actually used by `runCodex` turns keepalive on
  once for primary start and off once for primary completion or abort.
- Primary cleanup resets diff state once; duplicate completion is idempotent.
- Child start/complete/abort cannot change primary thinking, keepalive, or diff
  state.

### TH4 — Regression boundary

- Focused App/CLI tests and App typecheck pass.
- The nearest complete CLI suite passes.
- Existing unrelated App full-suite failures are documented and do not expand.
- Workflow audit, diff integrity, and whole-diff review pass.

## Rollback

Revert the test files and narrow seam extraction together. No migration,
feature flag, server rollback, or data repair is required.
