# GitHub Issues Device Flow Migration

Status: Ready for implementation review
Owner: personal Happy `dev` branch
Platforms: iOS, Android, Tauri desktop
Feature flag: `devGithubIssuesEnabled`, default off

## Goal

Make the existing small GitHub Issues UI work with the official Happy service by
moving Issue authentication and GitHub API traffic entirely into installed
clients. The migration must preserve least privilege, avoid plaintext token
storage, and keep personal changes shallow at upstream Happy integration points.

This specification changes the Issue feature's infrastructure, not its product
scope. List, detail, create, close/reopen, and capability-gated permanent delete
remain the minimum useful release described in `github-issues-ui.md`.

## Non-goals

- Browser support.
- Replacing Happy's official GitHub profile connection.
- Syncing a GitHub Issue credential between devices.
- A personal Issue backend, webhook mirror, or Issue database.
- Installation access tokens, app private keys, client secrets, PATs, or classic
  OAuth `repo` scopes.
- Comments, editing, labels, assignments, notifications, or realtime refresh.
- GitHub Enterprise Server in v1.

## User experience

### First open on a supported device

1. The Issues route asks the Module for connection state.
2. If not connected, show why repository Metadata and Issues read/write access
   is required and that authorization applies only to repositories selected on
   GitHub.
3. After Connect, request a Device Flow code and show:
   - the expected GitHub App name;
   - the verification URI;
   - the large, selectable user code;
   - Copy code, Open GitHub, and Cancel actions;
   - an unobtrusive waiting state and expiry time.
4. Open GitHub in the system browser. Happy never asks for a GitHub password,
   personal access token, or pasted access token.
5. Poll until authorized, denied, cancelled, or expired. Polling stops when the
   screen unmounts or the user cancels.
6. Persist the completed token bundle, identify the viewer, and discover the
   GitHub App installations and repositories visible to that user token.
7. If no repositories are available, show Install/select repositories on GitHub.
   Refresh discovery when the app returns to the foreground.
8. Select the last or context-mapped repository and open the existing Issue list.

### Returning use

Load the token bundle from secure storage. If the access token expires within
five minutes, refresh before issuing GitHub API requests. Multiple screens share
one refresh promise. On success, atomically store the rotated pair before normal
requests continue.

### Disconnect and revoke

Settings contains a GitHub Issues connection card separate from the official
GitHub profile card.

- `Remove from this device` deletes the local token bundle and Issue cache.
- `Manage access on GitHub` opens the GitHub Applications/installation settings
  needed for authorization revocation or repository selection.
- Removing the local credential must not disconnect the Happy profile identity.

### Unsupported browser

When `Platform.OS === 'web'` and the runtime is not Tauri:

- hide the standard navigation entry even if stale local settings enabled it;
- direct navigation renders a concise unsupported-platform explanation with an
  action to use Happy desktop/mobile;
- never start Device Flow and never create a browser-storage credential.

## Architecture

### Deep Module boundary

All Issue-specific authentication and GitHub integration live below
`sources/features/github-issues/`. The Module presents this conceptual Interface
to screens:

```ts
type GithubIssuesClient = {
    getConnectionState(): Promise<GithubConnectionState>;
    connect(options: {
        signal?: AbortSignal;
        onVerification: (prompt: DeviceVerificationPrompt) => void;
    }): Promise<GithubConnectedAccount>;
    disconnect(): Promise<void>;
    listRepositories(): Promise<GithubRepository[]>;
    listIssues(input: ListIssuesInput): Promise<GithubIssuePage>;
    getIssue(input: IssueIdentity): Promise<GithubIssue>;
    createIssue(input: CreateIssueInput): Promise<GithubIssue>;
    setIssueState(input: SetIssueStateInput): Promise<GithubIssue>;
    deleteIssue(input: IssueIdentity): Promise<void>;
};
```

