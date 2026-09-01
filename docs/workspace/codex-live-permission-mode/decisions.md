# Decisions: `codex-live-permission-mode`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What carries live authority? | accepted | A session-scoped encrypted `permission-mode` RPC. Synced metadata remains a display/cross-device mirror and cannot elevate live authority. RPC request/response encryption is implemented by the existing session key path. |
| D2 | What happens to an already-pending approval on Auto-to-YOLO? | accepted | The CLI first installs YOLO, then approves exactly the permission-handler snapshot associated with that explicit RPC. Requests arriving afterward observe YOLO and auto-approve. This satisfies the Issue's deterministic pending-request option without trusting stale metadata. |
| D3 | How do retry and replay behave? | accepted | The app does not automatically retry an uncertain authorization RPC. Each explicit action first reads an unpredictable CLI generation and sends it with the request ID. The CLI retains the complete response journal for the process/generation, so an old request remains idempotent after arbitrarily many later selections; Abort rotates the generation. |
| D4 | When does the picker claim success? | accepted | Only after the CLI acknowledgement matches the selected mode and `permission-mode-confirm` atomically verifies the same generation/revision/mode while scheduling CLI-owned metadata publication. Disconnect, timeout, missing handler, intervening abort/change, invalid response, or invalid mode leaves the local/synced selection unchanged and surfaces an error. |
| D5 | How are rapid/cross-device selections ordered? | accepted | One app serializes its own selections. Across authenticated clients, the owning CLI's RPC arrival order is authoritative and each acknowledgement carries its monotonic revision. Reconnect advances the controller from encrypted session metadata. Both App CAS retries and CLI-owned confirmation/Abort publications preserve the greatest revision if writes complete in reverse order. No timestamp or server-readable metadata is treated as authorization. |
| D6 | Does this require a PRD change? | accepted | No. Issue #88 already defines one bounded user outcome and the feature spec freezes its observable contract. Updating project-wide PRD commitments would broaden the slice without adding acceptance value. |

## Risk assessment

**Outcome:** cleared-with-controls.

The affected permission can authorize command execution and full filesystem
access inside one active Codex session. False success is high consequence and
only partly reversible, because a tool may execute immediately after approval.
Controls are the session-key encrypted RPC, strict mode validation, no
metadata-triggered elevation, process-generation request idempotency, no automatic retry
after uncertain delivery, acknowledgement-before-UI, deterministic pending
snapshot ordering, unchanged policy mapping, focused race/disconnect/reset
tests, and independent high-risk review. Any need to weaken these controls or
expand to defaults, other agents, or server protocol is a stop condition.
