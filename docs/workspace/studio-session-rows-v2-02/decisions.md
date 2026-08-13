# Decisions: `studio-session-rows-v2-02`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Accepted slice | resolved | User explicitly approved `docs/design/studio-implementation-slice-v2-02.md` |
| D2 | Runtime boundary | resolved | Reuse the v2-01 resolver; Studio row styling is effective only for Tauri packaged desktop |
| D3 | Row coverage | resolved | Apply the same row family to compact active/project rows and legacy history rows; do not change their data or behavior |
| D4 | Information preservation | resolved | Keep existing conditional metadata fields and state indicators; adjust only geometry and styling |
| D5 | Container treatment | resolved | Remove row-card decoration only in Studio; project/header content and interactions remain unchanged |
| D6 | Risk | resolved | UI-only conditional styling; no auth, protocol, migration, synced data, protected mobile path, or deployment change |
