# Decisions: `studio-command-palette-density`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How narrow should the first revised candidate be? | decided | Restore a 640 pt candidate maximum, the previous compact boundary visible in code history, from the screenshot's 800 pt shell. It is provisional until user screenshot acceptance. |
| D2 | How should the scrim be reduced? | decided | Keep a blocking theme-aware scrim but lower light/dark alpha; preserve outside-click dismissal and fade timing. |
| D3 | Where do density values live? | decided | Add Studio-only Command Palette metrics to `studioOverlayPresentation`; existing static component styles remain the Default fallback. |
| D4 | Does this establish exact Codex parity? | decided | No. It is a user-approved directional revision; exact modal geometry remains an explicit evidence gap. |
