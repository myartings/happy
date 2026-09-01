# Decisions: `needs-attention-current-requests`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Is Issue #70 one independently deliverable slice? | resolved | Yes. It consumes existing encrypted current request state and emits an App-only, navigation-only projection; terminal outcomes, Goal state, providers, and response protocols remain independently rejectable and excluded. |
| D2 | Does offline presentation remove a current reason? | resolved | No. Membership derives from pending collections independently of `SessionState`; disconnected styling remains presentation only. |
| D3 | What authorizes exact request focus? | resolved | The destination requires a non-negative safe observed `agentStateVersion`, equality with current Session state, and the same pending source ID/kind. Every failure opens general current state. |
| D4 | Does generic unread remain promoted? | resolved | Yes, as existing compatibility behavior for this slice. Current permission and answer reasons outrank it; terminal classification is excluded. |
