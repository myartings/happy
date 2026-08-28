# Tasks: Session Realtime Recovery

## T1 - Primary Codex turn isolation

Status: completed.

Scope:

- Preserve raw notification thread identity.
- Keep primary turn state separate from subagent turns.
- Prevent subagent lifecycle from resolving completion or clearing thinking.

Primary files:

- `packages/happy-cli/src/codex/codexAppServerClient.ts`
- `packages/happy-cli/src/codex/runCodex.ts`
- `packages/happy-cli/src/codex/codexAppServerClient.test.ts`

Acceptance: AC1-AC3.

Validation: focused Codex App Server tests, nearest Codex test family, CLI
typecheck/build command available in the package.

## T2 - User-scoped socket liveness

Status: completed.

Depends on: none.

Scope:

- Add acknowledged ping health monitoring to the App socket.
- Force one reconnect after two consecutive timeouts.
- Expose immediate health checks for foreground/focus recovery.
- Clean up timers and record safe diagnostics.

Primary files:

- `packages/happy-app/sources/sync/apiSocket.ts`
- `packages/happy-app/sources/sync/apiSocket.test.ts`

Acceptance: AC4-AC5.

Validation: focused App socket tests and App typecheck.

## T3 - Visible-message reconciliation

Status: completed.

Depends on: T2 public health-check seam.

Scope:

- Reconcile visible Session messages after terminal activity, reconnect,
  foreground resume, and a bounded foreground interval.
- Preserve visibility reference counts and existing message cursor semantics.

Primary files:

- `packages/happy-app/sources/sync/sync.ts`
- focused policy/test files under `packages/happy-app/sources/sync/`

Acceptance: AC6-AC8.

Validation: focused reconciliation tests, nearest sync tests, App typecheck.

## T4 - Integration verification

Status: completed with documented unrelated App-suite baseline failures.

Depends on: T1-T3.

- Run all focused suites and applicable package checks.
- Replay the captured parent/child lifecycle ordering through deterministic
  tests without retaining prompt or response content.
- Review retry, timer cleanup, background suspension, compatibility, and
  rollback behavior.

Acceptance: AC9.
