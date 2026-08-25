# Codex Stalled-Turn Recovery

## Outcome

When a user sends one or more follow-up messages to a Happy-managed Codex
session, the messages must not remain silently blocked behind a stale turn.
Happy either delivers the message to the active turn, queues it for the next
turn, or automatically reconciles and recovers a stalled Codex app-server.

## Scope

- Codex sessions driven through Happy CLI's app-server adapter.
- Follow-up text and supported image inputs received while a turn is active.
- Turn lifecycle reconciliation after missing completion notifications.
- Automatic bounded recovery when the app-server stops acknowledging requests.
- Existing Happy session messages and logs for recovery visibility.

## Non-goals

- Changing Happy's cross-device session or message protocol.
- Guaranteeing idempotent retries on Codex runtimes that do not provide them.
- Replacing Codex's experimental durable server-side queue.
- Changing the behavior of `/clear`, goal commands, permission decisions, or
  model-selection controls.
- Retrying a user message when Happy cannot determine whether Codex accepted it.

## Observable behavior

1. Every ordinary follow-up received by the Codex adapter is assigned a stable
   client message ID for the duration of its delivery attempt.
2. Active-turn steering includes that ID and uses a bounded acknowledgement
   timeout so one unresponsive request cannot indefinitely block later input.
3. When steering acknowledgement is uncertain, Happy reads the authoritative
   thread history. If the matching client ID is present, the input is treated
   as delivered and is not queued again.
4. When steering is rejected or is confirmed absent, the original text,
   attachments, and mode are queued exactly once for a later turn.
5. If Codex is already idle or the awaited turn is terminal but Happy missed
   the completion notification, reconciliation completes the local turn and
   drains queued input without user intervention.
6. A running turn's timeout measures inactivity, not total wall-clock duration.
   Meaningful app-server traffic extends the deadline.
7. After the inactivity deadline, Happy reconciles the thread. A terminal turn
   is completed locally; an unresponsive or still-stalled turn is interrupted
   and the app-server is force-restarted after the existing bounded grace
   period, then the thread is resumed and queued input proceeds.
8. Automatic recovery is visible in Happy and in structured logs; the session
   remains usable after recovery.

## Compatibility and safety

- `clientUserMessageId` is optional in Codex app-server and is supported by the
  installed schema; older runtimes ignore an omitted ID and reject unsupported
  fields through the existing fallback path.
- History correlation prevents an acknowledgement timeout from blindly
  duplicating a message already accepted by Codex.
- Recovery reuses the existing bounded interrupt/restart/resume mechanism.
- A turn that continues emitting activity is never aborted merely because its
  total duration exceeds ten minutes.
- Rollback restores the prior steer fallback and fixed wall-clock timeout; no
  persisted data migration is involved.

## Acceptance criteria and evidence

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | `turn/steer` and `turn/start` accept and transmit a client message ID when supplied. | App-server client unit tests. |
| AC2 | A timed-out steer found in thread history is not queued again. | Router/client behavior test. |
| AC3 | A rejected or confirmed-absent steer queues the original input exactly once. | Router behavior tests. |
| AC4 | A missed completion notification is repaired from an idle thread or terminal turn and queued input can proceed. | App-server client unit test. |
| AC5 | Continuing app-server activity extends the inactivity deadline beyond the original wall-clock limit. | Fake-timer client unit test. |
| AC6 | An inactive, non-terminal turn invokes bounded interrupt/restart/resume instead of being locally marked aborted. | App-server client unit test. |
| AC7 | Recovery emits a visible session message and leaves the session able to process a later prompt. | Host/client integration-oriented unit test or deterministic inspection plus client test. |
| AC8 | Targeted Codex suites, Happy CLI typecheck, complete CLI tests, and workflow checks pass. | Recorded validation commands. |
