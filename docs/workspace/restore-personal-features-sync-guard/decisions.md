# Decisions: `restore-personal-features-sync-guard`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where should personal switches live after upstream removed `settings/features.tsx`? | resolved | Own them under `sources/features/personal-settings/`; expose a tiny Expo route and Settings navigation seam. This keeps personal behavior out of an upstream-owned page. |
| D2 | Should the old mixed Features page, including official experiments, be restored? | resolved | No. Restore only personal controls. Official settings remain in their upstream locations; Developer Tools keeps its diagnostic controls. |
| D3 | Should Developer Tools keep a second inline copy? | resolved | No. It links to the dedicated screen so switch definitions have one owner and cannot drift. |
| D4 | What must block synchronization? | resolved | After the final branch merge and before push/build/install, validate the module, route, visible Settings entry, and each protected persisted key. Failure is read-only beyond the local merge and must return non-zero. |
| D5 | Are setting migrations or default changes required? | resolved | No. Reuse current synced/device-local keys and setters exactly, preserving stored values and defaults. |
| D6 | Is a tracker item required? | resolved | No. This is an immediate single-session repair requested by the owner, with no delayed pickup, delegation, or external coordination. Durable repository spec/tasks provide the boundary. |
