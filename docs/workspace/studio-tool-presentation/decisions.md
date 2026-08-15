# Decisions: `studio-tool-presentation`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where does the visual variant activate? | resolved | Only packaged Tauri Desktop resolving to `studio`; all other clients fail closed to existing defaults. |
| D2 | Which components may change? | resolved | Only `components/tools/**` and the new region-owned feature module; parent owns integration and any external seam. |
| D3 | How is visual acceptance decided? | resolved | Deterministic tests prove wiring and behavior; the parent captures an integrated packaged transcript for explicit user judgment. |
