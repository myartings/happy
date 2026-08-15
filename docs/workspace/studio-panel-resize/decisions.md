# Decisions: `studio-panel-resize`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What geometry is owned by Track A? | resolved | Packaged-Tauri Studio uses left default 275pt and right default 360pt. The left value is explicit in AC2; 360 preserves Happy's existing upper-clamped right workspace at 1470pt and avoids inventing unsupported Codex geometry. |
| D2 | What bounds protect usability? | resolved | Left is bounded 220–420pt, right 280–520pt, and the policy reserves 600pt for the main conversation whenever both panels are visible. At infeasible small widths, each panel retains its minimum and the host's existing capability rules decide whether the right panel is available. |
| D3 | How does persistence interact with collapse? | resolved | Persist accepted device-local left/right widths independently. Collapse changes visibility only, never the stored width; reopening projects the stored width through current-window clamps. Double-click commits the side's default. |
| D4 | Which runtimes change? | resolved | Resize geometry and handles activate only when `resolveDesktopVisualStyle` resolves Studio in a packaged Tauri runtime. Default style, standalone web, iOS, and Android retain existing sizing and behavior. |
| D5 | How is drag exposed safely? | resolved | A narrow semantic separator uses pointer capture, horizontal-resize cursor, visible hover/focus/drag feedback, keyboard Arrow/Home reset affordances, and double-click reset. The pure policy owns all projection and clamping. |
