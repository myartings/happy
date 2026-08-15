# Decisions: `studio-activity-transcript`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Reuse terminal ANSI/TUI output or preserve structured events? | resolved | Preserve the existing Codex completion event fields and render with Happy components. The current app-server adapter already exposes output/exit/duration; parsing a terminal screen would lose structure and accessibility. |
| D2 | Replace the frozen session event or extend it? | resolved | Add optional result/error fields to the existing `tool-call-end`. Legacy `{t, call}` remains valid, so old history and other producers need no migration. |
| D3 | How much command output may enter sync/history? | resolved | Apply a deterministic code-unit bound before envelope creation, preserve surrogate boundaries, and append an explicit truncation marker. UI bounds remain defense in depth. |
| D4 | How is command failure determined? | resolved | Prefer numeric non-zero exit code; otherwise use a recognized provider failure status. Never infer failure from output prose. |
| D5 | Should activity grouping/localization be replaced? | resolved | No. Existing categories and localized `Ran/Read/Edited` labels are authoritative; only add Studio semantic tokens and real result data. |
| D6 | Is a protocol migration or backend rollout required? | resolved | No. The encrypted message payload already transports passthrough session envelopes; additive optional fields are producer/consumer compatible and require deterministic schema tests, not data migration. |
| D7 | Should Studio replace the diff engine or only change transcript disclosure? | resolved | Keep `ToolDiffView` and Pierre authoritative for patch parsing, syntax highlighting, wrapping, line numbers, and green/red line backgrounds. Only packaged-Tauri Studio starts valid structured file edits expanded and uses a compact path/kind/count disclosure; other presentation modes retain the existing initially-collapsed behavior. |
