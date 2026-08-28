# Decisions: `session-realtime-recovery-test-hardening`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should the final `runCodex` lifecycle consumer be tested? | resolved | Extract a small state consumer that is called by `runCodex`. It owns primary thinking/keepalive/diff-reset idempotency and ignores events with subagent identity. Directly importing all of `runCodex` would require broad process/API/Ink mocks and would not create a stable public seam. |
| D2 | How should the App test cross the real `Sync` boundary? | resolved | Export `Sync` and expose its update-subscription lifecycle method. Instantiate it with real owned `InvalidateSync` and storage behavior while faking only Socket.IO, encryption, time, notification, voice, and Git boundaries. Assert actual `/messages?after_seq=...` requests and visible/hidden behavior. |
| D3 | How much Socket.IO behavior must the fake model? | resolved | `disconnect()` and `connect()` update `connected` and invoke registered handlers. A successful reconnect must restart exactly one probe interval and clear the pending guard; a later two-timeout cycle must be able to reconnect once again. |
| D4 | May test hardening change protocols or product semantics? | resolved | No. Only seam extraction/export and completion idempotency already required by the accepted primary-turn contract are allowed. No wire/schema/server/persistence/UI change. |
| D5 | Is an external tracker or isolated worktree required? | resolved | No. The user selected immediate local test hardening on the same uncommitted feature branch; there is one implementation owner, no delegation, no queue, and no PR delivery yet. |
