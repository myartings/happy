# Decisions: `publish-launch-pinned-codex-effort-dev-integration`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How is the archive conflict resolved? | resolved | Preserve the exact row union of both parents, ordered with the target workflow adoption before the Issue #103 delivery row. |
| D2 | May integration alter product or inherited workflow behavior? | resolved | No. Only the archive union and this canonical integration Workspace may be novel merge-local bytes. |
| D3 | How is history integrated and published? | resolved | Use an ordinary two-parent merge commit, push without force, wait for hosted CI, then merge PR #106 with the repository's normal merge method. |
| D4 | What happens on validation or GitHub-state failure? | resolved | Stop before commit, push, or PR merge as applicable; do not weaken gates or rewrite history. |
