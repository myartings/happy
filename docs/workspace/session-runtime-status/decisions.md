# Decisions: `session-runtime-status`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Add a new cross-device status protocol or reuse current signals? | resolved | Reuse `presence`, `thinking`, and pending permission state. The CLI already refreshes the Codex thinking heartbeat every two seconds, so a UI-only change is the smallest honest solution. |
| D2 | Should the client infer progress, subagent waiting, or a stuck session? | resolved | No. The minimum feature reports only observed runtime state and avoids unsupported inference. |
