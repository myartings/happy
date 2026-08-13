# Decisions: `studio-sidebar-frame-v2-01`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Accepted visual slice | resolved | User approved `docs/design/studio-implementation-slice-v2-01.md` |
| D2 | Host boundary | resolved | Studio-owned pure resolver plus narrow seams in SidebarNavigator and SidebarView |
| D3 | Persistence | resolved | Device-local `visualStyle: default | studio`; no sync or protocol change |
| D4 | Review activation | resolved | Explicit `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio` development build override; no settings/translation expansion in this slice |
| D5 | Responsive width | resolved | Studio ratio derives 316 pt at 1470 and remains clamped; default formula remains byte-for-byte behaviorally equivalent |
| D6 | Runtime boundary | resolved | Studio effective only when Tauri packaged desktop is detected; standalone web/iOS/Android resolve Default |
| D7 | Risk | resolved | No auth, protocol, data migration, deployment, protected mobile path or destructive operation |
