# Non-UI Session Transport Reliability

## Boundary

This contract covers persisted session messages and RPC traffic between
`happy-cli`, `happy-server`, and `happy-wire`, including provider resume seams.
It excludes every UI package and presentation concern.

## Reliability invariants

1. The server-assigned session sequence is the sole receive-order cursor.
2. A client advances its receive cursor only after it has consumed that exact
   persisted sequence; a send response cannot advance the receive cursor.
3. Live delivery is a hint. Any gap, duplicate, stale event, reconnect, or
   uncertain state reconciles from the persisted log after the last consumed
   sequence.
4. Reconciliation routes each sequence at most once and in ascending order,
   including across pages and concurrent live notifications.
5. Each logical outgoing message keeps one `localId` across every retry. The
   server treats `(sessionId, localId)` as idempotent and returns the existing
   record for a replay.
6. Removing an outbox item requires a successful persisted response for that
   logical item. Transport errors and lost acknowledgements retain it for a
   later retry during the process lifetime.
7. Restart/resume must resolve durable Happy session and Codex thread identity
   before accepting new work; missing or ambiguous identity fails explicitly.
8. Every RPC has a finite deadline. A missing, disconnected, or silent target
   produces an explicit failure; reconnect grace is bounded and cannot create
   an infinite waiter.

## Required failure scenarios

| Scenario | Required observation |
| --- | --- |
| Network down then recovery | queued writes persist once; missed reads arrive in order |
| Socket disconnect/reconnect | persisted gap is fetched and delivered once |
| CLI or daemon restart | durable identity resumes or explicit failure is returned |
| Codex thread resume | requested thread is resumed without creating/using another thread |
| Duplicate delivery | one application-level delivery per persisted sequence |
| Out-of-order delivery | catch-up emits ascending contiguous sequences |
| Lost write acknowledgement | retry with the same `localId` persists one row |
| Dead RPC target | caller receives bounded disconnect/timeout error |

## Error and compatibility behavior

- Malformed, undecryptable, or non-contiguous records must not silently move
  the cursor beyond an unconsumed message. The client reports diagnostic
  context without plaintext or secrets and retries/reconciles when safe.
- Existing encrypted payloads and session protocol envelopes remain valid.
- No schema migration is permitted for this work; the existing session/localId
  uniqueness contract is the idempotency boundary.
- Stress tooling runs locally with fixed seeds or recorded schedules and
  explicit per-operation and whole-run timeouts.

## Risk assessment and controls

Status: cleared with controls. The blast radius includes all users of persisted
coding sessions and daemon RPC. False success could hide message loss, while a
partial failure could repeat a prompt or an RPC side effect. Changes are source
reversible and introduce no migration, but runtime failures can affect durable
conversation history.

Required controls are stable write idempotency keys, persisted-log
reconciliation, finite RPC and stress-test deadlines, deterministic fault
injection before fixes, compatibility-preserving wire changes, multi-round
zero-loss assertions, exact validation evidence, independent whole-diff review,
and a final forbidden-path inspection. Any evidence of silent cursor advance,
fresh idempotency keys on retry, unbounded waiting, or UI-path modification is
a stop condition until corrected.

## Acceptance criteria and evidence

| ID | Criterion | Evidence |
| --- | --- | --- |
| A1 | Offline recovery has zero loss, duplication, and reorder | deterministic integration test plus repeated stress rounds |
| A2 | Reconnect/gap/duplicate/out-of-order paths converge exactly once in order | CLI transport tests |
| A3 | Ack-loss retry persists one message | CLI/server integration test using stable `localId` |
| A4 | CLI/daemon restart resumes durable Happy identity | restart integration test or bounded local harness |
| A5 | Codex resume preserves the requested provider thread | focused resume tests |
| A6 | Missing, disconnected, and silent RPC targets settle within bounds | server Socket.IO fault tests |
| A7 | Relevant package unit/integration suites pass | exact commands in `validation.md` |
| A8 | Typecheck/build, strict audit, and whole verification pass | exact commands in `validation.md` |
| A9 | No excluded UI/visual paths change | final path-scope diff inspection |

## Rollback

Revert the bounded CLI/server/wire and test/document changes. No database or
stored-message transformation is introduced, so rollback requires no data
migration. Existing clients continue using the same encrypted payload and
sequence/localId fields.
