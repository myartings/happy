# Decisions: `side-chat-picker-default`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What should the quick sidebar do when no side session exists? | decided | Open the existing official sidebar picker with no active panel. Do not call `spawnSideChat` until the user explicitly selects New side chat. |
| D2 | What should happen when side sessions already exist? | decided | Preserve the current fast restore path by reopening the Side Session panel without creating another session. |
| D3 | Does the picker need a separate implementation? | decided | No. Reuse the existing `FilesSidebar` null-active-panel picker so labels, shortcuts, availability, and creation wiring remain canonical. |
