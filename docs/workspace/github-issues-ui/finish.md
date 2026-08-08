# Finish Review: `github-issues-ui`

## Summary

- Added an isolated, default-off GitHub Issues MVP for desktop and mobile.
- Added GitHub App selected-repository authorization, encrypted expiring user
  credentials, server-only refresh, and Happy-owned Issue DTOs.
- Added repository/list/detail/create/close/reopen/delete UI with desktop,
  mobile-home, and session-context entries while leaving Project Todos intact.

## Verification

- `pnpm --filter happy-app typecheck`: passed.
- `pnpm --filter happy-server typecheck`: passed.
- Targeted app/server tests: 20 passed.
- Full happy-app Vitest suite: passed.
- Full happy-server Vitest suite: 102/103; the unrelated attachment local GET
  test fails with 404 and reproduces when run alone.
- `git diff --check`: passed.

## Whole-diff review

- No blocking correctness, security, privacy, data-integrity, or isolation
  finding remains.
- GitHub tokens stay encrypted and server-only; legacy OAuth credentials cannot
  be silently reused as GitHub App credentials.
- Permanent delete is capability-gated and has a destructive confirmation.
- Remaining uncertainty is limited to configured live GitHub App OAuth,
  migration deployment, and device rendering.

## Rollback or mitigation

- Keep `devGithubIssuesEnabled` false on clients and
  `HAPPY_GITHUB_ISSUES_ENABLED` unset/false on servers.
- The migration is additive. Disabling the feature restores prior navigation
  and GitHub profile behavior without touching sessions or Project Todos.

## Lessons promoted

- `CONTEXT.md`: no change needed; existing feature isolation rules were sufficient.
- `docs/ARCHITECTURE.md` or ADR: ADR 0005 records the GitHub App permission boundary.
- Skill/workflow rule: no new general rule needed.

## Follow-up

- Apply the Prisma migration and configure a real GitHub App with Metadata read,
  Issues read/write, `GITHUB_APP_SLUG`, and both feature flags in a test deployment.
- Run phone/tablet/desktop smoke checks before enabling by default.
- Optional later work: translations, comments, richer caching/pull-to-refresh,
  and a project-row repository mapping editor.
