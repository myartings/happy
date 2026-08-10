# Happy GitHub Issues UI v2

Status: Approved for Session-panel reimplementation
Owner: personal Happy `dev` branch
Feature flag: `devGithubIssuesEnabled`, default off
Infrastructure: `github-issues-device-flow.md` and ADR 0006

## Decision

Redesign GitHub Issues as a Session accessory rather than a parallel task
manager or a GitHub settings page embedded in Happy. The everyday interaction
has two stages: a Codex-style anchored popover for quickly browsing the current
Session repository, followed by an `Issues` tab in Happy's existing right-side
workspace for detail, creation, lifecycle actions, and Agent dispatch.

Connection and repository-access management remain in Settings and appear in
the Session surfaces only when they block use. Existing full-page routes may
remain as internal or narrow-screen implementation details, but they are not a
desktop navigation destination.

This document supersedes the wireframes and screen composition in
`github-issues-ui.md`. It does not change the approved v1 product scope or the
Device Flow architecture.

## Product principles

1. **Task first.** A returning user lands on Issues, not account management.
2. **Happy native.** Reuse Happy navigation, typography, spacing, surfaces,
   chips, modal sheets, destructive confirmations, and responsive width.
3. **Session context.** Issues belong to the current Session experience and
   automatically use its verified repository association.
4. **Progressive disclosure.** Connection, installation, and permanent deletion
   appear only when relevant.
5. **Small client.** Keep comments, editing, assignments, Projects, milestones,
   notifications, and full GitHub administration out of scope.
6. **Isolated implementation.** Extend the existing quick-popover and right
   workspace panel seams; keep GitHub behavior inside the feature Module.
7. **Record or dispatch.** Creating an Issue records durable work. Dispatching
   it to an Agent is a separate explicit action that enters the repository's
   Issue workflow before implementation.

## Information architecture

| Surface | Entry | Behavior |
| --- | --- | --- |
| Desktop Session | Header Issues control | Opens an anchored repository Issue popover without resizing or navigating away from the Session |
| Desktop right workspace | `Issues` panel tab | Opens the selected Issue detail or embedded list/create flow alongside the existing Side Session panel tab |
| Phone Session | Header Issues control | Opens a bottom sheet; selecting an Issue expands to a full-height sheet |
| Settings > Features | GitHub Issues connection row | Opens connection and repository-access management |

Do not add a bottom tab, desktop navigation-row entry, or standalone everyday
Issues destination. Do not add an Issues action to every Session/project row.
The Session header is the only everyday entry; the existing right workspace is
reused rather than introducing a third desktop pane.

## Surface model

The feature has five Session-owned surfaces and two blocking states:

1. Anchored Issue quick popover
2. Right-workspace `Issues` tab
3. Embedded Issue detail
4. Embedded New Issue form
5. Repository picker sheet
6. Disconnected/authorization state
7. No accessible repository state

The connected-account management card is a Settings surface, not part of the
normal Issue list.

## Anchored Issue quick popover

The quick popover is the default desktop browsing surface. It is anchored below
the Session header control and does not resize, obscure, or navigate away from
the conversation.

```text
Session title                                      [Issues] [Right workspace]
                                      ┌──────────────────────────────┐
                                      │ happy                    ＋ │
                                      │ [ Open 12 ] [ Closed 38 ]   │
                                      ├──────────────────────────────┤
                                      │ #241                        │
                                      │ Add GitHub Issues panel     │
                                      │ enhancement · 2h · 3       │
                                      ├──────────────────────────────┤
                                      │ #238                        │
                                      │ Fix desktop header          │
                                      │ bug · 1d                    │
                                      ├──────────────────────────────┤
                                      │ View all                    │
                                      └──────────────────────────────┘
```

- Reuse Happy's existing anchored popup, click-away backdrop, radius, shadow,
  spacing, hover, and keyboard behavior.
- The compact header shows the automatically associated repository, Open/Closed
  filters, refresh state, and an icon-only New Issue action.
- Rows show number, two-line title, up to two labels, relative update time, and
  comment count. The scrollable list uses pagination; it is not capped at five.
- Clicking an Issue closes the popover, opens the right workspace, ensures one
  `Issues` panel tab exists, activates it, and displays that Issue.
- Clicking New Issue opens the same right-workspace tab directly in create mode.
- Clicking outside, pressing Escape, or pressing the header control again closes
  only the popover.

## Right-workspace Issues tab

Issues reuse the same panel manager as Side Sessions, Changes, and All Files.
They do not create a new application sidebar.

