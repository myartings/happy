---
name: happy-desktop-official-release
description: Safely build, sign, install, verify, and launch the local macOS Happy official-baseline desktop client from validated main in an isolated worktree. Use when the user asks to release, publish, rebuild, install, or refresh the official macOS desktop client from main, and they mean a local source-built client rather than public distribution.
---

# Happy Desktop Official Release

Use `devtools/happyctl` as the source of truth. Do not reproduce its Git,
signing, backup, or installation operations manually.

## Clarify only when needed

If “official release” could mean public distribution, ask whether the user wants:

- the local official-baseline app built from `main`; or
- a notarized/public DMG, App Store submission, or GitHub Release.

This Skill covers only the first meaning.

## Procedure

1. Run `git status --short --branch` and
   `devtools/happyctl refresh-official-baseline --dry-run`.
2. Report the source ref, isolated worktree, app name, bundle identifier, install
   target, and any failing guard.
3. If the dry run passes and the user requested execution, run:

   ```bash
   devtools/happyctl refresh-official-baseline
   ```

4. Report the validated `main` commit, build/install/verification outcome, app
   path, and generated report path.

For diagnosis, use the bounded stages:

```bash
devtools/happyctl build-official-baseline
devtools/happyctl update-official-baseline
devtools/happyctl verify-official-baseline
devtools/happyctl rollback-official-baseline
```

## Invariants

- Build only from validated `main`, product-equivalent to `upstream/main`.
- Use `.baseline/worktree/official-main`; do not switch the user's active
  worktree or build from `dev`.
- Preserve `Happy (dev).app`; the official baseline installs separately as
  `Happy (official baseline).app`.
- Require a stable Apple signing identity. Never fall back to ad-hoc signing.
- Do not push branches, notarize, publish packages, or create GitHub Releases.
- On failure, stop and report the failed guard. Do not bypass it with manual Git
  or filesystem operations.
