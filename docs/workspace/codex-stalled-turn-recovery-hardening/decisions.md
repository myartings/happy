# Decisions: `codex-stalled-turn-recovery-hardening`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What may trigger an automatic retry? | resolved | Only authoritative `confirmed absent`; `unknown` remains pending. |
| D2 | How is a recovery exception handled? | resolved | Preserve pending input, report the actual failure, and keep the session recoverable. |
| D3 | How is `turn/start` timeout resolved? | resolved | Reconcile by stable client message ID; never discard a dequeued item on timeout. |
| D4 | Is a new protocol or persistence format required? | resolved | No. Reuse optional `clientUserMessageId` and in-process delivery state. |
| D5 | What is the execution boundary? | resolved | Main-session, single coherent hardening slice; no delegation, batch, or separate worktree. |
