# Codex Stalled-Turn Recovery Tasks

## T1 — Delivery identity and acknowledgement reconciliation — completed

- Add the optional Codex client-message identifier to start and steer requests.
- Bound active-turn steering acknowledgement and correlate uncertain delivery
  against authoritative thread history.
- Preserve exactly-once local queue fallback for rejected or absent input.
- Files: Codex app-server types/client, routing module, host seam, focused tests.
- Acceptance: AC1–AC3.
- Validation: targeted router and app-server client Vitest suites.

## T2 — Activity-aware turn recovery — completed

- Replace the wall-clock false-abort with an inactivity deadline.
- Reconcile idle and terminal authoritative states.
- Reuse bounded interrupt/restart/resume when an inactive turn remains stuck or
  the app-server cannot answer reconciliation.
- Emit an existing-protocol session message when automatic recovery occurs.
- Files: Codex app-server client, host seam, focused tests.
- Acceptance: AC4–AC7.
- Validation: targeted app-server client and host-adjacent tests.

## T3 — Integration and whole-feature verification — completed

- Run the complete applicable Codex and Happy CLI test/typecheck family,
  workflow validation, diff review, and rollback inspection.
- Acceptance: AC8 and all preceding criteria remain covered.
