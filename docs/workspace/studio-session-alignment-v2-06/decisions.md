# Decisions: `studio-session-alignment-v2-06`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Accepted slice | resolved | User approved `docs/design/studio-implementation-slice-v2-06.md` on 2026-08-13 |
| D2 | Alignment equation | resolved | Existing title and metadata offset is 16+8=24 pt; Studio becomes 10+6=16 pt |
| D3 | Metadata variants | resolved | Environment, runtime/provider, and identity rows all receive the same optional Studio inset |
| D4 | Runtime boundary | resolved | Metrics resolve through the existing Tauri-only Studio feature module; optional props are absent elsewhere |
| D5 | Behavior preservation | resolved | Style-only change; status semantics, row geometry, hit targets, navigation, context menu, and archive remain |
| D6 | Risk | resolved | Presentation-only local styling; no protocol, data, auth, migration, protected path, or deployment change |
