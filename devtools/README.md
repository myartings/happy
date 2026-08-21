# Happy devtools

`devtools/` contains the personal build, install, backup, rollback, official-baseline, and cross-platform release tooling for this Happy fork. It is intentionally outside the pnpm workspace and does not participate in product builds.

The command is `happyctl`:

```bash
# macOS / Linux
devtools/happyctl status
devtools/happyctl refresh-desktop --dry-run
devtools/happyctl refresh-desktop
```

```powershell
# Windows
.\devtools\happyctl.ps1 status
.\devtools\happyctl.ps1 refresh-desktop -DryRun
.\devtools\happyctl.ps1 refresh-desktop
.\devtools\happyctl.ps1 refresh-official-baseline
```

## Branch model

```text
upstream/main -> personal main (devtools-only delta) -> dev (personal product features)
```

Personal `main` contains the official product tree plus allowlisted infrastructure only: `devtools/`, the two Happy operation skills, `AGENTS.md`, and `.gitignore`. `happyctl` verifies that `main` contains the current `upstream/main` and has no product/build-input differences before using it for the isolated official baseline client.

`refresh-desktop` merges new official commits into personal `main`, verifies that invariant, merges `main` into `dev`, builds `dev`, then installs and verifies the personal desktop client. It stops on dirty state, divergence, conflicts, build failures, or verification failures.

## Local state

Generated state is outside the Git worktree:

- macOS: `~/Library/Application Support/Happy Devtools/`
- Windows: `%LOCALAPPDATA%\Happy Devtools\`
- Linux: `${XDG_STATE_HOME:-~/.local/state}/happy-devtools/`

This includes logs, reports, backups, and the Windows isolated Node runtime. Windows also discovers the legacy `%LOCALAPPDATA%\Happy Manager\tools` Node 20 installation, so migration does not require an immediate reinstall.

Copy `config.example.env` to the untracked `devtools/config.env` on macOS/Linux, or `config.example.windows.ps1` to the untracked `devtools/config.windows.ps1` on Windows. Never commit credentials or local reports.

## Verification

```bash
bash -n devtools/happyctl
bash devtools/tests/ios-release-smoke.sh
bash devtools/tests/devtools-layout-smoke.sh
```

```powershell
& ([scriptblock]::Create((Get-Content .\devtools\happyctl.ps1 -Raw))) help
.\devtools\happyctl.ps1 doctor
```

Use mutating update/install/release commands only when the user explicitly requests the corresponding operation.
