# Codex Live Permission Mode Tasks

## T1 — Freeze the encrypted live-control contract

Status: completed.

- Scope: trace the shared picker, metadata mirror, session RPC, Codex remote
  mode state, approval handler, abort, disconnect, and reconnect paths.
- Depends on: accepted Issue #88 and exact owning worktree binding.
- Acceptance: the spec distinguishes authorization commands from metadata and
  defines pending-approval ordering, idempotency, failure, and rollback.
- Closest validation: source inspection and planning/risk gates.

## T2 — Add RED tests for live mode transitions

Status: completed.

- Scope: tests for encrypted RPC request/ack behavior, valid and invalid modes,
  duplicate request IDs, Auto-to-YOLO pending approval resolution, YOLO-to-Auto,
  rapid selections, disconnect, and malformed acknowledgement.
- Likely files: focused tests under `packages/happy-cli/src/codex/` and
  `packages/happy-app/sources/sync/`.
- Depends on: T1.
- Acceptance: tests fail because the live permission RPC/controller and shared
  app operation do not yet exist, without changing production behavior.
- Closest validation: focused Vitest invocations for the added files.

## T3 — Implement the smallest live-control path

Status: completed.

- Scope: add the Codex live-mode controller, bounded idempotency cache,
  permission-handler pending approval resolver, session RPC registration, and
  shared app operation; wire the existing shared SessionView picker to the
  acknowledged operation with visible failure.
- Allowed product files: narrow Codex CLI modules/tests, shared permission
  handler support if required, app sync operation/tests, and the shared
  SessionView and encrypted metadata merge seams. No server, launch-default,
  other-agent, or release changes.
- Depends on: T2 RED evidence.
- Acceptance: the focused RED suite is GREEN and all policy mappings remain
  unchanged.
- Closest validation: focused app/CLI tests and typechecks.

## T4 — Verify, review, finish, and prepare delivery

Status: in progress.

- Scope: run applicable workflow checks, focused regressions, strict audit,
  whole-diff inspection, independent high-risk dual-axis review, remediation,
  finish, archive projection, and staged CI.
- Depends on: T3.
- Acceptance: AC1–AC7 have candidate-bound evidence; no excluded scope or
  unrelated dirty state is incorporated; no push, PR, merge, or release occurs.
- Closest validation: `python3 scripts/workflow-check.py --applicable`, focused
  package tests, review receipts, strict workflow audit, and staged CI.
