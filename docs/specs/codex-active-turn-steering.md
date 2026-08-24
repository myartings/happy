# Codex Active-Turn Steering

## Outcome

When a user sends a follow-up message while a Happy-managed Codex turn is
running, Happy delivers that message to the active Codex turn instead of waiting
for the turn to complete and starting another turn.

## Scope

- Codex sessions driven through Happy CLI's app-server adapter.
- Text and supported image inputs received while a normal Codex turn is active.
- Safe fallback to Happy's existing next-turn queue when steering cannot be accepted.

## Non-goals

- Changing Happy's cross-device message or session protocol.
- Steering review or context-compaction turns, which Codex declares non-steerable.
- Applying a newly selected model, effort, permission mode, or appended system
  prompt to an already-running turn.
- Changing `/clear` or other Happy-local command behavior.

## Observable behavior

1. An ordinary user message received while a normal Codex turn is active is
   submitted to that turn and is not subsequently processed as a separate turn.
2. Supported image attachments travel with steered text using the same Codex
   input conversion as a new turn.
3. Messages received while no turn is active continue through the existing queue.
4. `/clear` remains isolated in the existing queue and is never steered.
5. If the active turn ends before steering is accepted, Codex rejects the turn
   precondition, the installed Codex does not support steering, or the active
   turn is not steerable, Happy queues the original message and attachments once.
6. An unexpected steering failure is observable in logs and falls back to the
   queue so user input is not lost.
7. Model, effort, permission, and appended-system-prompt selections received with
   a steered message become defaults for later new turns; they do not mutate the
   active turn.

## Compatibility and operations

- A missing `turn/steer` method degrades to the current queue behavior.
- The request includes the thread ID and expected active turn ID, preventing
  accidental injection into a replacement turn.
- No server schema, migration, authentication, or authorization change is needed.
- Rollback removes the steering route; the existing queue remains available.

## Acceptance criteria and evidence

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | Active text uses `turn/steer` with current thread and expected turn IDs. | App-server client unit test. |
| AC2 | A successful steer is not retained in the next-turn queue. | Routing behavior test. |
| AC3 | Any steering rejection queues the original message exactly once. | Routing behavior tests. |
| AC4 | Idle input and `/clear` retain existing queue behavior. | Existing and new routing tests. |
| AC5 | Supported images are included in active-turn steering input. | Client payload and routing tests. |
| AC6 | Relevant CLI and repository workflow checks pass. | Recorded validation commands. |
