# Decisions: `session-realtime-recovery`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What defines the authoritative Codex turn? | accepted | The Happy-started/resumed `_threadId` is primary. Other thread IDs are subagent-scoped. Local logs prove one global turn slot is unsafe. |
| D2 | What is the canonical message source? | accepted | REST Session history and sequence numbers are canonical; sockets are realtime hints. Existing fetch and reducer paths are reused. |
| D3 | How is a half-open socket detected? | accepted | Use the server's existing acknowledged `ping`; two consecutive timeouts trigger one forced reconnect. Socket.IO `connected` alone is insufficient for the reported failure mode. |
| D4 | How are isolated missed events recovered? | accepted | Reconcile visible Sessions on terminal activity and foreground intervals, not only after reconnect or user send. |
| D5 | Should React rendering be forced? | rejected | No. Official issue discussion did not prove the render theory, and forcing a render cannot recover an event absent from the store. Add no render counter or `unstable_batchedUpdates`. |
| D6 | Is a server protocol change required? | rejected | No. `ping` acknowledgement and incremental message history already exist. Preserve wire compatibility. |
| D7 | How is transient network loss handled? | accepted | Require two probe failures, guard concurrent reconnects, keep reconciliation idempotent, and resume immediately on foreground/focus. |