```text
┌────────────────── Session ─────────────────┬──────── Right workspace ───────┐
│                                           │ [Side session] [Issues ×]  ＋  │
│ Conversation                              ├─────────────────────────────────┤
│                                           │ ‹ happy                   #241 │
│                                           │                                 │
│                                           │ Add GitHub Issues panel         │
│                                           │ Open · enhancement · updated 2h │
│                                           │                                 │
│                                           │ Markdown body…                  │
│                                           │                                 │
│                                           │ [ Work on this issue ]          │
│ Composer                                  │ Close issue               ···  │
└───────────────────────────────────────────┴─────────────────────────────────┘
```

- `Issues` is one panel-level tab, not one tab per Issue.
- Selecting another Issue updates the existing Issues tab and its local history.
- The tab contains an internal stack: list → detail → create. Back moves within
  that stack and never navigates the main Session.
- Closing the Issues tab preserves the Session and every Side Session. Reopening
  restores that Session's last repository, filter, and selected Issue when safe.
- Switching the parent Session swaps to its own repository-scoped Issues state;
  state must never leak across unrelated Sessions or repositories.

## Repository picker

Open a Happy modal sheet when the repository selector is pressed.

```text
┌──────────────────────────────────┐
│ Select repository            ×  │
│ Search repositories…            │
├──────────────────────────────────┤
│ ✓ myartings/happy                │
│   myartings/ai-coding-template   │
│   organization/project          │
├──────────────────────────────────┤
│ Manage access on GitHub       ›  │
└──────────────────────────────────┘
```

- Search filters already loaded repositories locally.
- Selected repository has a checkmark and accessibility selected state.
- Remember the last repository on this device.
- Session entry automatically resolves and associates its repository. The
  Module first uses a still-valid cached association, then inspects
  `remote.origin.url`, and finally accepts the only GitHub remote when `origin`
  is absent. Normalize SSH and HTTPS forms and verify the result against the
  repositories accessible to the GitHub App.
- When one accessible repository is resolved, open it immediately without a
  confirmation step and cache the association for that machine/project path.
- If the remote changes, invalidate the cached association and follow the new
  remote. Never reuse an association across unrelated machines or project paths.
- Show the repository picker only when no GitHub remote exists, multiple remotes
  are ambiguous, the detected repository is not accessible, or detection fails.
- `Manage access on GitHub` is secondary and separated from selection rows.

### Automatic session association

```text
Session Issues action
        │
        ▼
valid cached association? ── yes ──► open repository
        │ no
        ▼
resolve origin / sole GitHub remote
        │
        ├─ one accessible repository ─► cache and open automatically
        ├─ detected but inaccessible ─► access explanation + Manage access
        ├─ multiple candidates ────────► repository picker
        └─ no GitHub repository ───────► last repository / repository picker
```

Repository detection is a background transition, not a separate confirmation
screen. Show a small loading indicator only when the remote lookup is not
instantaneous. A manually selected repository applies to the current visit; it
becomes the cached session association only when there is no contradictory
remote evidence.

## Embedded Issue detail

```text
┌──────────────────────────────────┐
│ ‹            #241            ···│
├──────────────────────────────────┤
│ Add GitHub Issues page           │
│ Open · myartings · updated 2h    │
│ [enhancement]                    │
│                                  │
│ Markdown body…                   │
│                                  │
├──────────────────────────────────┤
│          [ Close issue ]         │
└──────────────────────────────────┘
```

- The detail renders inside the right-workspace Issues tab on desktop and the
  full-height Session sheet on phone. It does not replace the main Session.
- Header title is the Issue number; the full title belongs in content.
- Metadata includes state, author, relative update time, labels, and comment
  count. Render the body with Happy's existing Markdown renderer.
- Close/Reopen is the visible primary lifecycle action. Disable it and show
  progress while the mutation runs.
- The overflow menu may contain `Open on GitHub` and, only when
  `viewerCanDelete=true`, `Delete permanently`.
- Permanent-delete confirmation names `owner/repository #number` and states that
  deletion on GitHub cannot be undone.
- A successful state change updates the detail and the cached list. A successful
  delete returns to the list. Failures preserve the page and show a normalized
  actionable error.

## Embedded New Issue

