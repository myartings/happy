# Validation: `github-issues-missing-config-entry`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/features/github-issues/githubIssuesButton.test.ts` before implementation | failed as expected | Two new tests proved disconnected and unavailable clients incorrectly invoked repository resolution. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/features/github-issues/githubIssuesButton.test.ts` | passed | 8/8 Session entry tests passed. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/features/github-issues/githubIssuesButton.test.ts` before reauthorization handling | failed as expected | The new repository-discovery reauthorization case still opened no recovery route. |
| `2026-08-11` | `pnpm --filter happy-app exec vitest run sources/features/github-issues` | passed | 12 files and 70 GitHub Issues tests passed. |
| `2026-08-11` | `pnpm --filter happy-app typecheck` | passed | Happy app TypeScript compiled without errors. |
| `2026-08-11` | `git diff --check` | passed | Happy feature worktree has no whitespace errors. |
| `2026-08-11` | `python3 scripts/workflow-audit.py --strict --require-active` | passed with expected future gates | Workflow structure is valid during implementation. |
| `2026-08-11` | `bash -n bin/happy-manager` | passed | macOS/Linux Manager script syntax is valid. |
| `2026-08-11` | `tests/ios-release-smoke.sh` | passed | Existing Manager iOS dry-run behavior remains intact. |
| `2026-08-11` | missing-variable `bin/happy-manager build-desktop` guard probe | passed | Build failed before dependency installation with the required public GitHub App variable message. |
| `2026-08-11` | Manager `git diff --check` | passed | Manager changes have no whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Connected Session opens Issues | verified | Existing resolved/local-cache tests remain green. |
| Disconnected Session avoids picker | verified | New disconnected entry test. |
| Unavailable or reauthorization-required client avoids picker | verified | New unavailable and repository-discovery reauthorization tests plus installed-app UI reproduction. |
| Genuine repository failures retain picker | verified | Existing ambiguous and lookup-failed tests remain green. |
| Personal Desktop build fails closed | verified | Manager missing-variable guard probe. |
| No auth/permission behavior changes | verified | Whole diff is limited to connection-state routing, tests, build preflight, and docs. |

## Remaining gaps

- The local macOS client was not rebuilt or installed because the user did not
  authorize app replacement.
- The untracked macOS `config.env` still needs the public App client ID and slug
  before the guarded build can succeed.
