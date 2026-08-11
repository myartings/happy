# Agent Workflow

## Sync To Main

When the user says `sync to main` or `synt to main`, they mean:

1. Fetch `origin/main`.
2. Rebase the current branch on `origin/main`.
3. Push the current HEAD directly to `main` with a normal push, for example:
   `git push origin HEAD:main`

Do not force push for this workflow.

## Personal Branch Model

- `upstream/main` is the official source baseline.
- `official` may differ from `upstream/main` only in `devtools/`, `.agents/skills/happy-desktop-update/`, `.agents/skills/happy-ios-release/`, `AGENTS.md`, and `.gitignore`.
- `main` is the default personal product integration, desktop build, and release branch.
- Merge official updates into `official`, validate the devtools-only delta, then merge `official` into `main`.
- Personal features branch from `main`. Upstream-bound work branches directly from `upstream/main`, never from `official`.
- Do not use `git reset`, history rewriting, or force pushes to synchronize these branches.

## Happy Devtools

Cross-platform client operations live in `devtools/`; use `devtools/happyctl` on macOS/Linux and `devtools/happyctl.ps1` on Windows. Generated reports, logs, backups, downloaded runtimes, credentials, and machine-local configuration must remain outside tracked source.
