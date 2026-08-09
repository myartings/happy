# Validation: `personal-ota-actions-fix`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-10` | `pnpm install --frozen-lockfile` | unavailable | Dependency linking completed far enough for all builds/checks, but two attempts exceeded local 60s/180s command limits during postinstall. |
| `2026-08-10` | `pnpm --filter @slopus/happy-wire --fail-if-no-match build` | passed | Workspace dependency built successfully. |
| `2026-08-10` | YAML BaseLoader structural assertions for `.github/workflows/personal-ota.yml` | passed | Both triggers, tag pattern, and tag guard step are present. |
| `2026-08-10` | tag ancestry positive and synthetic negative checks | passed | A `dev` commit was accepted and an unrelated commit object was rejected. |
| `2026-08-10` | `pnpm --filter happy-app typecheck` | passed | No TypeScript errors. |
| `2026-08-10` | `pnpm --filter happy-server generate && pnpm --filter happy-server typecheck` | passed | Prisma generation restored the expected local generated client; no TypeScript errors. |
| `2026-08-10` | `pnpm dlx eas-cli@21.7.0 fingerprint:generate --platform android --json --non-interactive` | passed | Completed in 40.5s through the machine's explicit local proxy; no iOS missing-file error. |
| `2026-08-10` | personal `expo config` assertions | passed | Owner, project ID, package IDs, update URL/channel, and runtime policy match production configuration. |
| `2026-08-10` | `python scripts/validate-happy-workflow.py` plus workflow core/CI tests and strict audit | passed | Validator passed; both Python suites passed 14/14. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run` | accepted gap | 1012/1013 passed; the 1MB blob test exceeded its 5s timeout only in the full concurrent suite, then passed 9/9 in isolation in 2.24s. |
| `2026-08-10` | `pnpm --filter happy-server test` | accepted gap | 94/95 passed; the local attachment GET test returned 404 and the identical test also fails on unchanged `dev`. |
| `2026-08-10` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Tag push can select this workflow without changing `main` | verified | YAML trigger assertion and GitHub Actions push-event documentation. |
| Only commits contained in `origin/dev` can publish | verified | Positive and synthetic negative ancestry checks. |
| Tag runs derive Android platform and useful message | verified | YAML expression inspection and structural assertions. |
| Android fingerprint is validated without redundant publish scan | verified | Real Android fingerprint generation plus publish shell inspection. |
| Manual dispatch retains all three platforms | verified | YAML structural assertion and diff review. |
| Existing release protections remain | verified | Credentials, Expo config, typecheck, concurrency, and repository guard remain in the workflow. |

## Remaining gaps

- Full `pnpm install` did not return before local command limits, although its
  generated/link state was sufficient for the configured builds and checks.
- The full App suite has a pre-existing performance-sensitive timeout; its only
  failing test passes in isolation.
- The server attachment GET test is a pre-existing Windows baseline failure,
  reproduced from unchanged `dev`.
- A real GitHub-hosted tag-triggered publish can only be exercised after this
  branch is merged into `dev`; pushing the release tag before review would deploy.
