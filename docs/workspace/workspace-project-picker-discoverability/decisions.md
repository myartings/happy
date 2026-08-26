# Decisions: `workspace-project-picker-discoverability`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which interaction depth should this slice implement? | accepted | User selected the minimal repair: keep search visible, limit the initial Recent list, provide disclosure, and restore scrolling. |
| D2 | Does this require a separate product or architecture decision? | not required | The change preserves RPC, storage, selection, and scanner contracts and only adjusts presentation inside the existing picker. |
