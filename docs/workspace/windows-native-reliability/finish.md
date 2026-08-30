# Finish Review: `windows-native-reliability`

## Summary

- Preserved the completed native implementation on local recovery branch
  `quiet-cloud@83f2fd665595` and reconstructed the same engineering slice in
  the independent worktree on `feature/windows-native-reliability`, then
  restored it on latest `dev@cbf63a29`, without rebase or history rewriting.
- Added a self-contained Windows PowerShell 5.1 smoke suite with twelve contract
  groups for parsing, space+CJK paths, isolated Node 20, doctor, Git guards,
  artifacts, real `.cmd` argument marshalling, and all three dry-run families.
- Fixed every stable in-scope native RED: happy-wire `$npm_execpath`, sandbox
  and native-path assertions, packaged `rg.exe` discovery/output, Claude path
  classification, Tauri inline-JSON dequoting through `pnpm.cmd`, and
  CRLF/LF-equivalent Git guard verification.
- Kept all app UI/Studio/visual and server source files unchanged. No installer,
  application launch, registry/task write, daemon action, protected-branch
  mutation, or Windows feature publication has been performed in this
  candidate. The separately authorized prerequisite PR `#68` was merged.

## Verification

- Final AST/smoke matrix: Windows PowerShell `5.1.26100.9202` and PowerShell
  `7.6.4` each parsed both scripts with zero errors and each passed the final
  12-contract suite twice consecutively.
- Worktree-anchored doctor passed with isolated Node `20.20.2`, Git guard,
  MSVC, Rust MSVC toolchain, Git Unix tools, and WebView2.
- happy-wire passed 4 files / 27 tests; the latest-dev Happy CLI rerun passed
  93 files / 903 tests.
- The stable-window `build-desktop` exited 0 and produced fresh non-empty
  `app.exe`, NSIS, and MSI artifacts 162–183 seconds after build start. Exact
  sizes and SHA-256 values are in `validation.md`; all outputs are ignored.
- Both configured typechecks pass. Structured full-check run
  `3c2dcebd-27e9-45e8-9adc-5ef897f28155` binds candidate
  `973f08c107bc`; every command passed except the two unchanged, explicitly
  excluded App Studio/visual and Server local-storage baselines. The receipt
  accepts exactly those failed command indexes (`2` and `3`).
- The first latest-dev comparison was deliberately invalidated after another
  active worktree performed an independently authorized NSIS update. A fresh
  stable window then matched machine, repository, installed executables,
  uninstall registry, scheduled-task, daemon, and App-process state through
  the complete validation and build loop.
- A post-remediation comparison also matched installed executable hashes,
  uninstall registry, both Happy scheduled tasks, daemon, Happy processes,
  hooks path, and source/installed hook contents.
- The schema-3 lifecycle is in `finish`; the exact candidate check and fresh
  dual-axis review are complete, with only finish evidence, archive projection,
  staged CI, and the authorized delivery actions remaining.

## Whole-diff review

The first schema-3 dual-axis review blocked on accepted-contract gaps in real
HKCU read isolation, per-family DryRun snapshots, exact identifier assertions,
and deterministic packaged-ripgrep selection. All four findings received
bounded RED/GREEN remediation: an owned uninstall-entry reader double, three
independent install/registry/repository invariant checks, exact
source/installer/target output, and a preload that removes every system
ripgrep route while requiring the packaged-selection diagnostic.

Fresh independent Spec and Standards reviewers then inspected the exact
remediated candidate `973f08c107bc` and pinned diff
`b5850d456330d567dce4637c0b07cb356723999b6d74854ae7fc4d21bc81e23a`.
Both accepted it with no findings and no follow-up candidates.

## Rollback or mitigation

- Revert only this Goal's devtools, CLI test/runtime, happy-wire script, and
  documentation changes; no data format, protocol, migration, registry, task,
  daemon, or installed-client rollback is required.
- The ignored Tauri `target/` and app `dist/` outputs may be removed separately
  if disk cleanup is desired. They were deliberately retained as fresh build
  evidence and are not installed.
- Temporary verification logs/config/snapshots live under
  `%TEMP%\happy-windows-native-reliability`; the production Tauri override
  itself leaves no residual JSON on either success or failure.

## Lessons promoted

- `CONTEXT.md`: not required; behavior and operator commands are captured in
  the feature spec and `devtools/README.md`.
- `docs/ARCHITECTURE.md` or ADR: not required; no daemon/service, protocol,
  persistence, install, or cross-platform architecture decision changed.
- Skill/workflow rule: no change required. The reusable Windows command rule is
  embodied in the smoke suite: pass structured CLI overrides by temporary JSON
  file when `.cmd` shims would dequote inline JSON.

## Follow-up

- The user authorized one atomic commit, feature-branch push, and PR to `dev`.
  Those delivery actions remain pending finish/archive staged CI and
  outgoing-range CI. The future Windows feature PR is not authorized for
  merge.
- Neither final reviewer proposed a non-blocking follow-up, so no tracker item
  is created. The unchanged App Studio/visual and Server local-storage failures
  remain named accepted limitations outside this Goal, not deferred work owned
  by it.
- Tauri's existing `__TAURI_BUNDLE_TYPE` warning remains an observed limit;
  updater installation/execution was explicitly excluded and no external-state
  action is required.