Screens do not receive Happy `AuthCredentials`, GitHub tokens, raw response
objects, installation IDs, polling intervals, or platform transports. This
Interface provides Leverage: all existing Issue screens use one entry point,
while the complicated Implementation remains local to the feature.

Suggested internal layout:

```text
sources/features/github-issues/
  client/          public facade, session, refresh coordinator, error model
  auth/            Device Flow state machine and token bundle codec
  api/             GitHub endpoint calls and response normalization
  storage/         credential-store Interface and platform selection
  transport/       HTTP Interface and platform selection
  model/           existing DTOs, filters, repository mapping/parser
  components/      connection/install/error states and Issue components
```

Exact folders may follow existing repository conventions, but the dependency
direction is fixed: screens depend on the facade; the facade depends on internal
Interfaces; platform Adapters depend on their platform SDKs. UI must not import
an Adapter directly.

### Credential store Interface

```ts
type GithubCredentialStore = {
    load(): Promise<GithubTokenBundle | null>;
    save(bundle: GithubTokenBundle): Promise<void>;
    remove(): Promise<void>;
};
```

Production Adapters:

| Runtime | Adapter | Required behavior |
| --- | --- | --- |
| iOS/Android | Expo SecureStore | Platform-protected value, app-only accessibility |
| Tauri macOS | Rust `keyring` command | macOS Keychain |
| Tauri Windows | Rust `keyring` command | Windows Credential Manager |
| Tauri Linux | Rust `keyring` command | Secret Service; fail closed if unavailable |
| Browser | none | `unsupported_platform`; no fallback |

The Tauri commands expose only get/set/delete for one namespaced credential.
Validate payload size and token-bundle schema on both sides. Restrict command
capabilities to the Happy window. Do not expose a general-purpose credential
store command.

Token bundle v1:

```ts
type GithubTokenBundleV1 = {
    schemaVersion: 1;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    refreshTokenExpiresAt?: number;
    tokenType: 'bearer';
    account: { id: number; login: string; avatarUrl?: string };
};
```

Use a service identifier containing the Tauri/app bundle identity so official,
dev, and test builds cannot silently share tokens. Saving a refreshed bundle is
the commit point; never write only one member of a rotated pair.

### Transport Interface

The transport accepts method, trusted absolute GitHub URL, headers, body, and
abort signal, then returns status, selected headers, and parsed JSON/text. Its
Implementation must reject hosts outside `github.com` and `api.github.com` so a
malformed upstream response cannot turn a bearer token into an arbitrary-host
request.

- React Native uses the existing native fetch stack.
- Tauri uses `@tauri-apps/plugin-http`, already registered in the desktop app.
- Tests use scripted responses and a fake clock/sleeper.

Authorization requests use `Accept: application/json`. REST requests use the
recommended GitHub media type and a pinned API version. GraphQL requests use
`https://api.github.com/graphql`.

### Device Flow state machine

States are explicit and testable:

```text
idle -> requesting_code -> awaiting_user -> exchanging -> connected
                       \-> denied | expired | cancelled | configuration_error
```

1. `POST https://github.com/login/device/code` with the public `client_id`.
2. Emit the returned `user_code`, `verification_uri`, `expires_in`, and
   `interval` to the UI without persisting them.
3. Poll `POST https://github.com/login/oauth/access_token` with:
   `client_id`, `device_code`, and
   `grant_type=urn:ietf:params:oauth:grant-type:device_code`.
4. Treat `authorization_pending` as internal waiting.
5. On `slow_down`, use GitHub's returned interval or increase the current delay
   as directed before the next request.
6. Stop at the local expiry deadline even if network attempts continue failing.
7. On success, calculate expiries from monotonic receipt time, fetch `/user`, and
   save the complete token bundle.

Only one connect attempt may run per process. A new attempt cancels or joins the
existing attempt instead of starting another polling loop.

### Refresh coordinator

- Refresh at `expiresAt - 5 minutes`, or immediately after an authenticated `401`
  if the bundle has not already been refreshed by another request.
