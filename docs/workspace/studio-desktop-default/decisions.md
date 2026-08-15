# Decisions: `studio-desktop-default`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which visual system controls the personal packaged desktop? | decided | Studio is mandatory for every Tauri runtime; the user explicitly chose to remove the old/new option and use the new design by default. |
| D2 | Should the Default renderer and persisted enum be deleted? | decided | No. Keep them for upstream compatibility and old-data parsing, but make the persisted value inert in Tauri. |
| D3 | Is runtime policy alone sufficient? | decided | No. The production export also embeds `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio` via `cross-env` as explicit, cross-platform build evidence. |
| D4 | Do non-Tauri clients adopt Studio? | decided | No. Standalone Web, iOS, and Android keep the existing Default path. |
