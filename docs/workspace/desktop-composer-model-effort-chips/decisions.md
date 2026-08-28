# Decisions: `desktop-composer-model-effort-chips`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where should the labels render? | resolved | Packaged desktop Studio only; this meets the client request without changing official web/tablet behavior. |
| D2 | Should each label open a dedicated picker? | resolved | Yes; reuse the existing model and effort picker paths rather than restoring the removed status bar. |
| D3 | Are additional architecture decisions required? | not required | Existing resolved values, callbacks, and picker overlays already provide the complete data and interaction path. |
