# Happy GitHub Issues UI v2

Status: Approved for implementation
Owner: personal Happy `dev` branch
Feature flag: `devGithubIssuesEnabled`, default off
Infrastructure: `github-issues-device-flow.md` and ADR 0006

## Decision

Redesign GitHub Issues as a small, native Happy task surface rather than a
GitHub settings page embedded in Happy. The everyday route prioritizes the
selected repository and its Issues. Connection and repository-access management
remain available in Settings and appear in the main route only when they block
use.

This document supersedes the wireframes and screen composition in
`github-issues-ui.md`. It does not change the approved v1 product scope or the
Device Flow architecture.

## Product principles

1. **Task first.** A returning user lands on Issues, not account management.
2. **Happy native.** Reuse Happy navigation, typography, spacing, surfaces,
   chips, modal sheets, destructive confirmations, and responsive width.
3. **Context without nesting.** Issues and Sessions remain peer destinations;
   a session can supply repository context without making Issues its child.
4. **Progressive disclosure.** Connection, installation, and permanent deletion
   appear only when relevant.
5. **Small client.** Keep comments, editing, assignments, Projects, milestones,
   notifications, and full GitHub administration out of scope.
6. **Isolated implementation.** Host integration stays limited to route
   registration, feature settings, sidebar/home shortcuts, and the session
   shortcut.
7. **Record or dispatch.** Creating an Issue records durable work. Dispatching
   it to an Agent is a separate explicit action that enters the repository's
   Issue workflow before implementation.

## Information architecture

| Surface | Entry | Behavior |
| --- | --- | --- |
| Phone home | GitHub Issues icon | Opens last repository; Back returns home |
| Phone session | GitHub Issues icon | Automatically opens the session repository when detectable; Back returns to session |
| Desktop/tablet | Labeled Issues sidebar row | Opens full-width content route; Sessions stay one click away |
| Settings > Features | GitHub Issues connection row | Opens connection and repository-access management |

Do not add a bottom tab or a third desktop pane. Do not add an Issues button to
every session/project row in v2; the session header and desktop sidebar provide
enough access without making upstream session lists more complex.

## Screen model

The feature has four product screens and two blocking states:

1. Issue list
2. Repository picker sheet
3. Issue detail
4. New Issue
5. Disconnected/authorization state
6. No accessible repository state

The connected-account management card is a Settings surface, not part of the
normal Issue list.

## Issue list

### Phone

```text
┌──────────────────────────────────┐
│ ‹          GitHub Issues      ＋ │
├──────────────────────────────────┤
│ happy ▾                          │
│ [ Open 12 ] [ Closed 38 ]        │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ #241                         │ │
│ │ Add GitHub Issues page       │ │
│ │ enhancement  updated 2h  ◯ 3│ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ #238                         │ │
│ │ Android header regression    │ │
│ │ bug          updated 1d      │ │
│ └──────────────────────────────┘ │
│                                  │
│          pull to refresh         │
└──────────────────────────────────┘
```

- Use the native navigation header. The plus action is icon-only with an
  accessibility label.
- The repository selector is a compact pressable row below the header. Show the
  repository name, not the full account path when space is tight.
- Open/Closed uses the same rounded chip language as Project Todos. Selection is
  communicated by surface, text weight, and accessibility state, not color only.
- Each Issue is one Happy surface card with a generous touch target. Show number,
  two-line title, up to two labels, relative update time, and comment count.
- Pull to refresh preserves the current list. Initial loading uses skeleton rows
  or stable placeholders so navigation does not shift.
- Empty state stays inside the list area and includes a `New issue` action.

### Desktop/tablet

```text
┌──────────── sidebar ────────────┬─────────────────────────────────┐
│ + New session                  │ GitHub Issues              ＋   │
│ Project Todos                  ├─────────────────────────────────┤
│ Issues                         │ happy ▾    Open 12   Closed 38  │
│                                │                                 │
│ Sessions                       │ ┌─────────────────────────────┐ │
│   Session A                    │ │ #241 Add GitHub Issues…     │ │
│   Session B                    │ │ enhancement · 2h · 3        │ │
│                                │ └─────────────────────────────┘ │
│ Settings                       │                                 │
└────────────────────────────────┴─────────────────────────────────┘
```

