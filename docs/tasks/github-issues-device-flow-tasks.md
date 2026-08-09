# Task: Migrate GitHub Issues to client Device Flow

Status: Windows live CRUD accepted; mobile and isolation acceptance pending
Branch: `myartings/github-issues-device-flow`

## Outcome

Replace the personal Happy server dependency with a deep, feature-local client
Module that authorizes through GitHub App Device Flow, stores credentials in
platform security facilities, and talks directly to GitHub on desktop/mobile.

## Guardrails

- Keep `devGithubIssuesEnabled` default off.
- Do not change or reuse the official Happy GitHub profile connection.
- Do not ship a client secret/private key or add browser token storage.
- Do not edit/delete an applied Prisma migration.
- Preserve unrelated upstream compatibility fixes and Project Todos.
- Do not add a silent fallback to `/v1/github-issues/*`.

## Implementation slices

### T1 — Contracts and deterministic core

- [x] Define the `GithubIssuesClient` facade and typed public DTO/error Interface.
- [x] Define internal credential-store and HTTP transport Interfaces.
- [x] Add in-memory/scripted Adapters plus fake clock/sleeper.
- [x] Implement and test the Device Flow state machine: success, pending,
      `slow_down`, denial, expiry, cancellation, malformed response, and
      misconfiguration.
- [x] Implement and test token-bundle decoding/versioning and log redaction.
- [x] Implement and test single-flight refresh, atomic token rotation, the
      five-minute refresh window, invalid refresh, offline preservation, and one
      authenticated retry.
- [x] Enforce the GitHub host allow-list before attaching Authorization.

### T2 — Secure storage Adapters

- [x] Add the Expo SecureStore Adapter for iOS/Android.
- [x] Add narrowly scoped Tauri Rust commands for one GitHub Issues credential.
- [x] Back Tauri commands with the OS credential store and namespace keys by app
      identity/environment.
- [x] Restrict Tauri command capability to the application window.
- [x] Make Linux Secret Service absence a typed fail-closed error.
- [ ] Add Adapter contract tests for load/save/replace/remove and corrupt data.
- [x] Prove browser runtime has no credential Adapter or localStorage fallback.

### T3 — Direct GitHub repository and read path

- [x] Implement native-fetch and Tauri HTTP-plugin transport Adapters.
- [x] Add GitHub headers/API-version handling and sanitized error normalization.
- [x] List user-token-accessible App installations and their repositories with
      pagination, de-duplication, and minimal DTOs.
- [x] Implement `/user` account identity and connection-state recovery.
- [x] Move Issue list/detail normalization to the direct transport.
- [x] Exclude pull requests and preserve existing list/detail behavior.
- [x] Remove Happy `AuthCredentials` and `getServerUrl()` from Issue screens.

### T4 — Write operations

- [x] Move create and close/reopen to direct GitHub REST calls.
- [x] Move capability lookup and permanent `deleteIssue` to GitHub GraphQL.
- [x] Preserve drafts, destructive confirmation, and delete-vs-close semantics.
- [ ] Add fixtures/tests for permission, organization-policy, not-found,
      rate-limit, offline, and raw GraphQL error cases.

### T5 — Connection and platform UI

- [x] Add disconnected explanation and Connect action.
- [x] Add the Device Flow code screen with expected app name, Copy, Open GitHub,
      waiting/expiry, retry, and Cancel.
- [x] Add installation-required state and foreground refresh after GitHub setup.
- [x] Add a separate GitHub Issues settings card with account, Remove from this
      device, and Manage access on GitHub.
- [x] Hide normal browser navigation entry and add direct-route unsupported UI.
- [x] Preserve existing session/sidebar entries, repository mappings, and return
      navigation behind the local feature flag.
- [ ] Add translations, accessibility labels, and component tests.

### T6 — Server decoupling

- [x] Remove Issue route registration and `/v1/github-issues/*` handlers.
- [x] Remove server Issue service/runtime/feature flag and their tests.
- [ ] Restore official profile-only behavior in `connectRoutes` and
      `githubConnect`; add regression coverage.
  - The implementation now matches `upstream/main`; dedicated automated
    profile-connect regression coverage remains open.
- [x] Confirm no Issue code references the Happy server URL or account token.
- [x] Preserve the historical Issue metadata migration.
- [x] Review the full server diff against upstream to retain unrelated fixes.

### T7 — Live acceptance and deferred schema cleanup

- [x] Configure only the public client ID/app slug in the dev build and enable
      Device Flow plus expiring user tokens in the GitHub App.
- [ ] Pass Windows Tauri connect, repository discovery, list/detail, create,
      close/reopen, eligible permanent delete, refresh, and disconnect checks.
  - Verified connect, credential persistence across restarts, repository
    discovery, list/detail, create, close/reopen, and permanent delete on Windows.
    Explicit token-expiry refresh and disconnect/reconnect remain open.
- [ ] Pass the same authorization/storage core on at least one mobile target.
- [ ] Confirm the official Happy server remains selected and official GitHub
      profile connect/disconnect remains independent.
- [ ] Inspect OS credential storage behavior without recording secret values.
- [ ] Record macOS/Linux live gaps explicitly if those platforms are unavailable.
- [ ] After an acceptance interval, add a forward migration dropping obsolete
      Issue-only token columns; do not rewrite migration history.

## Verification commands

Use the repository's `.ai/project.json` as the authoritative command source.
At minimum, run the applicable app/server typechecks and targeted tests for the
changed slices, then the full configured suites before finish. Record exact
commands and results in the active workflow's `validation.md`.

Additional structural checks:

```powershell
rg -n "/v1/github-issues|HAPPY_GITHUB_ISSUES_ENABLED|getServerUrl" packages/happy-app packages/happy-server
rg -n "accessToken|refreshToken|Authorization" packages/happy-app/sources/features/github-issues packages/happy-app/src-tauri
git diff --check
git status --short
```

The first command should have no runtime matches after T6. Matches from the
second command require manual review; no token value may be logged, persisted in
ordinary settings, or sent outside the trusted GitHub host allow-list.

## Definition of done

- [ ] ADR 0006 and all 14 specification acceptance criteria are satisfied or an
      explicit release-blocking gap remains open.
- [x] Automated Device Flow, refresh, storage, transport, error, and isolation
      tests pass.
- [ ] Windows desktop and one mobile target have live evidence.
- [x] Browser and feature-off behavior fail closed.
- [ ] Official Happy profile connection and Project Todos regressions pass.
- [ ] Server proxy code is removed and migration history remains valid.
- [ ] The final diff contains no credentials, build outputs, local logs, or
      unrelated changes.
