# Decisions: `codex-permission-mode-latest-dev-integration`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How are archive rows ordered? | decided | Use the workflow-defined exact union: all target (`dev`) rows followed by source-only rows. |
| D2 | How is the shared `Metadata` type resolved? | decided | Use the dev parent's exact block, which already retains Issue #87 `permissionMode` and revision fields while adding the effective route pair. |
| D3 | May the merge change runtime behavior? | decided | No. Any new behavior or authority path is out of scope and blocks delivery. |
| D4 | How is delivery performed? | decided | Ordinary two-parent merge, non-force push, and GitHub merge only after current checks pass. |
