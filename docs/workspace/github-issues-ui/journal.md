# Journal: `github-issues-ui`

## `2026-08-08`

- Started workflow.
- Created an isolated branch and worktree from synchronized `dev`.
- Audited navigation, Project Todos, GitHub OAuth/token storage, the server
  GitHub App, session metadata, and personal feature switches.
- Verified GitHub permission and deletion capabilities against official docs.
- Drafted wireframes, API/security boundaries, isolation rules, acceptance
  criteria, and complexity estimate.
- User accepted the fine-grained GitHub App architecture; recorded ADR 0005 and
  rejected classic OAuth `repo` scope expansion.
- User accepted Close/Reopen as the primary lifecycle and permanent deletion
  only for GitHub viewers with delete capability.
- User authorized the recommended top-level route with contextual shortcuts and
  implementation; Project Todos remains independently switchable.
- Implemented server-only GitHub REST/GraphQL proxying, encrypted expiring user
  tokens with single-flight refresh, installation repository discovery, and
  capability-gated deletion.
- Implemented the default-off client flag, settings switch, desktop/mobile/
  session entries, Git-origin repository resolution, and list/detail/create/
  close/reopen/delete screens.
- App/server typechecks and targeted tests pass. The full app suite passes; the
  full server suite has one unrelated attachment local-download failure that
  reproduces alone.
