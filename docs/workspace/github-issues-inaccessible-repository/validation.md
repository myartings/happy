# Validation: `github-issues-inaccessible-repository`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-12` | signed-client UI reproduction and accessibility inspection | failed acceptance | Detected `iOSTemplate`, then displayed a generic picker with `reason: inaccessible` and unrelated repositories. |
| `2026-08-12` | focused 3-file Vitest command before implementation | failed as expected | RED: resolver discarded detected identity, Session button did not navigate, and management rendered generic connected state; 25 neighboring assertions passed. |
| `2026-08-12` | `pnpm --filter happy-app exec vitest run sources/features/github-issues/githubRepositoryResolution.test.ts sources/features/github-issues/githubIssuesButton.test.ts sources/features/github-issues/githubIssuesScreen.test.ts` | passed | GREEN: 3 files, 28 tests. |
| `2026-08-12` | `pnpm --filter happy-app exec vitest run sources/features/github-issues` | passed | Complete GitHub Issues family: 12 files, 73 tests. |
| `2026-08-12` | `pnpm --filter happy-app typecheck` | passed | TypeScript and translation contract compile. |
| `2026-08-12` | `git diff --check` | passed | No whitespace errors. |
| `2026-08-12` | `pnpm --filter happy-app exec vitest run` | passed | Full Happy App suite: 111 files, 1099 tests. Existing expected malformed-protocol stderr remained non-failing. |
| `2026-08-12` | `python3 scripts/workflow-check.py --only check --record github-issues-inaccessible-repository` | passed | Four configured repository workflow commands passed; both workflow suites ran 14 tests. |
| 2026-08-12 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-12 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-12 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-12 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Preserve detected inaccessible repository identity | verified | Resolver test retains `private/widget`. |
| Route inaccessible Session entry to repository-specific access management | verified | Button test asserts exact route params and hidden picker. |
| Render explicit repository access message without automatic navigation | verified | Screen test asserts repository copy, manage link, no disconnect action, and zero external adapter calls during render. |
| Preserve other picker reasons | verified | Complete 73-test GitHub Issues family remains green. |

## Remaining gaps

- Rebuilt-client runtime verification is the authorized operational follow-up
  after archival and code integration.
