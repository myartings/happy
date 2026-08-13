# Decisions: `studio-todo-row-v2-04`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Accepted slice | resolved | User approved `docs/design/studio-implementation-slice-v2-04.md` on 2026-08-13 |
| D2 | Existing geometry | resolved | Shared Todo already has 36 pt height and 10 pt radius; do not duplicate or perturb Default values |
| D3 | Runtime boundary | resolved | Optional style metrics are passed only by resolved Studio SidebarView |
| D4 | Shared component boundary | resolved | Add one optional presentation prop; every other caller receives no prop and remains unchanged |
| D5 | Interaction preservation | resolved | Existing count, label, icon, hitSlop, handler, pressed state, accessibility and feature flag remain |
| D6 | Risk | resolved | Presentation-only device-local styling; no protocol, data, auth, migration, protected path or deployment change |
