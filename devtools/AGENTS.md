# Happy devtools Agent Instructions

## Scope

This directory owns personal Happy operations: update, build, install, backup, rollback, official-baseline comparison, scheduled refresh, and iOS/Android release orchestration. Product business code belongs under `packages/`, not here.

## Branch invariants

- `upstream` is fetch-only; its push URL must remain disabled.
- Personal `main` contains `upstream/main` plus devtools infrastructure only.
- `dev` contains personal product features and is the desktop build/release branch.
- `happyctl` must reject an official-baseline build when personal `main` differs from `upstream/main` outside the explicit devtools allowlist.
- New official commits are merged into personal `main`; `main` is then merged into `dev`. Do not reset or rewrite either branch.
- Updates to `origin/main` must pass the clone-local guard installed by `happyctl`; use `happyctl sync-dev` for the authorized synchronization path.

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
devtools/happyctl install-git-guards
devtools/happyctl sync-dev --dry-run
devtools/happyctl refresh-desktop --dry-run
devtools/happyctl refresh-official-baseline --dry-run
devtools/happyctl mobile-plan --platform ios
devtools/happyctl android-build-internal --dry-run
```

```powershell
.\devtools\happyctl.ps1 status
.\devtools\happyctl.ps1 doctor
.\devtools\happyctl.ps1 install-git-guards
.\devtools\happyctl.ps1 artifacts
.\devtools\happyctl.ps1 refresh-desktop -DryRun
.\devtools\happyctl.ps1 refresh-official-baseline -DryRun
```

Commands that install, replace, roll back, publish, submit, or register scheduled tasks require explicit user authorization. A general request to update Happy Desktop authorizes the complete `refresh-desktop` workflow described by the `happy-desktop-update` skill. A request to release the local official macOS client from `main` authorizes `refresh-official-baseline` as described by the `happy-desktop-official-release` skill; it does not authorize public distribution.

The mobile planner may report `reuse-artifact` only for a matching finished EAS
build with an ID, an HTTPS artifact URL, and no elapsed reported expiry. Keep
Expo native image references in `packages/happy-app/native-assets.cjs`; the app
config and planner must consume the same manifest.
Unknown build paths fail closed, and native index/worktree divergence must not
reach fingerprint lookup, including staged deletion followed by an untracked
recreation at the same path. Preserve Git-returned path separators: a literal
backslash in a POSIX filename must remain an unknown, native-sensitive path.
Disable Git rename folding when collecting planner paths so both native sources
and unrelated destinations remain classifiable in every Git state.
Artifact hashing accepts only credential-free HTTPS
and must restrict redirects to HTTPS; temporary EAS responses require guaranteed
exit/signal cleanup.
Real mobile readiness functions must explicitly propagate each failed
configuration, clean-tree, branch, and authentication check; do not rely on
`set -e` inside a function called from a conditional or OR-list.

Before committing changes, run syntax checks, the devtools smoke tests, relevant dry-runs, and inspect `git diff --check` plus the complete diff.
