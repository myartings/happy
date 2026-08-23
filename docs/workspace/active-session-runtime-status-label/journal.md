# Journal: `active-session-runtime-status-label`

## `2026-08-23`

- Started workflow.
- Added compact-row runtime labels through a focused RED/GREEN slice.
- Review found the Idle label was green while the existing waiting indicator
  was gray; added a failing regression and aligned the text to the secondary
  theme color.
- Local verification passed with the previously accepted unrelated Studio
  baseline gap; post-merge installed-client smoke remains mandatory.
