# Codex Active-Turn Steering Tasks

## T1 — App-server steering contract — completed

- Add the minimal typed request/response contract and public steering operation.
- Files: Codex app-server types, client, and client tests.
- Acceptance: AC1 and the client-side portion of AC5.
- Validation: targeted `codexAppServerClient` Vitest suite.

## T2 — Active-message routing and fallback — completed

- Depends on T1.
- Route ordinary active-turn messages to steering, preserve special commands,
  convert attachments, and queue exactly once after steering rejection.
- Files: focused routing module, `runCodex.ts`, and focused tests.
- Acceptance: AC2–AC5.
- Validation: targeted routing and clear-command Vitest suites.

## T3 — Integration and whole-feature verification — completed

- Depends on T1 and T2.
- Run the complete applicable CLI test/typecheck family, workflow validation,
  whole-diff review, and document rollback behavior.
- Acceptance: AC6 and all preceding criteria remain covered.
