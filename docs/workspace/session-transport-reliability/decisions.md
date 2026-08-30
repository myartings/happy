# Decisions: `session-transport-reliability`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What defines receive order and progress? | accepted | Server `seq`; advance only after consuming that sequence. |
| D2 | What defines send idempotency? | accepted | Stable `localId` retained across retries; existing `(sessionId, localId)` uniqueness. |
| D3 | Is exactly-once RPC side-effect execution promised? | accepted | No. Calls have bounded completion and explicit failures; retry safety remains method-specific. |
| D4 | May this work change UI packages or migrate data? | accepted | No UI/visual changes and no schema/data migration. |
