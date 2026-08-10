# Happy GitHub Issues UI

Status: Proposed for review  
Owner: personal Happy `dev` branch  
Feature flag: required, default off

> Authentication, credential storage, API transport, server isolation, and
> rollout details in this original UI specification are superseded by
> `docs/specs/github-issues-device-flow.md` and ADR 0006. The approved product
> scope remains relevant; the screen composition, wireframes, and detailed
> interactions are superseded by `docs/specs/github-issues-ui-v2.md`.

## Problem

Happy's personal Project Todos are convenient but local to Happy and do not
participate in the repository's public development record. GitHub Issues are a
better source of truth for repository work, but leaving Happy for the browser
breaks the mobile session-review loop.

The desired experience is a small GitHub Issues client inside Happy: inspect a
repository's issues, create one, remove it from the work queue, and switch
between the issue context and coding sessions without implementing a complete
GitHub client.

## Current-system evidence

- Settings already connects a GitHub identity and the server stores its token
  encrypted, but consumers only use profile/avatar and social identity data.
- OAuth currently requests `read:user,user:email,read:org,codespace`; it does
  not grant repository Issue management.
- The server initializes an Octokit GitHub App and accepts Issue webhooks, but
  exposes no Issue CRUD and stores no installation metadata.
- Native home is session-first and does not use the web tab bar. Desktop/tablet
  already have a persistent sidebar with a Project Todos integration seam.
- Session metadata has machine/project paths but no canonical GitHub repository.

## Product decisions

### Information architecture

Issues and Sessions are peers, not parent/child data. Use a top-level
`/github-issues` route so the feature stays isolated, with contextual shortcuts
from sessions and project rows.

| Surface | Entry | Return behavior |
| --- | --- | --- |
| Phone home | Header Issues icon | Back returns to Sessions |
| Phone session | Header Issues icon scoped to the session project | Back returns to that session |
| Desktop/tablet | Issues row in persistent sidebar | Sessions remain one click away |
| Project row | Small Issues button | Opens the mapped repository |

A new native bottom tab is out of scope because current native home does not use
the web tab architecture. Introducing a new global navigation system would
couple this feature to upstream layout work.

### Minimum useful release

Included:

1. List open or closed Issues for one selected repository.
2. View title, number, state, author, update time, labels, comment count, and
   Markdown body.
3. Create an Issue with title and optional Markdown body.
4. Close/reopen an Issue as the normal way to remove or restore work.
5. Permanently delete only when GitHub reports `viewerCanDelete=true`, after an
   explicit destructive confirmation.
6. Select a repository and remember project-to-repository mappings.
7. Deterministic loading, empty, disconnected, missing-permission, offline,
   rate-limit, and generic error states.

Excluded from v1:

- Comments, reactions, milestones, Projects, dependencies, assignees, and label
  editing.
- Editing title/body after creation.
- Notifications, realtime refresh, offline mutation queues, and polling.
- Automatically starting an Agent session from an Issue.
- Replacing or deleting Project Todos during initial rollout.
- GitHub Enterprise Server.

### Delete semantics

Accepted: Close/Reopen is the primary lifecycle. Eligible administrators also
receive a separately labeled permanent-delete action.

Closing is the normal workflow action. Permanent deletion is restricted to
eligible repository owners/admins and may be disabled by organization policy.

- List context action: `Close` or `Reopen`.
- Detail overflow: `Delete permanently`, only when allowed.
- Confirmation includes repository and Issue number and states that deletion is
  irreversible.
- A failed delete is never presented as a successful close.

GitHub's REST Issue API has no permanent-delete endpoint. The server uses the
GraphQL `deleteIssue` mutation after obtaining the node ID and
`viewerCanDelete`.

## Wireframes

### Phone — Sessions and contextual entry

```text
┌──────────────────────────────────┐
│ Happy       Sessions       ◉  ⦿ │  ⦿ = Issues
├──────────────────────────────────┤
│ Project: happy                   │
│   ● Session A                    │
│   ○ Session B                    │
│                                  │
│          New-session dock        │
└──────────────────────────────────┘

Session header
┌──────────────────────────────────┐
│ ‹  brave-harbor          ⦿ avatar│
└──────────────────────────────────┘
```

