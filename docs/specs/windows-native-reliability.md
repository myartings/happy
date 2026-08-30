# Windows Native Reliability Specification

## Boundary

This feature provides a native Windows verification contract for
`devtools/happyctl.ps1`, the Windows-relevant Happy CLI tests, and the desktop
build command. It does not change application UI or itself authorize
installation, branch synchronization, publication, registry writes, task
registration, or daemon lifecycle changes. Delivery authority is recorded
separately in the active Workspace; the current authorization is limited to a
new feature-branch push and PR targeting `dev`, not a merge.

## Public verification entry

The repository exposes one self-contained PowerShell smoke entry under
`devtools/tests/`. Its canonical invocation is compatible with Windows
PowerShell 5.1:

```powershell
powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File .\devtools\tests\happyctl-windows-smoke.ps1
```

The entry uses built-in PowerShell/.NET facilities and existing Windows/Git
tools only. It must not require Pester, install a module, or modify machine-wide
configuration. It creates disposable fixtures below the process temporary
directory, reports individual contract failures, exits non-zero on any failure,
and cleans up only fixture paths it owns.

## Fixture and isolation contract

- At least one fixture root contains both spaces and non-ASCII characters.
- Fixture repositories, hooks, tools, build artifacts, install directories,
  backups, logs, reports, and config files remain below that owned root.
- Child PowerShell processes receive explicit process-scoped environment and a
  fixture config so the user's default `config.windows.ps1` cannot redirect a
  test to another checkout.
- Tests may read real toolchain information, but they may not invoke a real
  installer, stop a process, write an uninstall key, register/delete a task,
  switch a real branch, fetch, push, merge, or create a real devtools report.
- The suite records and compares the fixture repository and fixture filesystem
  before and after every dry-run family.

## Observable behavior

### PowerShell compatibility

Both the production script and smoke entry parse with zero AST errors in
Windows PowerShell 5.1. If `pwsh` is installed, they also parse and the suite is
run there as an additional compatibility signal.

### Isolated Node 20

- An explicit existing `HAPPY_BUILD_NODE_ROOT` is selected exactly and placed
  ahead of ambient Node installations for the child process.
- With no explicit root, both the current `Happy Devtools\tools` location and
  the legacy `Happy Manager\tools` location remain compatible discovery roots.
- Discovery accepts only `node-v20.*-win-x64` candidates containing
  `node.exe`, choosing the newest compatible candidate across both roots.
- A configured root without `node.exe` fails closed with the resolved missing
  path in the diagnostic.
- The build precondition accepts an active major version 20 and rejects a
  different major version without starting package or Tauri work.

### Doctor

The smoke suite deterministically exercises a complete-toolchain fixture and a
missing-tool fixture. Complete prerequisites yield exit code zero and
`Doctor passed.`; a missing required command yields non-zero and the summary
`Doctor found missing Windows Tauri build prerequisites.` without attempting a
repair.

### Git safety

Real temporary Git repositories prove that:

- the configured hook path and matching tracked/installed pre-push content are
  accepted, while a missing or drifted hook is rejected;
- an official-baseline build rejects a non-`main` branch;
- an allowlisted devtools-only delta from `upstream/main` is accepted; and
- a product-file delta is rejected before build/update work.

### Artifacts

An empty fixture yields the documented no-artifacts result. A populated fixture
returns the non-empty release `app.exe`, NSIS setup executable, and MSI package.

### Dry-run invariants

With fixture inputs, each of these completes without changing fixture Git
state, branches, file hashes, install contents, uninstall-key sentinel,
scheduled-task sentinel, process sentinel, logs, reports, or backups:

- `update-desktop -DryRun` with a valid NSIS artifact;
- `refresh-desktop -DryRun`; and
- `refresh-official-baseline -DryRun`.

Output must identify the intended source/installer/target and explicitly state
that no changes were made. Missing required artifacts fail before any mutation.

### Recorded Windows-only gaps

- The standard `pnpm --filter @slopus/happy-wire test` command must execute on
  native Windows without POSIX `$npm_execpath` expansion.
- The focused Codex app-server sandbox test must model its intended platform.
  On native Windows, production skips the managed sandbox path; a test of the
  non-Windows wrapped transport must explicitly mock a supported non-Windows
  platform rather than asserting that path against the host platform.
- The complete native CLI baseline must pass. Host-independent test inputs use
  native path resolution, while production code changes require a reproduced
  runtime failure. In this baseline, Windows packaged-ripgrep discovery and
  platform-neutral Claude path classification are runtime contracts rather
  than test-only expectations.
- If any reported gap does not reproduce after deterministic setup, no
  production/test behavior is changed and validation records the setup,
  command, output, and counter-evidence.

### Real native validation

Final native verification runs `doctor` and `build-desktop` against this
worktree using an explicit temporary devtools config and isolated Node 20.
`build-desktop` must not be followed by any install or launch-verification
command. The required `app.exe`, NSIS, and MSI outputs must exist, be non-empty,
and have timestamps at or after the captured build start.

The prebuilt-frontend Tauri override is passed as a temporary UTF-8 JSON file,
not inline JSON that a Windows command shim can dequote. The file may live only
under the configured devtools state root and is removed after either success or
failure.

## Acceptance criteria and evidence

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | Production and smoke scripts have zero Windows PowerShell 5.1 AST errors. | Explicit 5.1 parser command. |
| AC2 | The smoke entry is self-contained and uses a space+CJK fixture path without Pester/global installs. | Two consecutive suite runs and source inspection. |
| AC3 | Explicit, current-location, legacy-location, missing-root, and wrong-major Node paths behave as specified. | Smoke assertions. |
| AC4 | Doctor's complete and missing prerequisite outcomes are deterministic and non-mutating. | Smoke child-process assertions plus real doctor. |
| AC5 | Git hook drift, branch, and product-difference guards fail closed in real temporary repositories. | Smoke Git fixtures. |
| AC6 | Missing and populated artifact fixtures return the documented results. | Smoke artifact assertions. |
| AC7 | All three desktop dry-run families preserve fixture state and advertise no mutation. | Before/after fixture digests and smoke output assertions. |
| AC8 | The happy-wire standard package test works on native Windows. | `pnpm --filter @slopus/happy-wire test`. |
| AC9 | Sandbox regressions and the complete CLI suite are host-platform truthful and pass on Windows. | Focused Vitest commands, full CLI suite, and whole-diff review. |
| AC10 | The smoke suite passes twice under 5.1; installed PowerShell 7 supplies an additional pass. | Four exact suite/parser results when `pwsh` exists. |
| AC11 | Real doctor and non-installing desktop build pass from this worktree, including Windows-safe Tauri override marshalling. | Exact command logs, smoke regression, and exit codes. |
| AC12 | Fresh non-empty app.exe, NSIS, and MSI outputs were produced after build start. | Path, size, timestamp, and SHA-256 evidence. |
| AC13 | Real installed executables, uninstall entries, Happy tasks, daemon/app process status, and repository invariants do not drift. | Machine-readable before/after snapshots and comparison. |
| AC14 | No excluded UI/visual or external-operation files/actions enter the change. | Whole-diff and system-state review. |

## Accepted uncertainty

Windows build duration and generated artifact hashes are machine-dependent.
Freshness, non-zero size, expected bundle class, and successful command exit are
the stable contract; exact bytes are evidence, not a cross-machine golden.
