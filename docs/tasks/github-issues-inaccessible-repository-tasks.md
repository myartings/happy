# GitHub Issues Inaccessible Repository Tasks

## Contract

When a Session GitHub Issues entry detects the current GitHub repository but
that repository is not available to the installed GitHub App, Happy must keep
the Session bound to that detected repository. It must not offer unrelated
repositories as substitutes. Instead it must open connection management with a
clear repository-specific access message and an explicit user-controlled link
to manage GitHub App repository access.

## Acceptance criteria

- [x] Repository resolution preserves the detected `owner/repo` when the
  result is `inaccessible`.
- [x] The Session entry routes an inaccessible result to connection management
  and never opens the repository picker.
- [x] Connection management names the detected repository and explains that it
  is not available to the GitHub App.
- [x] The user must explicitly activate “Manage repository access” before any
  external navigation; Happy never grants or expands access automatically.
- [x] Ambiguous, no-remote, and lookup-failed results retain their existing
  repository-picker behavior.
- [x] Focused and full app tests, app typecheck, workflow checks, and whole-diff
  review pass. Staged CI runs after archival immediately before commit.

## Delivery boundary

This workflow owns the local product behavior, tests, translations, and
workflow evidence. After archival and integration, the authorized operational
follow-up rebuilds the personal macOS client and verifies the reported flow. It
does not change the GitHub App installation or any repository permission.
