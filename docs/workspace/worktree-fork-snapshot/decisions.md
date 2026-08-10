# Decisions: `worktree-fork-snapshot`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Does the existing fork action change behavior? | resolved | No. Add an explicit independent-Worktree action; normal fork and side chat continue sharing the source directory. |
| D2 | How are dirty changes inherited without mutating the source? | resolved | A machine-side module recreates the source index in the target and copies the exact working-copy overlay; no stash, commit, or source-index write is allowed. |
| D3 | Which files are inherited? | resolved | Staged, unstaged, deleted, renamed, and non-ignored untracked paths. Ignored paths are excluded. |
| D4 | What happens for unsafe Git states? | resolved | Conflicts, in-progress operations, sparse checkout, nested repositories, and dirty submodules fail closed with an actionable error. |
| D5 | How is partial failure handled? | resolved | The orchestration owns a bounded cleanup token returned by worktree creation and removes only its newly-created worktree/branch before spawn success. |
| D6 | How are provider histories moved to the new directory? | resolved | Codex forks with the target cwd; Claude copies the transcript into the target directory's Claude project storage. |
