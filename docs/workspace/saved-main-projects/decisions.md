# Decisions: `saved-main-projects`

| ID | Decision | Evidence / alternatives | Reversibility and cost | Status |
| --- | --- | --- | --- | --- |
| D1 | Store schema-1 `projects.json` under configured `HAPPY_HOME_DIR`. | Machine-local persistence already lives there; repository storage would leak identity across machines/worktrees. | Reversible before migration; wrong placement splits registries. | resolved |
| D2 | Use opaque UUID IDs and canonical-path uniqueness; duplicate add returns the existing entry. | Path IDs encode platform details and change when canonicalization improves. | Migration would be needed later; duplicate IDs make start ambiguous. | resolved |
| D3 | Resolve relative input from machine home, expand `~`, then realpath. | Daemon CWD is an accidental launch detail. | Easy pre-release; wrong base saves the wrong directory. | resolved |
| D4 | Detect linked worktrees by resolved git-dir versus common-dir; map proven linked worktrees to the primary root. Normal repos and submodules use their top-level. | `.git` file type conflates worktrees and submodules; Git-resolved directories distinguish them. | Bounded/testable; error exposes worktrees or collapses submodules. | resolved |
| D5 | Hold an exclusive lock, validate and check optional expected revision, then same-directory temp + rename. | Last-writer-wins loses additions; resetting malformed JSON destroys recovery evidence. | Additive control; false success risks local data loss. | resolved |
| D6 | Resolve `projectId` inside Machine RPC immediately before the existing spawn callback. | Cached App path cannot detect stale ID, changed registry, or missing path. | Narrow additive contract; wrong-path spawn has high operational cost. | resolved |
| D7 | Saved projects are the App picker's only project source. Keep scanner RPC only for old clients and never fall back in the new path. | Mixing Recent/scanner data recreates unstable identity; fallback hides CLI mismatch. | Deletion rollback; new App/old CLI fails explicitly. | resolved |
| D8 | Route desktop and other New Session surfaces through `useStartSessionFromDraft`. | The screen direct-spawn flow duplicates cancellation, retry, and cleanup behavior. | Local refactor with hook suite as authority. | resolved |

No ADR is created: these choices are isolated behind new modules/RPC names and
have deletion-based rollback before migration or external protocol commitment.

## Risk assessment and controls

Result: `cleared-with-controls`.

| Failure mode | Consequence | Required control / stop condition |
| --- | --- | --- |
| Partial or concurrent registry write | Lost identity or unreadable local data | Exclusive lock, expected revision, validate-before-write, same-directory temp/rename, and tests that preserve corrupt bytes. Stop on any lock/revision/rename failure. |
| Worktree/submodule misclassification | Worktree shown as project or wrong root launched | Use Git-resolved top-level/git-dir/common-dir evidence and real Git fixtures. Reject linked worktree when primary root is not provable. |
| Stale App path or ID | Commands start in an unintended directory | Resolve ID and re-stat the primary directory inside Machine RPC immediately before spawn. Never let a supplied directory override an ID. |
| New App with old CLI | Silent return to unstable scanner/Recent behavior | Treat RPC absence as visible unavailability; no fallback. |
| UI/start refactor regression | Duplicate spawn, stuck composer, lost prompt | Reuse shared hook; preserve its cancellation/idempotency tests; retain draft on failure. |
| Rollback after user adoption | Registry becomes unused | Additive schema and handlers only; rollback leaves `projects.json` inert. No deletion/migration is part of this Slice. |

Affected data is limited to one machine-local registry file. No money,
permissions, credentials, Server data, remote tracker state, deployment, or user
project contents are written. Responsible-owner review must confirm the
fail-closed start and corrupt-file controls before finish.
