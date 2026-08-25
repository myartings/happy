# Decisions: `codex-stalled-turn-recovery`

| ID | Question | Options and constraints | Status | Decision/evidence |
| --- | --- | --- | --- | --- |
| D1 | What should replace the fixed ten-minute wall timeout? | Extend the timeout; wait forever; or use inactivity plus authoritative reconciliation and bounded recovery. Long local turns prove wall time is not evidence of failure, while waiting forever reproduces the reported silent queue. | resolved | Use inactivity plus `thread/read`; recover only after no app-server activity for the deadline. Local logs contain 242 false wall-timeout events, including turns that continued afterward. |
| D2 | How should an uncertain `turn/steer` acknowledgement be handled? | Blind queueing risks duplicates; dropping risks loss; correlation requires a stable ID supported by the installed Codex schema. | resolved | Send `clientUserMessageId`, read thread history after timeout, and queue only when the ID is absent or steering was explicitly rejected. |
| D3 | When may Happy restart Codex automatically? | Restarting an active healthy turn is disruptive; leaving an unresponsive backend blocks every later message. | resolved | Restart only after the inactivity deadline or when a bounded steer/reconciliation sequence proves the app-server unresponsive; use the existing interrupt grace and resume the same thread. |
| D4 | Does this slice change cross-device protocol or add durable server queueing? | Protocol changes increase blast radius; installed Codex 0.148 exposes message correlation but not the newer experimental queue RPCs. | resolved | Keep the existing Happy protocol and local queue. Use ordinary session messages for visibility and defer experimental Codex queue adoption. |

All decisions are reversible code-only choices. The cost of a wrong recovery
decision is either delayed input or interruption of a genuinely long silent
turn; the activity check, history correlation, and bounded reconciliation are
the required controls.
