# Decisions: `codex-permission-mode-dev-integration`

| ID | Decision | Evidence and consequence |
| --- | --- | --- |
| D1 | Preserve both parent contracts rather than selecting one side. | #87 governs cross-client existing/launch state; #88 governs explicit live changes. Dropping either reproduces a confirmed bug. |
| D2 | Keep one `Metadata.permissionMode` declaration as synchronized per-session launch/display state, never a live authorization command. | Both parents use the same optional field compatibly; #88's authenticated RPC and revision remain the only live-change authority. |
| D3 | Use a normal merge and exact archive-row union, with a fresh merge-local workflow for novel combined bytes. | Repository branch policy forbids history rewriting; staged CI explicitly requires checked/reviewed local integration evidence. |
| D4 | Treat unchanged Studio and Windows local-storage failures only through exact candidate-bound user acceptance. | Parent checks identify the same baseline gaps; any new failure blocks integration. |

All decisions are resolved. No ADR is warranted because this integration
preserves two already accepted contracts without creating a new architecture.
