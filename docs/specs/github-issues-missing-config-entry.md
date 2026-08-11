# Session GitHub Issues unavailable-entry fix

## Problem

When the personal GitHub Issues feature is enabled but the device build is
unconfigured, disconnected, or requires reauthorization, the Session header
button currently catches the client error as a repository lookup failure and
opens an empty `Select repository` picker. This misstates the blocking state and
offers no useful recovery path.

The macOS/Linux Manager build path also permits a personal Desktop build without
the public GitHub Issues App client ID and app slug, unlike the Windows path.

## Acceptance criteria

1. A connected client continues to resolve the Session repository and opens the
   Session Issues quick popover.
2. A disconnected client opens the existing GitHub Issues connection screen and
   does not invoke repository resolution or show the repository picker.
3. An unavailable or reauthorization-required client opens the same existing
   connection-management route, where the precise error is rendered.
4. Genuine repository lookup ambiguity/failure still opens the repository picker.
5. Personal macOS/Linux Desktop builds fail before bundling when either public
   GitHub Issues App build variable is missing.
6. No credentials, tokens, repository permissions, server routes, or official
   GitHub profile behavior change.

## Scope

- `packages/happy-app/sources/components/GithubIssuesButton.tsx`
- focused Session Issues entry tests
- Happy Manager personal Desktop build validation

## Non-goals

- Creating or changing the GitHub App
- Changing installation repository access
- Installing a rebuilt client
- Redesigning the connection screen or repository picker
