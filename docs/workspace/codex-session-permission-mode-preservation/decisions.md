# Decisions: `codex-session-permission-mode-preservation`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What is the authoritative effective-mode precedence for an existing Codex session? | resolved | A valid explicit local/synchronized per-session mode wins. An explicit synchronized `null` means reset to the current compatible default. Only when the synchronized field was never present may legacy evidence be consulted; otherwise use the compatible default. `SessionView` and outbound message metadata must use the same resolver. |
| D2 | Which legacy evidence may recover YOLO? | resolved | Only `metadata.flavor === "codex"`, no own `metadata.permissionMode` field, and `metadata.dangerouslySkipPermissions === true`. False, null, absent, ambiguous, stale, unsupported, and non-Codex shapes never recover or elevate YOLO. The CLI producer at `runCodex.ts` confirms this boolean represented a YOLO/bypass launch. |
| D3 | How is the cross-device creation race removed? | resolved | The Codex CLI writes the concrete launch `permissionMode` into the initial encrypted session metadata passed to create/reconnect. App-side post-refresh synchronization remains compatibility/reconciliation behavior, not the first authority. |
| D4 | Does the fix change defaults or execution-policy meanings? | resolved | No. Auto remains the product-wide compatible default and every permission key retains its existing CLI execution-policy mapping. |

These choices are reversible within the isolated resolver and metadata producer,
but choosing incorrectly could silently downgrade or elevate execution. The
evidence is the live Issue #87 contract plus repository inspection of
`messageMeta.ts`, `SessionView.tsx`, `storageTypes.ts`, `sessionSetAgentModes`,
and `runCodex.ts` on 2026-09-01. No ADR is warranted: the decisions refine an
existing per-session metadata contract rather than establish a new architecture.