```text
┌──────────────────────────────────┐
│ Cancel       New Issue     Create│
├──────────────────────────────────┤
│ Repository                       │
│ myartings/happy                   │
│                                  │
│ Title                            │
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ └──────────────────────────────┘ │
│ Description                      │
│ ┌──────────────────────────────┐ │
│ │ Markdown…                    │ │
│ │                              │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

- Open from the quick-popover plus action or from the Issues tab list. Render in
  the existing Issues tab/sheet rather than navigating the desktop Session.
- `Create` is disabled until trimmed title is valid and while saving.
- Repository is inherited and read-only.
- Preserve title and body after network, permission, or rate-limit errors.
- If the user cancels with content present, ask whether to discard or keep the
  local draft. Keep one draft per repository on this device.
- Success replaces the form with the embedded Issue detail; Back returns to the
  Issues list inside the same panel/sheet.
- After creation, show `Done` and `Work on it`. `Done` only records the Issue.
  `Work on it` starts the dispatch flow below; creation alone never starts an
  Agent or Triage.

## Dispatch an Issue to a Session

Issue dispatch is the bridge back to Happy's primary surface: Sessions. It does
not change GitHub assignees and does not expose Agent workflow state in the
Issue UI.

The detail screen contains one primary action:

```text
┌──────────────────────────────────┐
│ Add GitHub Issues page           │
│ #241 · myartings/happy           │
│                                  │
│ Markdown body…                   │
│                                  │
│       [ Work on this issue ]     │
└──────────────────────────────────┘
```

Selecting it opens a small target confirmation inside the Issues panel/sheet:

```text
┌──────────────────────────────────┐
│ Work on issue #241               │
│                                  │
│ Add to current session           │
│ Start a new session              │
└──────────────────────────────────┘
```

- When opened from a Session, prefer that Session if it belongs to the same
  resolved repository.
- Otherwise offer active Sessions for the same repository and `Start a new
  session`. Never silently send an Issue to a different repository.
- Existing Session dispatch appends a structured task to its draft without
  overwriting user text, then focuses the parent Session composer for
  review/send. The Issues panel may remain open or collapse according to the
  existing right-workspace behavior; it must not auto-send.
- New Session dispatch preselects the project path and prepares the structured
  task while leaving Agent, model, and worktree choices in the normal New
  Session flow.
- If no repository match is available, explain the mismatch and offer a new
  correctly scoped Session rather than weakening repository checks.

### Triage before implementation

For repositories whose instructions require external Issue Triage, dispatch is
an explicit maintainer invocation of that workflow. The Session task instructs
the Agent to Triage the Issue first and continue into implementation only after
the Issue reaches the repository's Agent-ready outcome.

Conceptual launch task:

```text
/triage #241

