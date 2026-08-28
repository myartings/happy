# Risk Assessment: `session-realtime-recovery`

## Classification

Cleared with controls. The change affects all Codex multi-agent Sessions and
foreground App message synchronization, but it does not migrate or delete data,
change encryption, alter persisted schemas, or deploy automatically.

## Failure modes and controls

| Failure mode | Consequence | Control |
| --- | --- | --- |
| A child lifecycle event is treated as primary | Premature idle, wrong steering, early completion | Match raw notifications to the known primary thread; preserve compatibility fallback only for unscoped events; deterministic interleaving tests. |
| A primary completion is ignored | Session remains thinking or a turn waiter hangs | Accept matching primary thread/turn completion and existing final-answer fallback; run nearest Codex lifecycle suite. |
| Slow network causes reconnect loops | UI churn, extra fetches, battery/network cost | Require two consecutive probe timeouts, serialize reconnect, reset on ack/connect, and test timer cleanup. |
| Foreground reconciliation polls too broadly | Server and client load increase | Poll only mounted/visible Sessions while active, use incremental `after_seq`, and retain a 30-second lower-frequency bound. |
| Terminal reconciliation races message persistence | Final reply still appears late | Immediate plus trailing reconciliation, followed by bounded foreground reconciliation. |
| Repeated triggers duplicate data or side effects | Duplicate messages, voice/Git work, reference leaks | Reuse sequence/id reducers and direct cache refresh; never call `onSessionVisible`; test reference-count invariants. |
| Background timers are suspended | Recovery is delayed while App is suspended | Immediate health probe and reconciliation on foreground/focus restoration. |

## Preconditions and stop conditions

- The server's existing `ping` callback remains available to user-scoped sockets.
- No protected/generated path, schema, encryption, authentication, or server
  deployment change is allowed.
- Stop implementation if the raw Codex notification does not expose enough
  thread identity to distinguish primary and subagent events, or if focused RED
  tests fail for setup rather than the intended missing behavior.
- Stop and diagnose after repeated GREEN failures or evidence of an unrelated
  baseline regression.

## Rollback

The change is source-only and reversible by reverting the feature diff. There
is no migration or durable state to undo. Existing Socket.IO reconnect and REST
message-fetch behavior remains underneath the added controls.

## Review

High-risk whole-diff review is required before finish, with explicit inspection
of thread scoping, retry serialization, timer lifecycle, polling bounds,
compatibility, and duplicate-message behavior.
