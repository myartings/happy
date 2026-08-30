# Session Realtime Recovery Specification

## Boundary

This change contains two coordinated fixes:

1. Codex primary-turn lifecycle isolation in Happy CLI.
2. User-scoped socket health recovery and visible-message reconciliation in
   Happy App.

It does not change encrypted payloads, persisted schemas, server message
ordering, or the public Session protocol.

## Observable behavior

### Primary turn

- The Codex thread started or resumed by Happy is the primary thread.
- `turn/started`, `turn/completed`, and idle status from another thread are
  subagent-scoped events.
- Subagent-scoped lifecycle events may be forwarded for transcript visibility,
  but cannot mutate the primary turn ID, resolve its completion waiter, clear
  global thinking, reset primary-turn diff state, or change steering behavior.
- Primary completion remains deduplicated and clears thinking exactly once.
- Raw notifications preserve thread identity. A notification without thread
  identity retains compatibility behavior only when it does not conflict with
  a known primary turn.

### Socket health

- A connected user-scoped App socket periodically calls the server's existing
  acknowledged `ping` event while the App is active.
- One timeout is treated as transient. Two consecutive timeouts force one
  reconnect attempt and reset the failure counter.
- App foregrounding and web/desktop focus restoration request an immediate
  probe because normal timers may have been suspended.
- Health timers stop on explicit disconnect and do not multiply across
  reconnects or token changes.
- Diagnostics record timestamps, failure counts, and reconnect reasons without
  message content.

### Message reconciliation

- REST message history is canonical. Reconciliation requests only messages
  after the Session's current last sequence and reuses existing normalization,
  encryption, locking, and deduplication.
- Visible Sessions reconcile after socket reconnect and foreground resume.
- A visible Session reconciles on a `thinking: true` to `thinking: false`
  transition, with a trailing reconciliation after the producer's message
  outbox has had time to settle.
- While the App is active, visible Sessions receive a bounded periodic
  reconciliation even if no lifecycle or reconnect event arrives.
- Reconciliation never calls `onSessionVisible`, changes visibility reference
  counts, or repeats Git/voice focus side effects.

## Compatibility and failure behavior

- Existing servers already acknowledge `ping`; no server deployment is required
  for the client behavior.
- A failed REST reconciliation retains the existing `InvalidateSync` retry and
  backoff behavior.
- Mobile background suspension may pause probes and periodic reconciliation;
  foreground resume triggers both immediately.
- Duplicate socket events and duplicate REST results remain harmless through
  existing message IDs, sequence cursors, and reducers.

## Acceptance criteria

- AC1: A primary turn remains active after another Codex thread starts and
  completes.
- AC2: User input received during that window is steered to the primary turn.
- AC3: Primary completion clears the active turn and thinking state exactly
  once.
- AC4: A successful App socket ping does not reconnect; two consecutive ping
  timeouts cause exactly one reconnect.
- AC5: Socket health timers and listeners are cleaned up on disconnect and do
  not multiply after reconnect.
- AC6: A visible Session reconciles messages after a thinking-to-idle
  transition without user input.
- AC7: A missed isolated `new-message` event is recovered by foreground periodic
  reconciliation within the configured bound.
- AC8: Hidden Sessions are not periodically polled, and reconciliation does not
  alter visibility reference counts.
- AC9: Focused CLI/App tests, applicable typechecks, and whole-diff review pass.

## Evidence mapping

| Criteria | Evidence |
| --- | --- |
| AC1-AC3 | `codexAppServerClient.test.ts` and focused Codex suite |
| AC4-AC5 | `apiSocket.test.ts` with fake timers and socket boundary double |
| AC6-AC8 | focused reconciliation policy tests plus Sync wiring inspection/tests |
| AC9 | CLI/App focused suites, App typecheck, workflow check, semantic review |