- `POST https://github.com/login/oauth/access_token` with `client_id`,
  `grant_type=refresh_token`, and `refresh_token`; omit client secret.
- Use a single-flight promise shared by all requests.
- Save the newly returned access and refresh tokens atomically.
- Retry the original API request at most once after refresh.
- `bad_refresh_token` or expired refresh credentials become
  `reauthorization_required`.
- Offline/timeouts do not erase a possibly valid refresh token.

### Repository discovery

Use the GitHub App user access token to:

1. list installations accessible to the user token;
2. list repositories accessible through each returned installation;
3. normalize and de-duplicate by repository ID;
4. retain only repositories with Issues enabled and sufficient installation
   permissions;
5. paginate until completion or a defined safety limit, reporting partial data
   only if the UI can clearly label it.

The repository DTO must not expose installation access-token URLs or unrelated
repository fields. Existing project-to-`owner/repo` mappings remain valid but
must be verified against every fresh repository list.

### Issue operations

Preserve the existing Happy-owned DTOs and behavior:

- Exclude pull requests returned by REST Issue lists.
- Paginate list results and normalize rate-limit headers.
- Preserve drafts on create failure.
- Close/reopen through REST and wait for the response before durable UI changes.
- For permanent deletion, query GraphQL `viewerCanDelete`/node identity and show
  the action only when allowed; execute `deleteIssue` after confirmation.
- Never report a failed permanent delete as a successful close.

### Error model

The facade returns typed errors only:

| Code | UI action |
| --- | --- |
| `unsupported_platform` | Explain desktop/mobile requirement |
| `not_configured` | Explain missing dev build configuration |
| `secure_storage_unavailable` | Explain platform credential-store requirement |
| `authorization_denied` | Return to Connect |
| `authorization_expired` | Request a new code |
| `reauthorization_required` | Remove invalid local credential and reconnect |
| `installation_required` | Open GitHub App installation page |
| `permission_denied` | Explain repository/organization access |
| `not_found` | Remove stale mapping when repository identity is stale |
| `rate_limited` | Preserve data/draft and show retry time |
| `offline` | Preserve data/draft and allow retry |
| `github_error` | Generic retry with a non-secret diagnostic ID |

`authorization_pending` and `slow_down` are internal state-machine events, not
user errors. Raw GitHub bodies are never rendered directly.

## Configuration

Build-time public values:

- `EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_CLIENT_ID`
- `EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_APP_SLUG`

Runtime local value:

- `devGithubIssuesEnabled=false` by default.

The client ID and slug are identifiers, not secrets. The build must contain no
GitHub App client secret or private key. Missing/invalid identifiers produce
`not_configured` and do not affect Happy startup.

The GitHub App configuration must have:

- Device Flow enabled;
- user access token expiry enabled;
- Metadata: read;
- Issues: read and write;
- repository installation selection enabled as appropriate.

## Server migration

### Remove in the transport cutover

- `/v1/github-issues/*` registration and handlers;
- server Issue service/runtime and tests;
- `HAPPY_GITHUB_ISSUES_ENABLED`;
- Issue-specific GitHub App branches in `connectRoutes`/`githubConnect`;
- client dependencies on `getServerUrl()` and Happy `AuthCredentials` for Issues.

### Preserve

- official Happy GitHub profile connect/disconnect behavior;
- unrelated nullable GitHub profile compatibility fixes;
- the historical `20260808124500_add_github_app_token_metadata` migration;
- Project Todos and its independent switch;
- Issue UI routes, DTO meaning, repository mappings, and feature flag.

### Deferred cleanup

After live desktop and mobile acceptance, add a new forward migration that drops
the obsolete Issue-only token metadata columns and update Prisma schema/code.
Never edit or delete an already-applied historical migration. This cleanup gets
its own commit and rollback note.

## Security and privacy requirements

- No token, refresh token, device code, user code, or Authorization header in
  logs, analytics, crash messages, query keys, React state persistence, or Happy
  synchronization.
