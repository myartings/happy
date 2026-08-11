# Decisions: `github-issues-missing-config-entry`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Hide the Session entry or provide recovery? | accepted | Keep the feature-flagged entry and route unavailable states to the existing connection screen so the user sees the precise blocker and recovery action. |
| D2 | Should all failures bypass the picker? | accepted | No. Only connection/configuration failures bypass it; genuine remote ambiguity and lookup failures retain the picker. |
| D3 | Should Manager embed fallback identifiers? | accepted | No. Require explicit public build variables in untracked `config.env` or the environment and fail closed, matching Windows. |
