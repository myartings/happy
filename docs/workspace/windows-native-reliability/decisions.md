# Decisions: `windows-native-reliability`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Does this Goal require a tracker item or PR? | accepted | No tracker Issue is required; this remains an explicitly accepted local-only task. The original implementation excluded publication, then the user separately authorized one atomic commit, a push of `feature/windows-native-reliability`, and a PR targeting `dev`. No merge is authorized. |
| D2 | What test runtime is allowed? | accepted | Built-in Windows PowerShell 5.1/.NET assertions and child processes only; no Pester or new global dependency. PowerShell 7 is additive when installed. |
| D3 | How are commands near destructive operations tested? | accepted | Use owned temporary fixtures and only `-DryRun`; never call real install/update, registry-write, task registration/removal, branch sync, fetch/push/merge, or daemon lifecycle commands. |
| D4 | Which checkout may real doctor/build inspect? | accepted | An explicit temporary `HAPPY_DEVTOOLS_CONFIG` anchors `$HappyRepo` to this worktree, overriding the user's persistent config that points to the main checkout. |
| D5 | When may recorded Windows gaps be changed? | accepted | Only after native setup produces a stable RED. Unavailable dependencies and non-reproduction are documented rather than treated as product failures. |
| D6 | How is the already completed Goal adapted to the commit-bound workflow now present on `dev`? | accepted | Preserve the original feature and merge commits on local branch `quiet-cloud`; reconstruct the same engineering diff from latest `dev` without rebasing or force-pushing; generate schema-3 state and `archive-introducing-commit` terminal evidence; rerun candidate-bound checks and independent review before delivery. |
| D7 | How is concurrent external-state drift handled during final verification? | accepted | Preserve and identify the invalidated window; do not install, roll back, or otherwise mutate external state. Wait until the external writer is inactive, capture a new baseline, rerun the complete validation and non-installing build loop, and require a clean semantic before/after comparison. A second drift would stop the Goal for owner direction. |
| D8 | How are DryRun uninstall-key reads isolated without changing real behavior? | accepted | Put the existing read behind a narrow `Get-UninstallRegistryEntry` function and replace only that function inside the smoke process with an owned JSON sentinel reader. Snapshot both profile sentinels and install trees around each family independently; never redirect or create a real HKCU key. |

## Risk assessment

**Outcome:** cleared-with-controls.

- Affected external state: two installed Happy clients, their uninstall keys,
  two observed Happy scheduled tasks, the running Happy daemon and development
  app, the shared Git hook, the user's persistent devtools config, local
  branches/remotes, and ignored build/dependency outputs.
- Reversibility: tracked source/test edits are reversible; installation,
  registry, scheduled-task, branch/remote, and daemon mutations are explicitly
  outside this Goal because partial failure would be more costly and could
  disrupt the active client/session.
- Failure modes: persistent config redirects commands to the main checkout; a
  test accidentally calls a non-dry-run command; a fixture path escapes its
  temporary root; build output is mistaken for installation; a child process
  inherits ambient tools/config; validation reports a pass after unavailable
  setup; ignored build work masks tracked repository drift.
- Controls: explicit worktree config for real commands; fixture-owned roots with
  resolved-path assertions; child-process environment restoration; only
  read-only or `-DryRun` update/refresh calls; no install/verify-launch/task/
  daemon/sync commands; before/after SHA-256 and state snapshots; fresh-build
  timestamp checks; exact exit-code capture; strict workflow audit and
  whole-diff review.
- Stop conditions: any required daemon/service architecture choice, need for a
  real install/registry/task mutation, mutation of `dev`, force-push/history
  rewrite, unowned dirty-state overlap, or inability to prove the target path
  remains inside the owned fixture/worktree stops implementation for owner
  direction. The only approved remote writes are the new feature branch and
  its PR targeting `dev`.
- Rollback: revert only this Goal's tracked test/code/docs changes; ignored
  build artifacts may remain. No external-state rollback should be necessary
  because external writes are prohibited.
