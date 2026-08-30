# Session Summary: Windows Native Reliability

## Objective and boundary

Complete `windows-native-reliability` in the independent `quiet-cloud`
worktree from validated local `dev`, including a deterministic PowerShell 5.1
contract loop, stable Windows-only fixes, a real non-installing desktop build,
and before/after state proof. App UI/Studio/visual work, server expansion,
installation, and Goal-owned external-state mutation remained excluded. The
user later authorized the prerequisite workflow PR merge plus one Windows
feature commit, push, and PR targeting `dev`; the Windows feature PR itself is
not authorized for merge.

## Outcome

- Added `devtools/tests/happyctl-windows-smoke.ps1`: twelve self-contained
  contract groups, no Pester/global dependency, owned space+CJK fixtures, and
  safe cleanup.
- Replaced happy-wire's POSIX `$npm_execpath` lifecycle expansion with the
  workspace package manager command.
- Made Claude/Codex sandbox tests platform-truthful and path fixtures native.
- Fixed Windows packaged `rg.exe` discovery while keeping launcher stdout clean,
  and made Claude installation-source path classification independent of host
  separators.
- Replaced inline Tauri JSON with a temporary UTF-8 config file after the real
  Windows build reproduced `.cmd` quote loss. The helper cleans after success,
  write/child failure, and propagates the child exit code.
- Made Git guard verification compare CRLF/LF-canonical bytes after the real
  worktree reproduced a false drift report; meaningful content, BOM,
  whitespace, and bare-CR differences remain detectable.

## Evidence

- Final 5.1 and 7.6.4 AST parsing: two files, zero errors in each host.
- Final smoke: two consecutive 12/12 passes in each host. DryRun fixtures use
  owned uninstall JSON and compare each family independently, including install
  contents and exact source/installer/target output.
- Worktree doctor: passed.
- happy-wire: 4 files / 27 tests; latest-dev CLI: 93 files / 903 tests.
- Real `build-desktop`: exit 0; fresh app.exe, NSIS, and MSI with exact
  timestamp/size/SHA-256 evidence in `../validation.md`; no install or launch.
- Workflow adoption, 14 core tests, 14 CI tests, typechecks, static scope,
  whitespace, and complete diff review passed.
- A first latest-dev window was invalidated when another active worktree ran an
  independently authorized NSIS update. Its persistent log and exact artifact
  hash identify the external writer; this Goal made no compensating mutation.
- A fresh stable window then reran the complete validation and build loop.
  Machine, repository, installed executables, uninstall registry, scheduled
  tasks, daemon, and app-process groups were unchanged; only allowlisted Goal
  files are dirty and build outputs are ignored.

## Accepted gaps and limits

- Broad app tests retain 17 failures in six unchanged Studio/visual files; the
  user explicitly prohibited this Goal from entering that scope.
- Broad server tests retain two failures in unchanged local attachment/avatar
  behavior; server product work is outside this contract.
- Tauri emitted an updater bundle-type warning and Expo force-exited after a
  successful export. Required artifacts are valid, but updater/install behavior
  was explicitly not exercised.

## Durable locations

- Contract: `docs/specs/windows-native-reliability.md`
- Tasks: `docs/tasks/windows-native-reliability-tasks.md`
- Exact evidence and limitations: `../validation.md`
- Running decision trail: `../journal.md`, `../decisions.md`
- External logs/snapshots: `%TEMP%\happy-windows-native-reliability`

The Windows feature commit remains `pending`; no Windows feature PR is linked.
Prerequisite workflow PR `#68` was separately authorized and merged before the
latest-dev stable validation.
