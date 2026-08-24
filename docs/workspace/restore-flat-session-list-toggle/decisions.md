# Decisions: `restore-flat-session-list-toggle`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Should personal `dev` follow the new official always-flat behavior? | resolved | No. The user explicitly requires the existing personal option; restore the pre-merge `dev` wiring while retaining all other official changes. |
| D2 | Does this require a migration? | resolved | No. `flatSessionList` remains in `LocalSettingsSchema`, defaults to `false`, and persisted values are already parseable. |
