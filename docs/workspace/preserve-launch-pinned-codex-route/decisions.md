# Decisions: `preserve-launch-pinned-codex-route`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What proves that an existing Codex Session already owns a route? | accepted | Only a complete Issue #80 `effectiveModel` / `effectiveReasoningEffort` pair whose model and effort pass equivalent CLI authority validators; launch argv, a partial pair, or malformed non-empty strings are insufficient. |
| D2 | How does Happy distinguish a client/global default from Session-owned route state? | accepted | Synced `session.modelMode` and `session.effortLevel` are per-session values and may reflect launch/current state or later user picks; missing fields are not replaced by client/global defaults when the effective pair is complete. |
| D3 | What should an unchanged Happy message send? | accepted | Reassert existing per-session model/effort values, but omit each missing field when the effective pair is complete so CLI sticky state retains the launch/current value. |
| D4 | What remains compatible? | accepted | Incomplete/legacy evidence keeps the current default injection; permissions, service tier, Rig, non-Codex agents, and explicit-null reset semantics are unchanged. |
