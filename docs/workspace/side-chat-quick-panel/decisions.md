# Decisions: `side-chat-quick-panel`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What should be copied from Codex? | resolved | Copy only the right-panel toggle states, selected treatment, tab/add/fullscreen placement, and compact entry flow. Keep Happy behavior underneath. |
| D2 | What happens when the panel is collapsed? | resolved | Collapse only changes visibility. It must not kill, archive, or remove a side chat. |
| D3 | Where do Git Changes and All Files go? | resolved | Keep both features and expose them from the adjacent overflow menu while the quick UI is enabled. |
| D4 | How is the feature isolated? | resolved | Add a device-local Personal Development switch. When disabled, render the existing official Happy sidebar UI. |
| D5 | What is explicitly out of scope? | resolved | Daemon, server, sync, protocol, context inheritance, storage, recovery, and mobile/narrow-layout behavior. |
| D6 | Which sidebar icon should the quick panel use? | resolved | Match the user-supplied Codex reference with a custom 24×24 SVG: 18×18 rounded outline at (3,3), a right divider at x=15, and a uniform 2-unit stroke. Keep the glyph constant across states and express expansion through button selection. |
| D7 | What does “right aligned” mean for the collapsed control? | resolved | Pin only the quick-panel header controls 16px from the full web/Tauri session header edge. Do not align them to the centered 800px title column, and do not change file/diff overlay slots. |