### Phone — Issue list

```text
┌──────────────────────────────────┐
│ ‹  Issues             happy ▾  ＋│
├──────────────────────────────────┤
│ [ Open 12 ]   [ Closed ]         │
│                                  │
│ #241  Add GitHub Issues page     │
│ enhancement   updated 2h   3 ◯   │
│ ──────────────────────────────── │
│ #238  Android header regression  │
│ bug           updated 1d         │
│                                  │
│              pull to refresh     │
└──────────────────────────────────┘
```

### Phone — Detail and creation

```text
┌──────────────────────────────────┐
│ ‹  #241                    ···    │
├──────────────────────────────────┤
│ Add GitHub Issues page           │
│ Open · myartings · 2h            │
│ [enhancement] [ready-for-agent]  │
│                                  │
│ Markdown body…                   │
│                                  │
│ [ Close issue ]                  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Cancel       New Issue      Create│
├──────────────────────────────────┤
│ Repository   myartings/happy     │
│ Title        __________________  │
│ Description                      │
│ ┌──────────────────────────────┐ │
│ │ Markdown…                    │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### Desktop/tablet

```text
┌──────────── sidebar ────────────┬──────── issue content ───────────┐
│ + New session                  │ Issues · myartings/happy      ＋ │
│ ⦿ Issues                  12   ├──────────────────────────────────┤
│                                │ Open   Closed                    │
│ happy                          │ #241 Add GitHub Issues page      │
│   Session A                    │ #238 Android header regression  │
│   Session B                    │                                  │
│                                │                                  │
│ Settings                       │                                  │
└────────────────────────────────┴──────────────────────────────────┘
```

Desktop v1 uses a full content route, not a third persistent pane. This leaves
the existing session/file split-view architecture untouched.

## Interaction flows

### First open

1. If GitHub is disconnected, explain required access and offer Connect.
2. If connected but the app is not installed on a repository, offer Choose
   repositories on GitHub.
3. Return from GitHub, refresh accessible repositories, select one, and show
   open Issues. Remember the last repository.

### Open from a session

1. Resolve the existing project key from session metadata.
2. Use a saved mapping when present.
3. Otherwise run the existing read-only machine command
   `git config --get remote.origin.url`, parse GitHub SSH/HTTPS forms, and verify
   it against repositories accessible to the GitHub App.
4. If unavailable or ambiguous, show the repository picker.
5. Save only the user's confirmed mapping; do not infer across unrelated
   machines.

### Create

1. Repository is inherited from the list and cannot silently change.
2. Title is required after trimming; body is optional.
3. Submit once and disable duplicate submission.
4. On success, prepend the server response and navigate to detail.
5. On permission/rate-limit/network error, preserve the draft.

### Close or delete

1. Close/reopen waits for a server response before changing durable UI state.
2. Permanent delete appears only when `viewerCanDelete` is true.
3. Permanent delete requires destructive confirmation.
4. On success, remove the Issue from cache and return to the list.
5. `403`, `404`, and organization-policy failures get distinct messages.

## Permission architecture

Accepted: extend the existing GitHub App rather than expand classic OAuth to
broad `repo` access. See ADR 0005.

Required GitHub App repository permissions:

- Metadata: read.
- Issues: read and write.

The user selects repositories during installation. A GitHub App user access
token operates within the intersection of the user's access and the app's
permissions. Only Happy server code can read tokens.

The current `codespace` scope is unrelated. A classic OAuth shortcut would need
`public_repo` for public-only access or broad `repo` for private repositories;
that shortcut is not recommended.

The existing `GithubUser.token` model also needs encrypted refresh-token and
expiry metadata if expiring GitHub App user tokens are enabled. Tokens are never
returned to a Happy client.

## API boundary

All GitHub traffic is proxied through authenticated, feature-specific server
routes:

```text
GET    /v1/github-issues/repositories
GET    /v1/github-issues/repositories/:owner/:repo/issues?state=open&page=1
GET    /v1/github-issues/repositories/:owner/:repo/issues/:number
POST   /v1/github-issues/repositories/:owner/:repo/issues
PATCH  /v1/github-issues/repositories/:owner/:repo/issues/:number
DELETE /v1/github-issues/repositories/:owner/:repo/issues/:number
```

Rules:

- Validate owner/name/number server-side.
- Exclude pull requests returned by GitHub's Issue API.
- Return small Happy-owned DTOs, not raw Octokit payloads.
- Paginate 30 rows per request and normalize rate-limit retry metadata.
- Delete performs a GraphQL capability check and mutation.
- No webhook/database mirror is required in v1.

## Client boundary and state

Feature-owned code lives under `sources/features/github-issues/`:

```text
api/          Happy server client and DTOs
model/        query keys, filters, repository mapping and parsers
components/   picker, rows, states and destructive dialog
screens/      list, detail and create composition
```

Settings:

- Local `devGithubIssuesEnabled`, default `false`.
- Local `githubIssuesLastRepository`.
- Synced `githubIssueRepositoryByProjectKey`, storing only `owner/repo`.

Issue data uses a feature-local in-memory cache, refresh-on-focus, and manual
pull-to-refresh. Issue content is not written into Happy sync state in v1.

## Isolation and rollout

Two switches fail closed:

- Client `devGithubIssuesEnabled=false` hides routes and shortcuts.
- Server `HAPPY_GITHUB_ISSUES_ENABLED=false` rejects feature endpoints.

Most code is additive. Host seams are limited to settings schema/UI, app route
registration, sidebar/home entry, project entry, and session header action.
Project Todos remains independently switchable.

Rollout slices:

1. Server adapter and contract tests behind the server switch.
2. Repository selection and list/detail read path.
3. Create and close/reopen.
4. Capability-gated permanent deletion.
5. Session/project shortcuts.
6. Compare with Project Todos before deciding its future.

## Error states

| Condition | Response |
| --- | --- |
| Feature off | No entry; direct route returns home |
| GitHub disconnected | Explanation and Settings deep link |
| No installation/repository | Repository-access setup action |
| Mapping missing | Picker with optional detected origin |
| Empty list | State-specific empty message plus Create |
| 401 | Reconnect GitHub; no indefinite retry |
| 403 | Explain missing Issue access or admin-only deletion |
| 404 | Show unavailable and clear stale mapping when appropriate |
| Rate limited | Preserve data and show retry time |
| Offline/network | Preserve screen/draft and offer retry |

## Accessibility

- Icon-only entries have labels such as `Open GitHub Issues`.
- State is never communicated only by color.
- Destructive actions use platform confirmation and destructive color tokens.
- Dynamic type wraps titles; metadata truncates first.
- Loading does not shift navigation chrome.

## Complexity estimate

| Slice | Estimate | Main uncertainty |
| --- | ---: | --- |
| GitHub App authorization/token refresh | 3–5 days | Existing app registration and migration |
| Server adapter and tests | 2–3 days | GraphQL delete/error mapping |
| Cross-platform UI | 3–4 days | Native header and picker polish |
| Project mapping/session shortcuts | 1–2 days | Offline and non-GitHub remotes |
| Integration/translations/hardening | 2–3 days | Mobile OAuth return and rate limits |
| Total | 11–17 engineering days | Before release lead time |

## Acceptance criteria

1. With both flags off, official Happy behavior and navigation are unchanged.
2. An authorized user can select a repository and list open/closed Issues on
   desktop and mobile.
3. Pull requests never appear in the Issue list.
4. Detail renders the defined metadata and Markdown without exposing tokens or
   raw GitHub payloads.
5. A user with Issue write access can create, close, and reopen an Issue.
6. Permanent delete is hidden when unsupported and confirmed when allowed.
7. A session shortcut opens its confirmed repository or picker, and Back returns
   to the originating session.
8. Auth, permission, not-found, rate-limit, offline, empty, and retry states are
   deterministic and tested.
9. GitHub implementation stays inside feature modules; host seams are small and
   guarded by the client flag.
10. Project Todos continues to work independently during rollout.

## Official GitHub references

- https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app
- https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
- https://docs.github.com/en/graphql/reference/issues
- https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/deleting-an-issue
