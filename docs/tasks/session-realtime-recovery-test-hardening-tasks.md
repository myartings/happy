# Tasks: Session Realtime Recovery Test Hardening

## H1 — Stateful Socket.IO recovery fake

Status: completed.

- RED: prove the current passive double cannot validate monitor restart.
- GREEN: drive disconnect/connect handlers and verify one restarted interval,
  reset diagnostics, and a second independent recovery cycle.

## H2 — Real Sync host reconciliation

Status: completed.

- RED: enter through exported `Sync` visibility and update subscriptions and
  demonstrate missing stable host seam or missing incremental request evidence.
- GREEN: expose only the necessary lifecycle seam; validate activity, done,
  reconnect, visibility, side-effect, and monotonic cursor behavior through the
  real owned path.

## H3 — runCodex lifecycle consumer

Status: completed.

- RED: prove the current inline consumer cannot be tested and duplicate
  completion would reset diff more than once.
- GREEN: extract the consumer used by `runCodex`; verify primary/child and
  completion/abort sequences with exact effect counts.

## H4 — Verification and review

Status: completed.

- Run focused tests after every tracer bullet.
- Run App typecheck, CLI full suite, applicable workflow checks, diff integrity,
  and whole-diff review.