Triage this GitHub Issue according to the repository workflow. Ask me in this
Session for any required maintainer decisions. When Triage is confirmed as
ready for Agent execution, continue in this Session through the repository's
local start, scoping, implementation, verification, review, and finish flow.
Do not bypass Triage.
```

This explicit task satisfies skills that disallow unsolicited model invocation;
the Agent did not independently choose to Triage. The Triage workflow still
owns its required maintainer checkpoint before applying a recommendation.

- `ready-for-agent`: create or resume the local workflow and continue
  automatically without asking a second generic "start development?" question.
- `needs-info`: remain in the Session and ask for the missing information.
- `ready-for-human`: stop Agent implementation and explain the human action.
- `wontfix`: stop implementation after the confirmed Triage outcome.
- Conflicting states: stop and ask the maintainer to resolve them.
- An already-triaged Issue with a current Agent Brief may proceed without
  repeating resolved questions; the Agent must still reconcile newer changes.

Happy does not render Triage states, Agent Briefs, Workspace gates, branches,
worktrees, validation receipts, or finish state. Those remain Agent/repository
concerns. The developer sees only the Issue and the Session conversation where
decisions are needed.

For repositories without a Triage workflow, the same dispatch action tells the
Agent to follow repository-local instructions; Happy does not fabricate Matt
roles or hard-code label names.

## Connection and blocking states

### Disconnected

Show a focused empty state instead of a settings-style list:

- GitHub mark
- `Connect GitHub Issues`
- one short explanation of selected-repository access and device-local storage
- primary `Connect` action
- secondary `Learn about access` action if documentation exists

The Device Flow verification experience remains as specified in
`github-issues-device-flow.md`, but should use a focused card with a large code,
Copy, Open GitHub, Cancel, waiting indicator, and expiry.

### Connected but no repositories

Show `Choose repositories on GitHub` as the primary action and refresh discovery
when Happy becomes active. Do not render an empty repository group.

### Connection management

Settings > Features owns the persistent connection card:

- connected account
- credential stored on this device
- Manage repository access
- Remove from this device

The quick popover and Issues tab can expose only a small settings shortcut in
their repository picker or blocking error state.

## Error behavior

| Condition | Presentation | Data behavior |
| --- | --- | --- |
| Initial loading | Stable skeleton/placeholder | No stale empty flash |
| Refresh failed | Inline retry banner | Preserve current Issues |
| Offline | Offline banner and Retry | Preserve list/form/detail |
| 401/reconnect | Blocking reconnect state | Preserve repository and draft |
| 403 | Explain missing Issue/write/admin access | Preserve content |
| 404 | Explain unavailable Issue/repository | Clear stale mapping only after confirmation |
| Rate limited | Show retry time when available | Preserve content and draft |
| Empty Open/Closed | Friendly state plus New Issue | Keep repository/filter |

## Responsive and accessibility rules

- Wide desktop/Tauri: use the anchored quick popover plus existing resizable
  right workspace. Do not create a second independent sidebar.
- Narrow desktop/tablet: the quick popover remains available when it fits; the
  Issues workspace may use the existing overlay/expanded-panel presentation.
- Phone: the header control opens a bottom sheet; selecting or creating an Issue
  expands to a full-height sheet with native safe-area handling. Closing returns
  to the same Session.
- Support light/dark themes exclusively through Happy theme tokens.
- Titles wrap to two lines in lists and freely in detail; metadata yields first.
- Every icon-only action has a localized accessibility label.
- Open/Closed and selected repository expose accessibility state.
- Touch targets are at least 44 points. Loading and disabled states are
  announced without relying on color.
- All user-facing strings go through Happy translations.

## Module and integration design

The existing GitHub Issues feature remains a deep Module. Screens consume one
small Interface for connection state, repository resolution, list/detail reads,
mutations, and Session dispatch. GitHub transport, credential refresh,
installation discovery, project mapping, task construction, target validation,
caching, pagination, and error normalization remain inside the Module
implementation.

Host seams remain deliberately shallow and additive:

- feature flag and Settings row
- Session header quick-popover control
- existing right-workspace panel registration and state
- phone Session sheet adapter

Do not place Git commands, token state, GitHub response parsing, or repository
mapping persistence directly in those host call sites.

Suggested UI-local pieces:

- `GithubIssuesQuickPopover` — anchored browse/select surface
- `GithubIssuesPanel` — right-workspace list/detail/create stack
- `GithubIssuesMobileSheet` — phone adapter over the same feature state
- `GithubIssueListToolbar` — repository and state controls
- `GithubIssueRow` — stable list presentation
- `GithubRepositoryPicker` — selection/search/manage-access sheet
- `GithubIssueDetailView` — embeddable detail composition and lifecycle actions
- `NewGithubIssueView` — embeddable draft form
- `GithubIssueDispatchSheet` — current/new Session target selection
- `GithubIssuesConnectionState` — disconnected/authorization/no-repository states

These are implementation pieces behind the feature Module, not new public
navigation destinations.

## Delivery slices

1. Add the Codex-style anchored Issue quick popover to the Session header.
2. Register one `Issues` tab in the existing right-workspace panel manager.
3. Refactor list/detail/create screens into embeddable feature views shared by
   desktop panel and mobile sheet.
4. Preserve repository picker, automatic Session association, rich rows,
   refresh, pagination, drafts, lifecycle actions, and exact deletion safety.
5. Add repository-safe current/new Session dispatch with explicit Triage-first
   launch tasks and automatic continuation after an Agent-ready outcome.
6. Remove the desktop/global Issues navigation entry and obsolete centered
   Session Modal while retaining Settings connection management.
7. Add translations, accessibility, component tests, and desktop/mobile live
   acceptance for popover → panel transitions.

Each slice must keep `devGithubIssuesEnabled=false` behavior unchanged and avoid
modifying the official Happy GitHub profile flow.

## Acceptance criteria

1. A connected desktop user opens the current Session repository Issue list in
   an anchored popover without navigation or Session resize.
2. Selecting or creating an Issue closes the popover and opens one `Issues` tab
   in the existing right workspace alongside Side Session panels.
3. Popover and embedded list rows show number, title, labels, relative update
   time, and comment count; refresh preserves content on failure and pagination
   is not artificially capped at five.
4. Repository selection is compact, searchable, and remembered locally. A
   session with one accessible GitHub repository opens it automatically; only
   missing, ambiguous, or inaccessible remotes require user selection.
5. Embedded detail shows required metadata and Markdown; Close/Reopen is
   available and permanent delete is capability-gated in overflow with an exact
   confirmation.
6. Embedded New Issue prevents duplicate submission and preserves a
   repository-scoped draft after failure or user-approved exit.
7. Creating an Issue does not start work. `Work on this issue` targets only a
   matching current/new Session and explicitly invokes repository-required
   Triage before implementation.
8. Triage pauses for required maintainer decisions, stops on non-Agent outcomes,
   and automatically continues the same Session after a confirmed Agent-ready
   outcome without exposing workflow state in the Issue UI.
9. Closing Issues does not close, replace, or reset Side Sessions; switching the
   parent Session cannot leak repository or selected-Issue state.
10. Disconnected, no-repository, offline, permission, not-found, rate-limit,
   loading, empty, and retry states follow this specification.
11. With the feature flag off or in a regular browser, official Happy navigation
   and behavior remain unchanged.
12. Windows passes live popover → Issues-tab → detail/create/dispatch acceptance;
   at least one mobile platform passes the corresponding sheet flow.
