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

On macOS, build and install the separately identified local baseline from
validated `main` without switching the active development worktree:

```bash
devtools/happyctl refresh-official-baseline --dry-run
devtools/happyctl refresh-official-baseline
```

This installs `/Applications/Happy (official baseline).app` with bundle ID
`com.slopus.happy.official-baseline`. It does not notarize or publish a public
artifact and does not replace `Happy (dev).app`.

## Branch model

```text
upstream/main -> personal main (devtools-only delta) -> dev (personal product features)
```

Personal `main` contains the official product tree plus allowlisted infrastructure only: `devtools/`, the Happy operation skills, `AGENTS.md`, and `.gitignore`. `happyctl` verifies that `main` contains the current `upstream/main` and has no product/build-input differences before using it for the isolated official baseline client.

`refresh-desktop` merges new official commits into personal `main`, verifies that invariant, merges `main` into `dev`, builds `dev`, then installs and verifies the personal desktop client. It stops on dirty state, divergence, conflicts, build failures, or verification failures.

## Mobile builds from worktrees

Keep the feature development loop in its worktree. A normal
`pnpm install --frozen-lockfile` creates worktree-local links while reusing
pnpm's content-addressable package store; do not symlink `node_modules` or a
pnpm virtual store between worktrees. Local `expo run:ios` / `run:android`
build caches also belong to that worktree, so switching to the primary checkout
for every local verification would discard the most useful incremental state.

Before paying for or waiting on a native build, ask the planner:

```bash
devtools/happyctl mobile-plan --platform ios
devtools/happyctl mobile-plan --platform android --profile personal-store --json
```

The default comparison base is `dev`; override it with `--base REF` when the
installed/reference binary is based elsewhere. Profiles are limited locally to
the configured personal internal/store profiles (defaults: `personal` and
`personal-store`); any other profile fails before Git or EAS access. The result
includes committed, staged, unstaged, and untracked states independently (and
hashes both the index and worktree). Unknown paths fail closed unless explicitly
classified as documentation/devtools/non-mobile; a native path that differs
between index and worktree—including staged deletion followed by an untracked
recreation—forces `native-rebuild` before fingerprint lookup.
Git-returned path separators are preserved, so a literal backslash in a POSIX
filename cannot masquerade as an allowlisted prefix.
Git rename folding is disabled for committed, staged, and unstaged collection,
so both a native source and unrelated destination remain visible to the planner.
The result is one of:

- `metro-only`: no native-sensitive input changed. Keep an existing compatible
  development build (for example, one created by `expo run:*`) installed and
  serve this worktree with
  `APP_ENV=personal EXPO_NO_METRO_WORKSPACE_ROOT=1 pnpm --filter happy-app exec expo start --dev-client --port 0`.
- `reuse-artifact`: native-sensitive paths changed, but a finished EAS build
  exactly matches the platform, profile, channel, and normalized fingerprint,
  has a build ID and HTTPS artifact URL, and is not reported expired.
  Reuse/download that reported build instead of starting another build.
- `native-rebuild`: compatibility or a matching artifact could not be proven.
  This is a recommendation, not an automatic build.

Planning and every `--dry-run` are safe in a feature worktree. Canonical
personal cloud builds/updates/submissions still require the integrated, clean
`dev` checkout; `main` is reserved for the official baseline flow. A local
simulator/device development build may remain in the feature worktree when its
purpose is feature verification rather than personal release installation.
The real-action readiness gate explicitly propagates configuration, clean-tree,
branch, and EAS-authentication failures before any build invocation.

Personal mobile commands on macOS/Linux are:

```bash
devtools/happyctl ios-doctor
devtools/happyctl ios-build-internal --dry-run
devtools/happyctl ios-build-testflight --dry-run
devtools/happyctl ios-release-status

devtools/happyctl android-doctor
devtools/happyctl android-build-internal --dry-run
devtools/happyctl android-build-store --dry-run
devtools/happyctl android-release-status
```

Real build reports record requested and returned platform/profile/channel,
commit and dirty-source digest, native fingerprint, EAS build ID/timestamps,
duration, artifact URL, original process exit/outcome, raw EAS status, and the
separate effective status. Success requires a zero command exit, `FINISHED`,
and matching returned build dimensions; partial failure JSON retains each field
that was actually returned.
Reports also retain the exact EAS response byte count and SHA-256, so malformed
JSON remains identifiable after its temporary response file is removed.
EAS does not return a binary digest, so `--hash-artifact` is explicit: it streams
the full remote IPA/APK through SHA-256 and adds that cost only when requested.
Only credential-free HTTPS URLs are accepted and redirects remain HTTPS-only.
Without the flag, the report records why the artifact hash was not computed.
Temporary EAS JSON is removed by an exit/signal trap even if hashing or report
generation fails.
Expo-configured native image paths live in
`packages/happy-app/native-assets.cjs`; both `app.config.js` and the planner read
that manifest so a newly added native icon/splash path cannot drift into the
Metro-only class.

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
bash devtools/tests/happyctl-official-baseline-smoke.sh
bash devtools/tests/mobile-plan-smoke.sh
bash devtools/tests/mobile-build-report-smoke.sh
bash devtools/tests/ios-release-smoke.sh
bash devtools/tests/android-release-smoke.sh
node --test devtools/tests/mobile-plan.test.mjs
bash devtools/tests/devtools-layout-smoke.sh
```

```powershell
& ([scriptblock]::Create((Get-Content .\devtools\happyctl.ps1 -Raw))) help
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File .\devtools\tests\happyctl-windows-smoke.ps1
# Optional additive check when PowerShell 7 is installed:
pwsh -NoLogo -NoProfile -NonInteractive -File .\devtools\tests\happyctl-windows-smoke.ps1
.\devtools\happyctl.ps1 doctor
```

Use mutating update/install/release commands only when the user explicitly requests the corresponding operation.