- Redaction tests cover request failures and secure-store failures.
- Only trusted GitHub hosts may receive authorization headers.
- Device Flow polling respects interval and cancellation to prevent abuse.
- Repository access remains the intersection of user authority, App permissions,
  and installation repository selection.
- The authorization UI clearly says the user is leaving Happy for GitHub and
  displays the expected App name to reduce phishing ambiguity.
- Feature-off and unsupported-platform paths do not initialize credential or
  transport Adapters.

## Rollout slices

1. Introduce typed facade, fake transport/store, Device Flow and refresh tests.
2. Add mobile SecureStore and Tauri OS-keyring Adapters.
3. Move repository discovery and read-only Issue list/detail to direct GitHub.
4. Move create, close/reopen, and permanent delete.
5. Add connection/install/settings states and live desktop/mobile acceptance.
6. Remove server routes and restore official GitHub profile flow.
7. After an acceptance interval, apply the forward schema cleanup migration.

Keep each slice independently reviewable. Until slice 6, old server code may
remain unreachable behind its server flag, but the client must not contain a
silent fallback from direct GitHub to the personal server.

## Acceptance criteria

1. With `devGithubIssuesEnabled=false`, navigation and official Happy behavior
   match the upstream baseline and no Device Flow/storage code initializes.
2. Supported clients never call `/v1/github-issues/*` or use Happy account
   credentials for Issue traffic.
3. A user can authorize with Device Flow using only the configured public client
   ID, cancel safely, and retry after denial/expiry.
4. GitHub tokens persist only in Expo SecureStore or the desktop OS credential
   store; no browser/localStorage fallback exists.
5. Refresh is single-flight, rotates both tokens atomically, retries an API call
   once, and correctly requires reauthorization for an invalid refresh token.
6. The repository picker shows only repositories exposed through the selected
   GitHub App installations and offers installation setup when none exist.
7. List, detail, create, close/reopen, and capability-gated permanent delete work
   on Windows Tauri and at least one iOS/Android target.
8. Pull requests do not appear as Issues, and Issue DTOs contain no raw GitHub
   token or installation internals.
9. Unsupported browser routes explain the limitation and never store or request
   a credential.
10. Connecting/removing GitHub Issues does not change the official Happy GitHub
    profile connection on the same account.
11. Offline, rate-limit, permission, missing-installation, not-found, expired,
    secure-storage, and generic errors are deterministic and preserve drafts or
    valid credentials where specified.
12. Token and host allow-list tests demonstrate that secrets cannot enter logs or
    be sent to arbitrary URLs.
13. Server Issue routes and Issue-specific auth branches are removed without
    changing official profile behavior; the historical migration remains intact.
14. The app and server typechecks plus targeted unit/integration suites pass; any
    unavailable live platform is recorded as a release gap, not a pass.

## Verification matrix

| Area | Automated evidence | Manual evidence |
| --- | --- | --- |
| Device Flow | state/interval/cancel/expiry scripted tests | authorize/deny on Windows |
| Refresh | fake clock, rotation, single-flight, retry-once | retain connection across expiry |
| Storage | Adapter contract tests, no-web test | OS credential present; app reconnects |
| Transport | trusted-host and redaction tests | GitHub REST/GraphQL smoke |
| Repositories | pagination/dedupe/permission fixtures | selected private/public repositories |
| Issue CRUD | DTO and mutation tests | create, close, reopen, eligible delete |
| Isolation | feature-off and official-profile regression tests | disconnect Issue only |
| Platforms | app/Tauri typecheck/build | Windows plus one mobile target |

## Official references

- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app
- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens
- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-with-a-github-app-on-behalf-of-a-user
- https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app
- https://docs.github.com/en/rest/apps/installations
- https://docs.github.com/en/rest/issues/issues
- https://docs.github.com/en/graphql/reference/mutations#deleteissue
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://v2.tauri.app/plugin/http-client/
- https://docs.rs/keyring/latest/keyring/
