# ADR 0005: Use a fine-grained GitHub App for Issues

## Status

Superseded on 2026-08-09 by ADR 0006. The minimum GitHub App permissions and
selected-repository installation model remain valid; the server-held token and
server-proxy decisions do not.

## Context

Happy currently connects GitHub through a browser authorization flow, stores an
encrypted access token, and uses the returned profile for identity, avatar, and
social features. The requested scopes are
`read:user,user:email,read:org,codespace`; no current server or client code uses
that token to manage repository Issues.

Adding private-repository Issue access to a classic OAuth App would require the
broad `repo` scope. That scope covers substantially more repository data and
operations than this feature needs. It also does not let the user restrict Happy
to a selected repository set.

Happy already initializes a GitHub App on the server, so the feature can extend
that integration instead of introducing another credential system.

## Decision

GitHub Issues uses the existing GitHub App model with only these repository
permissions:

- Metadata: read.
- Issues: read and write.

The user installs the app on explicitly selected repositories and authorizes it
to act on their behalf. Happy uses a GitHub App user access token so API actions
remain bounded by both the app permissions and the user's own repository role.
This also supplies the viewer capability required to decide whether permanent
Issue deletion is available.

GitHub credentials remain server-only. Persist access and refresh tokens
encrypted together with access/refresh expiry and granted-permission metadata.
Refresh happens on the server with single-flight behavior; authentication
failures fail closed and ask the user to reconnect.

Existing profile-only connections are not silently upgraded. When the Issues
feature is first opened, Happy asks the user to install/authorize the GitHub App
for selected repositories. The new flow does not request classic OAuth `repo`,
`public_repo`, or `codespace` scopes.

Every Issue endpoint additionally requires the server feature switch
`HAPPY_GITHUB_ISSUES_ENABLED`. Tokens and raw Octokit responses are never
returned to a Happy client.

## Consequences

- Private repository Issues can be managed without repository Contents access.
- Users and organizations can restrict Happy to selected repositories.
- Organization installation approval may be required before Issues are usable.
- Token refresh, installation discovery, and reconnect states add server and UI
  work compared with expanding the current OAuth scope.
- Existing GitHub profile connections continue to work when the feature is off.
- Permission changes to the GitHub App may require installation owners to
  approve updated permissions.

## Rejected alternatives

### Classic OAuth `repo` scope

Rejected because it grants broad private-repository access beyond Issue
management and cannot be constrained to selected repositories.

### Public-only `public_repo` scope

Rejected as the primary design because Happy projects may be private and the
resulting behavior would be inconsistent across repositories.

### Client-held personal access token

Rejected because it duplicates authentication UI, moves credentials onto every
client, complicates revocation/rotation, and bypasses the existing encrypted
server boundary.

## Rollback

Disable both feature switches. Existing profile-only GitHub behavior remains
available. Remove the Issue routes and App installation/token-refresh records
without altering Happy sessions or Project Todos.

## References

- https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app
- https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
