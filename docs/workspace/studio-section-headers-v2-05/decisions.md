# Decisions: `studio-section-headers-v2-05`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Accepted slice | resolved | User approved `docs/design/studio-implementation-slice-v2-05.md` on 2026-08-13 |
| D2 | Header family | resolved | All first-level SessionsList headers share one presentation; exclude nested project headers and empty-state text |
| D3 | Typography | resolved | Studio uses 12/16 pt and medium-equivalent 500 weight; no new font asset or global typography change |
| D4 | Runtime boundary | resolved | Resolve through the existing Tauri-only Studio feature module; Default and non-Tauri return null metrics |
| D5 | Interaction preservation | resolved | Rendered text and container styles only; no data, action, menu, list, search, or virtualization change |
| D6 | Risk | resolved | Presentation-only device-local styling; no protocol, data, auth, migration, protected path, or deployment change |
