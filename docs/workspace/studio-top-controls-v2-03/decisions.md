# Decisions: `studio-top-controls-v2-03`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Accepted slice | resolved | User approved `docs/design/studio-implementation-slice-v2-03.md` on 2026-08-13 |
| D2 | Runtime boundary | resolved | Reuse the Studio resolver; compact controls are effective only in Tauri packaged desktop |
| D3 | Host boundary | resolved | Feature-owned pure metrics plus one conditional `SidebarView` seam |
| D4 | Interaction preservation | resolved | Existing Pressables, handlers, shortcuts, archive visibility, state, accessibility, and icons remain unchanged |
| D5 | Risk | resolved | Presentation-only device-local styling with no protocol, data, auth, migration, protected path, or deployment change |
