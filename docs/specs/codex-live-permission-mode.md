# Codex Live Permission Mode Specification

## Boundary

This feature makes an explicit permission-mode selection in a connected Happy
client take effect in the live Codex CLI session without waiting for another
chat message. It covers Codex only. It does not change launch defaults, infer a
mode from missing metadata, redesign permission UI, alter other agents, or
perform packaging/release work.

Synced session metadata remains the cross-device display mirror. It is not an
authorization command. A live permission change is accepted only through the
session-scoped encrypted RPC registered by the connected Codex CLI.

## Live control contract

- The client first reads the current CLI generation through the encrypted
  `permission-mode-state` RPC, then sends a session-scoped `permission-mode`
  RPC containing that generation, a client-generated request ID, and the
  explicitly selected mode.
- RPC parameters and acknowledgement use the existing session encryption key.
  The server routes opaque ciphertext and cannot manufacture a valid request.
- The CLI accepts only supported remote Codex permission modes. Invalid or
  malformed requests fail closed and leave the current live mode unchanged.
- The CLI remembers every accepted request ID for the current process/generation.
  A duplicate request returns its original acknowledgement without applying
  the transition or resolving approvals again, unless an intervening abort
  invalidated that acknowledgement; an invalidated duplicate fails closed.
- The RPC acknowledgement identifies the applied mode and the number of
  already-pending approvals resolved by that transition, plus a monotonic CLI
  revision and generation that record cross-client RPC arrival order.
- Before updating its mirror, the app sends the complete acknowledgement to
  `permission-mode-confirm`. The CLI atomically verifies that it is still the
  current generation/revision/mode and schedules the encrypted metadata
  publication before replying. An intervening abort or later selection makes
  confirmation fail visibly instead of publishing stale state.
- The app updates its local and synced metadata mirror only after a valid CLI
  acknowledgement. A timeout, disconnect, unavailable handler, malformed
  response, or mismatched acknowledgement leaves the displayed and persisted
  selection unchanged and surfaces an error.
- Explicit selections made rapidly by one client are serialized. Selections
  from different authenticated clients are ordered by arrival at the owning
  CLI; metadata CAS conflict handling preserves the greatest acknowledged CLI
  revision even if client persistence completes in reverse order.

## Approval transition semantics

At RPC handling time the CLI updates its live permission state before touching
pending approvals. This event-loop order defines the race boundary:

- Auto to YOLO: approvals already pending when the RPC handler snapshots the
  permission handler are approved by that same explicit action. An approval
  arriving after the mode update reads YOLO and is auto-approved.
- YOLO to Auto: the live state changes immediately. New approvals arriving
  after the transition use Auto and are presented to the user. No completed
  approval is reopened.
- Other valid Codex modes update the live state. Only a mode for which the
  existing Codex policy explicitly permits automatic approval may resolve the
  pending snapshot.
- Abort/reset retains its existing fail-safe behavior. A stale RPC duplicate
  cannot re-approve after reset because Abort rotates an unpredictable
  generation before waiting, rejects changes during abort, and consumes a
  higher revision. The CLI publishes the reset mode/revision into encrypted
  metadata with a revision-aware updater, so an in-flight older reset or
  mirror write loses regardless of completion order. Session metadata alone
  never changes live authority.

## Execution policy compatibility

The existing policy mapping remains authoritative. In particular, YOLO maps to
Codex approval policy `never` and sandbox `danger-full-access`; Auto maps to
`on-request` and `workspace-write` when Happy is not managing an outer sandbox.
The live control changes approval handling for the active turn but cannot
retroactively change the app-server sandbox parameters with which that turn was
started. YOLO's approval resolver therefore covers escalation prompts in the
active turn, while the next turn receives the full per-turn YOLO policy.

## Failure and recovery

- A disconnected/unregistered CLI causes the RPC to fail visibly; the picker
  does not claim success and metadata is not used as a delayed command.
- After reconnect, the user repeats the explicit selection. No failed request
  is automatically replayed.
- If the RPC succeeds but the later metadata mirror write conflicts, the
  existing optimistic-concurrency retry preserves unrelated fields and the
  greatest confirmed CLI revision. The live acknowledgement remains
  authoritative for the running CLI.
- A process restart discards the request-ID cache and all pending approval
  promises. Existing startup/reset logic clears stale approval UI. A new live
  elevation still requires a new explicit RPC or an explicit permission mode
  carried by a later user message.

## Acceptance criteria and evidence

| ID | Criterion | Planned evidence |
| --- | --- | --- |
| AC1 | Auto to YOLO reaches the connected CLI without another user message. | App operation test plus CLI live-mode controller test. |
| AC2 | Pending approvals at the transition and approvals racing after it are deterministically approved once. | Controller and permission-handler tests. |
| AC3 | YOLO to Auto makes later approvals prompt without another user message. | Controller transition test. |
| AC4 | YOLO retains `never` plus `danger-full-access`. | Existing and focused execution-policy tests. |
| AC5 | Invalid, duplicate, stale-metadata, disconnect, and malformed-ack paths fail closed. | Controller/RPC app-operation tests and source inspection. |
| AC6 | Android, iOS, and Windows use the same shared session operation and semantics. | Shared `SessionView`/sync operation test and platform-neutral source inspection. |
| AC7 | Existing message-meta mode changes, abort/reset safety, and cross-device metadata mirroring do not regress. | Focused existing CLI and app regression suites. |

## Risk controls

Outcome: **cleared-with-controls**.

- Blast radius: one authenticated Codex session; false success could silently
  elevate command and filesystem authority for an active turn.
- Least authority: only the session-key encrypted RPC can elevate live state;
  metadata, defaults, server-visible fields, and unrelated RPCs cannot.
- Idempotency: the process/generation response journal prevents duplicate
  approval, including after arbitrarily many later explicit selections.
- Fail closed: unknown modes and uncertain delivery do not update the picker or
  metadata. There is no automatic retry of an authorization change.
- Race control: update live state, snapshot/resolve pending requests, then
  acknowledge; tests pin approvals on both sides of that boundary.
- Rollback: remove the RPC registration/client operation and controller. The
  existing message-meta and per-turn policy path remains intact.
- Stop conditions: any need to trust plaintext server metadata, add a global
  default, change non-Codex agents, weaken session encryption, or silently
  accept an uncertain RPC requires contract reconciliation before coding.
- Review: independent high-risk Spec and Standards review must verify the
  complete candidate and authorization tests before finish.
