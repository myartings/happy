# Decisions: `codex-desktop-active-state`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Change the protocol or add a compatibility parser? | superseded | Initial source-shape comparison missed that `normalizeRawMessage` mutates the direct envelope into the canonical wrapper before lifecycle detection. Do not add a redundant parser; continue diagnosis at the state-ordering boundary. |
| D2 | Should heartbeat delivery be redesigned in this slice? | resolved | No. Heartbeats and persisted lifecycle messages already set `thinking`; prevent unrelated async session updates from overwriting that live state. |
| D3 | Which evidenced state overwrite should this slice fix? | resolved | `update-session` captures a session before asynchronous decrypts, then used to spread that stale snapshot after the await. Re-read the latest session and merge only decrypted server-owned fields. |
