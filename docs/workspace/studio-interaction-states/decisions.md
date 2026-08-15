# Decisions: `studio-interaction-states`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Appearance source | accepted | Existing Unistyles `theme.dark` only; no new theme system. |
| D2 | Geometry | accepted | Existing Studio geometry and information architecture stay fixed. |
| D3 | State priority | accepted | Pressed, keyboard focus/selection, pointer hover, then rest; selection stays identifiable when focus moves. |
| D4 | Runtime boundary | accepted | State colors activate only for packaged Tauri Studio. |
| D5 | Delivery | accepted | One isolated local commit; parent owns integration and final visual acceptance. |
