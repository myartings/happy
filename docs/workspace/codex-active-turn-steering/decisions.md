# Decisions: `codex-active-turn-steering`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should an in-flight follow-up reach Codex? | resolved | Use stable app-server `turn/steer`; the generated Codex 0.148.0 schema requires `threadId`, `expectedTurnId`, and user input. |
| D2 | What happens if the active turn changes before delivery? | resolved | Treat the expected-turn precondition as authoritative and enqueue the original message exactly once on rejection. Never retry against a new active turn. |
| D3 | Which messages are eligible? | resolved | Steer ordinary text and supported images. Keep `/clear` and Happy-local control commands on existing paths. Review and compact turns fall back. |
| D4 | How do model, effort, permission, or system-prompt changes behave? | resolved | Preserve them as defaults for later turns; steering cannot mutate the running turn. |
