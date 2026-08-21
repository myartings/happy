# Local Main Push Guard

## Goal

Prevent accidental direct updates of `origin/main` from `dev`, feature branches,
detached commits, or other arbitrary refs while preserving the supported
`upstream/main -> main -> dev` synchronization performed by `devtools/happyctl`.

## Scope

- Replace the conflicting root instruction that maps `sync to main` to
  `git push origin HEAD:main` with the personal branch contract.
- Add a tracked Git `pre-push` guard and an explicit command that installs a
  stable copy in the clone's Git common directory.
- Route the authorized `happyctl` main push through the guard.
- Report missing or incorrect guard configuration through `happyctl doctor`.
- Cover allowed and rejected pushes with deterministic shell smoke tests.

## Non-goals

- GitHub rulesets, branch protection, pull-request automation, or credentials.
- Preventing a deliberate bypass with `git push --no-verify` or manual hook
  removal; this guard prevents accidents rather than hostile local actions.
- Changing the allowed personal-main paths or product integration model.
- Committing, pushing, merging, or releasing this implementation.

## Observable behavior

1. A push targeting a remote `main` ref is rejected unless its source ref is
   the local `main` branch, including pushes that name the remote by URL.
2. An eligible `main` push is rejected unless it is initiated through the
   authorized `happyctl` synchronization path.
3. The candidate `main` must contain the configured official upstream commit
   and may differ from it only in the existing devtools allowlist.
4. Pushes not targeting `origin/main` are unaffected.
5. `happyctl` provides an idempotent command that installs the tracked hook in
   a stable Git-common-dir path for the current clone.
6. `happyctl doctor` reports an incorrectly configured hook as a failed
   prerequisite with a repair command.
7. macOS/Linux and Windows synchronization paths set the same narrow
   authorization marker only for the `main` push.

## Operational constraints

- Validation fails closed when required refs or candidate commits are missing.
- The authorization marker is scoped to a single child `git push` invocation.
- Guard failure must not mutate branches or remotes.
- Hook installation copies the tracked source into the clone's Git common
  directory and modifies only the clone-local `core.hooksPath` setting.

## Acceptance criteria

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | `HEAD:main` from a feature branch is rejected. | Real push to a temporary bare remote. |
| AC2 | Direct `main:main` without the `happyctl` marker is rejected. | Real push to a temporary bare remote. |
| AC3 | Authorized allowlisted `main` is accepted. | Real push to a temporary bare remote. |
| AC4 | Authorized `main` with a product delta is rejected. | Real push to a temporary bare remote. |
| AC5 | Pushes to non-main branches remain allowed. | Real push to a temporary bare remote. |
| AC6 | Guard installation is idempotent and doctor detects drift. | Focused happyctl smoke coverage. |
| AC7 | Root instructions and both platform sync implementations use the guarded workflow. | Whole-diff inspection and shell/PowerShell syntax checks. |
