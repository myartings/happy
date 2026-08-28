# Risk: Session Realtime Recovery Test Hardening

## Assessment

Result: `cleared-with-controls`.

The change is reversible and does not migrate data, deploy services, alter
permissions, or add protocol fields. The consequence of false success is still
material because the covered code controls cross-device Session status and
message recovery.

## Failure modes

- A test-only seam accidentally changes primary-turn lifecycle behavior.
- A Socket.IO fake passes without exercising registered reconnect handlers.
- Sync coverage bypasses `InvalidateSync`, the real cursor, or REST path and
  recreates the original confidence gap.
- Fake timers or global singleton state leak across tests and make results
  order-dependent.
- Recovery increments visibility references or repeats Git/voice focus effects.
- Duplicate completion resets diff state more than once or child lifecycle
  clears primary thinking.

## Controls and stop conditions

- RED must fail for the intended missing seam/behavior before GREEN.
- Mock only system/platform boundaries; use real owned state machines where
  practical.
- No protocol/schema/server/persistence/UI changes are allowed.
- Run focused tests after each tracer bullet, then App typecheck and the full
  CLI suite; compare App full-suite failures to the recorded parent baseline.
- Require whole-diff review and strict workflow audit before finish.
- Stop and route to diagnosis if a focused test fails for unrelated setup,
  global state leaks between tests, or production behavior must expand beyond
  the accepted spec.

## Rollback

Revert the new tests and seam extraction together. No data repair, service
rollback, migration reversal, or feature-flag operation is required.
