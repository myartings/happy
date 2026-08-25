# Journal: `codex-stalled-turn-recovery`

## `2026-08-26`

- Started workflow.
- Classified as a Feature because it changes Codex turn lifecycle behavior and
  must cover transport uncertainty, interruption, and retry semantics.
- Scope is limited to Happy CLI; no server, app, persisted-data migration, or
  cross-device protocol change.
- Risk result: cleared with controls. Controls are client-message correlation
  before retry, activity-aware deadlines, authoritative `thread/read`, bounded
  interrupt/restart, same-thread resume, visible recovery, and regression tests.
- Stop conditions: do not blindly retry an uncertain steer; do not abort a turn
  that has emitted activity within the inactivity window; do not start queued
  input until the previous local pending turn is settled or the backend has
  been restarted.
- Rollback is a code revert; no migration or destructive action is involved.

## 2026-08-26 — Verification and review

- CLI typecheck and build pass. New recovery, correlation, compatibility,
  stale-notification, routing, and queue tests pass.
- Full Windows suites expose existing platform assumptions and an incomplete
  Prisma environment after the repository Skia postinstall fails on Unix `rm`;
  the feature has no Happy App or Server diff.
- Whole-diff review found and fixed one recovery-delay issue: late events from
  another thread/turn could reset the current inactivity deadline. Activity is
  now identity-scoped and regression-tested.
- Final review found no blocking correctness, security, protocol, persistence,
  concurrency, compatibility, or rollback issue in the bounded CLI diff.
