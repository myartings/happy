# Decisions: `new-session-first-message`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Does this need a protocol or server change? | resolved | No. The session is created successfully; the client clears and navigates before proving the first message entered its local outbox. Keep the fix inside client sequencing and existing cleanup operations. |
