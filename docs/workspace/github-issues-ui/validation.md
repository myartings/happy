# Validation: `github-issues-ui`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| 2026-08-08 | `python scripts/workflow-audit.py github-issues-ui --strict --require-active` | passed with gaps | Structure is valid; product, decision, risk, and implementation gates intentionally remain pending. |
| 2026-08-08 | `git diff --check` | passed | Initial specification files have no whitespace errors. |
| 2026-08-08 | targeted `rg` inspection of Happy GitHub, navigation, session, settings, and Project Todo seams | passed | Findings recorded in `research/current-system.md`. |
| 2026-08-08 | official GitHub permission and Issue deletion documentation review | passed | Links and conclusions recorded in the feature spec. |
| 2026-08-08 | destructive-action product decision | passed | D2 accepted: Close/Reopen normally; permanent delete only when `viewerCanDelete`. |
| 2026-08-08 | `pnpm --filter happy-app typecheck` | passed | No TypeScript errors. |
| 2026-08-08 | `pnpm --filter happy-server typecheck` | passed | Prisma client generated first; no TypeScript errors. |
| 2026-08-08 | targeted app Vitest | passed | 11 tests: local default-off flag and GitHub remote parsing. |
| 2026-08-08 | targeted server Vitest | passed | 9 tests: server flag, DTO normalization, repository discovery, lifecycle, deletion, and traversal rejection. |
| 2026-08-08 | full happy-app Vitest suite | passed | All app test files passed. |
| 2026-08-08 | full happy-server Vitest suite | accepted gap | 102/103 tests passed; unrelated `attachmentRoutes` local GET expected 200 but received 404, and failure reproduces alone. |
| 2026-08-08 | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Local and server flags default/fail closed; host entries return null. |
| AC2 | accepted gap | Repository picker and open/closed lists exist; live device/App check remains. |
| AC3 | verified | Service test excludes REST items containing `pull_request`. |
| AC4 | verified | Happy-owned DTO and Markdown detail render; token remains server-only. |
| AC5 | verified | Service tests cover create and both state transitions. |
| AC6 | verified | Capability test, conditional UI, confirmation, and mutation test. |
| AC7 | accepted gap | Session resolves GitHub origin and passes owner/repo; live Back behavior remains. |
| AC8 | accepted gap | Typed auth/permission/rate/not-found errors and retry/empty states exist; offline/UI tests remain. |
| AC9 | verified | Feature-local modules plus small guarded host seams; whole diff reviewed. |
| AC10 | verified | Independent setting keys; existing Project Todo tests pass in full app suite. |

## Remaining gaps

- Live GitHub App credentials, migration application, OAuth callback, and real
  phone/tablet/desktop rendering were not available for end-to-end verification.
- The simple MVP intentionally omits comments, rich cache/pull-to-refresh,
  translations, and an explicit project-row mapping editor.
- Full server suite remains red only on the unrelated attachment local-download test.
