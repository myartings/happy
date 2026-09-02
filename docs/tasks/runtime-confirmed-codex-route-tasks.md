# Tasks: Runtime-confirmed Codex Route

All tasks belong to one serial Delivery Slice. They share the same authority
invariant and are not independently deliverable child Slices.

## T1 - Atomic metadata contract

Status: completed. Complete-pair, fail-closed clearing, and unchanged-identity
tracer bullets are GREEN.

Scope:

- Add the optional public metadata fields.
- Define one focused helper that publishes or clears a complete confirmed pair
  without changing requested-state `modelMode` behavior.
- Add RED/GREEN tests for complete, unchanged, missing, malformed, partial,
  stale, reset/default, and mismatch evidence.

Likely files:

- `packages/happy-cli/src/api/types.ts`
- `packages/happy-cli/src/codex/codexRuntimeModelMetadata.ts`
- `packages/happy-cli/src/codex/codexRuntimeModelMetadata.test.ts`

Depends on: none. Parallel candidate: no; this is the shared trust contract.

Acceptance: AC1-AC3, AC7. Validation: focused metadata helper tests and CLI
typecheck.

## T2 - App Server lifecycle propagation

Status: completed. Start, resume, fork-resume, primary-thread settings updates,
forced-reconnect confirmation, and failed-reconnect clearing are covered by
focused fixtures.

Scope:

- Preserve the confirmed model/effort pair from thread start, resume, and fork
  response seams.
- Preserve complete confirmation for later route changes only when current App
  Server protocol evidence supports it; fail closed otherwise.
- Add focused client fixtures for valid, absent, partial, and mismatched values.

Likely files:

- `packages/happy-cli/src/codex/codexAppServerTypes.ts`
- `packages/happy-cli/src/codex/codexAppServerClient.ts`
- `packages/happy-cli/src/codex/codexAppServerClient.test.ts`
- focused resume/fork tests

Depends on: T1. Parallel candidate: no; its output type is T1's authority seam.

Acceptance: AC4-AC7, AC11. Validation: focused App Server client, resume, and
fork tests.

## T3 - Session and daemon projection integration

Status: completed. Runtime publication/clearing and the bounded daemon
projection are implemented; Luna Max and unchanged launcher v0.5 parser
fixtures pass.

Scope:

- Publish only confirmed lifecycle evidence from `runCodex`.
- Clear or withhold the pair during unconfirmed requested changes and
  reset/default resolution.
- Prove existing daemon projection visibility, Luna Max end-to-end fixture,
  launcher parser compatibility, and non-Codex compatibility.

Likely files:

- `packages/happy-cli/src/codex/runCodex.ts`
- focused `runCodex` or daemon/session projection tests
- existing launcher parser fixture outside product code only when already
  available as a deterministic consumer seam

Depends on: T1-T2. Parallel candidate: no; integration overlaps both tasks.

Acceptance: AC4-AC11. Validation: focused runtime/projection fixtures and
nearest requested-mode/reconnect/non-Codex regression tests.

## T4 - Whole-slice verification and review

Status: completed. The first independent Spec and Standards review exposed
fail-open validation, stale failed-reconnect state, and a fork projection gap.
The next review exposed mixed notification suppression, unbound-evidence
retention, spoofable daemon mutation, overly broad model identifiers, blocking
projection delivery, and missing end-to-end coverage. All findings are now
remediated; the final deterministic check and fresh dual review must bind the
revised candidate. The two previously identified candidate-external check gaps
remain owner-accepted.

The third Spec review accepted all behavior but required the launcher v0.5
compatibility check to be reproducible inside the pinned candidate. A test-only
behavioral fixture now proves complete Luna Max acceptance, partial deferment,
and mismatched-route rejection. The final pinned candidate passed both Spec and
Standards review.

Depends on: T1-T3. Parallel candidate: no implementation writing; independent
Spec and Standards reviews run at the configured review gate.

- Run focused tests, complete Happy CLI unit suite, CLI typecheck, and
  applicable workflow checks.
- Inspect the complete diff for atomicity, provenance, privacy, compatibility,
  interruption behavior, and rollback.
- Stage the accepted candidate and run the repository delivery CI only after
  implementation, checks, and reviews pass.

Acceptance: AC12.