- Keep the existing persistent sidebar.
- Center Issue content using Happy's responsive maximum width rather than
  stretching cards across the full desktop window.
- Repository selector, state chips, and create action share one compact toolbar.
- Do not introduce a master-detail split in v2; opening an Issue navigates to the
  existing full content route and keeps the sidebar visible where supported.

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

## Issue detail

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

## New Issue

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

- Use native header actions. `Create` is disabled until trimmed title is valid
  and while saving.
- Repository is inherited and read-only.
- Preserve title and body after network, permission, or rate-limit errors.
- If the user cancels with content present, ask whether to discard or keep the
  local draft. Keep one draft per repository on this device.
- Success replaces the form with the created Issue detail; Back then returns to
  the originating list/session navigation chain.
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

Selecting it opens a small target sheet:

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
  overwriting user text, then navigates back to that Session for review/send.
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

The Issue list can expose only a small settings shortcut in its repository
picker or error state.

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

- Phone: full-width content with 16 px horizontal padding and native safe-area
  handling.
- Tablet/web/Tauri: centered content using `layout.maxWidth`; cards do not span
  the whole window.
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

- route registration
- feature flag and Settings row
- phone home shortcut
- phone session shortcut
- desktop/sidebar shortcut

Do not place Git commands, token state, GitHub response parsing, or repository
mapping persistence directly in those host call sites.

Suggested UI-local pieces:

- `GithubIssuesScreen` — screen composition only
- `GithubIssueListToolbar` — repository and state controls
- `GithubIssueRow` — stable list presentation
- `GithubRepositoryPicker` — selection/search/manage-access sheet
- `GithubIssueDetailScreen` — detail composition and lifecycle actions
- `NewGithubIssueScreen` — draft form
- `GithubIssueDispatchSheet` — current/new Session target selection
- `GithubIssuesConnectionState` — disconnected/authorization/no-repository states

These are implementation pieces behind the feature route, not new public seams.

## Delivery slices

1. Restructure list and move persistent connection UI to Settings.
2. Add repository picker, last-repository persistence, and automatic
   session-to-repository resolution inside the Module.
3. Add rich Issue rows, relative time, refresh, and stable empty/error states.
4. Redesign detail actions, overflow menu, and exact destructive confirmation.
5. Redesign New Issue navigation and repository-scoped drafts.
6. Add repository-safe current/new Session dispatch with explicit Triage-first
   launch tasks and automatic continuation after an Agent-ready outcome.
7. Add translations, accessibility, component tests, and mobile acceptance.

Each slice must keep `devGithubIssuesEnabled=false` behavior unchanged and avoid
modifying the official Happy GitHub profile flow.

## Acceptance criteria

1. A connected returning user reaches their last/context repository Issue list
   without passing account-management UI.
2. Phone, tablet, and desktop layouts use Happy's navigation, surfaces, width,
   spacing, theme, and interaction patterns.
3. List rows show number, title, labels, relative update time, and comment count;
   pull to refresh preserves content on failure.
4. Repository selection is compact, searchable, and remembered locally. A
   session with one accessible GitHub repository opens it automatically; only
   missing, ambiguous, or inaccessible remotes require user selection.
5. Detail shows required metadata and Markdown; Close/Reopen is primary and
   permanent delete is capability-gated in overflow with an exact confirmation.
6. New Issue uses native header actions, prevents duplicate submission, and
   preserves a repository-scoped draft after failure or user-approved exit.
7. Creating an Issue does not start work. `Work on this issue` targets only a
   matching current/new Session and explicitly invokes repository-required
   Triage before implementation.
8. Triage pauses for required maintainer decisions, stops on non-Agent outcomes,
   and automatically continues the same Session after a confirmed Agent-ready
   outcome without exposing workflow state in the Issue UI.
9. Disconnected, no-repository, offline, permission, not-found, rate-limit,
   loading, empty, and retry states follow this specification.
10. With the feature flag off or in a regular browser, official Happy navigation
   and behavior remain unchanged.
11. Windows and at least one mobile platform pass live list/detail/create/
   close/reopen acceptance; eligible deletion is verified where available.
