# Happy devtools Agent Instructions

## Scope

This directory owns personal Happy operations: update, build, install, backup, rollback, official-baseline comparison, scheduled refresh, and iOS release orchestration. Product business code belongs under `packages/`, not here.

## Branch invariants

- `upstream` is fetch-only; its push URL must remain disabled.
- `official` contains `upstream/main` plus devtools infrastructure only.
- `main` contains personal product features and is the default desktop build/release branch.
- `happyctl` must reject an official-baseline build when `official` differs from `upstream/main` outside the explicit devtools allowlist.
- New official commits are merged into `official`; `official` is then merged into `main`. Do not reset or rewrite either branch.

## State and secrets

- Keep logs, reports, backups, downloaded runtimes, credentials, and machine config outside tracked files.
- `devtools/config.env` and `devtools/config.windows.ps1` are local-only.
- Preserve discovery of the legacy Windows isolated Node directory until users have naturally migrated.
- Never commit installers, `.app` bundles, reports, backups, or tokens.

## Safe commands

```bash
devtools/happyctl status
devtools/happyctl doctor
devtools/happyctl check-upstream
devtools/happyctl sync-main --dry-run
devtools/happyctl refresh-desktop --dry-run
```

```powershell
.\devtools\happyctl.ps1 status
.\devtools\happyctl.ps1 doctor
.\devtools\happyctl.ps1 artifacts
.\devtools\happyctl.ps1 refresh-desktop -DryRun
.\devtools\happyctl.ps1 refresh-official-baseline -DryRun
```

Commands that install, replace, roll back, publish, submit, or register scheduled tasks require explicit user authorization. A general request to update Happy Desktop authorizes the complete `refresh-desktop` workflow described by the `happy-desktop-update` skill.

Before committing changes, run syntax checks, the devtools smoke tests, relevant dry-runs, and inspect `git diff --check` plus the complete diff.
