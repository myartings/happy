# Happy Desktop Official Baseline Release Specification

## Contract

`devtools/happyctl refresh-official-baseline` owns the local macOS official
baseline lifecycle. The project-local Skill routes matching user requests to
that command; it does not duplicate build or install logic.

## Acceptance criteria

1. The command fails closed unless run on macOS with a clean repository, a
   resolvable `upstream/main`, and a `main` whose product/build inputs differ
   from `upstream/main` only in the documented allowlist.
   A local `main` that only leads `origin/main` is valid; a `main` behind or
   diverged from `origin/main` is rejected. The release command never pushes.
2. Source preparation uses the isolated
   `.baseline/worktree/official-main` worktree at the validated `main` commit;
   it does not switch or modify the caller's current branch/worktree.
3. A dirty baseline worktree is rejected. A missing baseline worktree is
   created as a detached worktree. An existing clean one is detached at the
   validated `main` commit.
4. The build uses `devtools/config/tauri.official-baseline.conf.json` and yields
   `Happy (official baseline).app` with bundle identifier
   `com.slopus.happy.official-baseline`.
5. Installation uses a stable Apple signing identity, verifies the signature,
   backs up any prior official-baseline app, installs to `/Applications`,
   verifies identity, and launches it. The development app remains separate.
6. `--dry-run` performs no fetch, checkout, build, signing, install, backup,
   pruning, launch, or report write and prints the intended source/worktree,
   identity, and install target.
7. `build-official-baseline`, `update-official-baseline`, and
   `verify-official-baseline` expose bounded stages for diagnosis and reuse;
   `rollback-official-baseline` restores the latest profile-specific backup.
8. Reports identify the validated `main` commit, baseline worktree, build,
   install, verification, and failure status.
9. The command never pushes branches and performs no public distribution,
   notarization, DMG creation, or GitHub Release mutation.

## Verification

- Shell smoke tests cover routing, profiles, dry-run non-mutation, allowlisting,
  detached worktree preparation, and failure on dirty/divergent sources.
- `bash -n`, ShellCheck when available, skill validation, workflow CI, and a
  real `--dry-run` pass before finish.
