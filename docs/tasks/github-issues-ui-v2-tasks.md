# Tasks: Happy GitHub Issues UI v2

Status: implemented with accepted mobile/toolchain gap
Specification: `docs/specs/github-issues-ui-v2.md`
Workspace: `docs/workspace/github-issues-ui-v2/`

## Goal

Replace the functional settings-style GitHub Issues screens with the approved
Happy-native, Session-first experience. Keep Issue creation separate from Agent
dispatch; when dispatch is requested, target only a matching Session, explicitly
Triage first when the repository requires it, and continue automatically after
the confirmed Agent-ready outcome.

## Guardrails

- Keep `devGithubIssuesEnabled=false` as the default and preserve official Happy
  behavior when disabled.
- Keep normal browser support disabled; do not add browser token storage.
- Do not change the official Happy GitHub profile connection.
- Do not add GitHub permissions, a personal backend, Issue comments/editing,
  Projects, assignees, notifications, or realtime synchronization.
- Do not expose Triage labels, Agent Briefs, Workspace gates, branches,
  worktrees, or validation state in the Issue UI.
- Keep GitHub parsing, repository association, dispatch task construction, and
  error normalization inside the feature Module rather than host call sites.
- Preserve unrelated dirty files and existing Project Todos behavior.

## Dependency order

```text
T1 shared feature contracts
 ├─► T2 repository resolution/picker
 ├─► T3 list redesign
 ├─► T4 detail/lifecycle redesign
 └─► T5 creation/drafts

T2 + T4 + T5 ─► T6 Session dispatch and Triage-first launch
T2..T6       ─► T7 states, accessibility, localization, responsive polish
T1..T7       ─► T8 integration and live acceptance
```

## T1 — Deepen the feature presentation Interface

### Scope

- Define feature-local screen/controller state for connection, selected
  repository, list filters, loading/refresh/error preservation, detail
  mutations, creation drafts, and Session dispatch preparation.
- Keep existing credential, Device Flow, direct GitHub transport, and CRUD
  behavior behind the current GitHub Issues Module Interface.
- Add focused pure helpers for relative metadata, repository-safe target
  comparison, and structured dispatch task construction where stable seams
  exist.

### Allowed files

- `packages/happy-app/sources/features/github-issues/**`
- Feature-focused tests under the same directory

### Dependencies

- None.

### Acceptance

- Screens do not need raw GitHub responses, tokens, installation IDs, Git
  command syntax, or Triage label mappings.
- Existing Device Flow and CRUD contract tests remain valid.
- New state/task helpers are tested through their feature Interface.

### Validation

- Focused Vitest files for GitHub Issues contracts and helpers.
- `pnpm --filter happy-app typecheck`

## T2 — Automatic Session repository resolution and compact picker

### Scope

- Move Session remote detection out of `GithubIssuesButton` into the feature
  Module.
- Resolve a still-valid cached association, then `origin`, then a sole GitHub
  remote; normalize SSH/HTTPS forms and verify GitHub App accessibility.
- Invalidate cached associations when remote evidence changes and isolate cache
  keys by machine/project path.
- Implement the searchable Happy-native repository picker, selected state,
  remembered last repository, and Manage access action.
- Fall back to the picker only for missing, ambiguous, inaccessible, or failed
  detection.

### Allowed files

- `packages/happy-app/sources/features/github-issues/**`
- `packages/happy-app/sources/components/GithubIssuesButton.tsx`
- GitHub Issue local settings/schema tests when needed
- Repository picker UI local to the feature

### Dependencies

- T1.

### Acceptance

- A Session with one accessible GitHub repository opens it without a
  confirmation screen.
- A changed remote cannot reuse a stale cached repository.
- Global entry remembers the last repository.
- Ambiguous/unavailable repositories fail visibly without cross-project reuse.

### Validation

- Repository parsing/resolution/cache unit tests.
- Picker interaction tests.
- Happy app typecheck.

## T3 — Happy-native Issue list

### Scope

- Remove persistent connection and expanded repository groups from normal
  returning use; retain focused blocking states when connection or access is
  missing.
- Add native header create action, compact repository/state toolbar, Open/Closed
  counts, rich Issue cards, stable loading/empty/error states, and pull to
  refresh.
- Show number, two-line title, up to two ordinary labels, relative update time,
  and comment count.
- Preserve existing content when refresh fails.

### Allowed files

- `packages/happy-app/sources/app/(app)/github-issues/index.tsx`
- Feature-local list, toolbar, row, and state UI
- Route/layout options narrowly required for the header
- Feature-focused list tests

### Dependencies

- T1 and the repository selection Interface from T2.

### Acceptance

- Returning users reach Issues without passing account-management UI.
- Phone/tablet/desktop content follows approved width and surface rules.
- Pull requests remain excluded.
- Refresh failure preserves the current list and offers retry.

### Validation

- List/controller component tests for loading, empty, refresh, and errors.
- Existing Issue list transport tests.
- Happy app typecheck.

## T4 — Detail, lifecycle actions, and destructive overflow

### Scope

- Redesign detail around title, state, author, relative update time, ordinary
  labels, comment count, and Markdown body.
- Add `Work on this issue` as the primary task action.
- Move Open on GitHub, Close/Reopen, and eligible permanent delete into the
  approved action hierarchy/overflow.
- Confirm deletion with exact `owner/repository #number` identity and
  irreversible wording.
- Preserve detail data and expose normalized actionable errors on mutation
  failure.

### Allowed files

- `packages/happy-app/sources/app/(app)/github-issues/[number].tsx`
- Feature-local detail/action UI
- Feature-focused detail tests

### Dependencies

- T1.

### Acceptance

- Required metadata and Markdown render without raw payloads or credentials.
- Close/Reopen is available but does not compete visually with Agent dispatch.
- Permanent delete is hidden without capability and precisely confirmed when
  available.
- Successful mutations update cached/list-visible state.

### Validation

- Detail state/action/component tests.
- Close/reopen/delete client tests.
- Happy app typecheck.

## T5 — Native New Issue form and repository-scoped drafts

### Scope

- Add native Cancel/New Issue/Create header actions.
- Inherit and lock the selected repository for the creation attempt.
- Preserve one title/body draft per repository after network, permission, or
  rate-limit failure and after a user-approved exit.
- Prevent duplicate submission.
- After success, present `Done` and `Work on it`; creation alone never starts
  Triage or an Agent.

### Allowed files

- `packages/happy-app/sources/app/(app)/github-issues/new.tsx`
- Feature-local draft/form state
- Route/layout options narrowly required for native header actions
- Feature-focused creation tests

### Dependencies

- T1 and selected-repository behavior from T2.

### Acceptance

- Trimmed title is required and body remains optional.
- Failed creation preserves user input.
- Cancel with content offers keep/discard behavior.
- Successful creation exposes the approved record-or-dispatch choice.

### Validation

- Draft/form/duplicate-submit component tests.
- Existing create client tests.
- Happy app typecheck.

## T6 — Repository-safe Session dispatch with Triage-first continuation

### Scope

- Add the dispatch sheet for the originating/current matching Session, other
  active matching Sessions, and a new Session.
- Exclude Sessions whose resolved repository differs from the Issue repository.
- Append to an existing Session draft without overwriting user text; confirm
  when a draft already exists.
- Preselect project context and prepare the normal New Session flow for new
  targets without bypassing Agent/model/worktree choices.
- Construct an explicit `/triage #<number>` task that requires repository
  Triage, preserves its maintainer checkpoint, and instructs automatic
  continuation through the local development workflow after the confirmed
  Agent-ready outcome.
- For repositories without that workflow, instruct the Agent to follow local
  repository rules without fabricating labels or states.

### Allowed files

- `packages/happy-app/sources/features/github-issues/**`
- Feature-local dispatch sheet/UI
- Existing Session draft and New Session integration seams
- Narrow host integration in Session navigation only
- Feature-focused dispatch tests

### Dependencies

- T2, T4, and T5.

### Acceptance

- Dispatch never targets a known different repository.
- Existing text is never silently overwritten or immediately sent.
- The generated task is an explicit maintainer invocation compatible with
  `disable-model-invocation: true` Triage skills.
- Triage outcomes stop or continue exactly as specified; the Issue UI itself
  exposes none of those internal states.
- A confirmed Agent-ready result continues without a second generic start
  confirmation.

### Validation

- Pure dispatch task and repository-match tests.
- Current-Session draft append tests.
- New-Session draft routing tests.
- Navigation/component tests for every target/no-target state.
- Happy app typecheck.

## T7 — Blocking states, localization, accessibility, and responsive polish

### Scope

- Implement focused disconnected, Device Flow, no-repository, permission,
  offline, not-found, rate-limit, generic retry, loading, and empty states.
- Move persistent account/removal/manage-access presentation to Settings.
- Localize all new user-facing strings.
- Add accessibility labels, roles, selected/disabled states, dynamic text
  behavior, minimum touch targets, and non-color-only feedback.
- Verify centered desktop/tablet width and phone safe-area behavior without a
  new tab or third pane.

### Allowed files

- GitHub Issues routes and feature-local UI
- `packages/happy-app/sources/app/(app)/settings/features.tsx`
- Happy translation catalogs
- Feature-focused accessibility/responsive tests

### Dependencies

- T2 through T6.

### Acceptance

- Every specified state is deterministic and preserves applicable content or
  drafts.
- Connected returning use contains no persistent account-management block.
- Icon-only controls and filters expose accessible names/state.
- Feature-off and regular-browser behavior remain unchanged.

### Validation

- State/accessibility/component tests.
- Translation key validation where available.
- Happy app typecheck.

## T8 — Integration, regression, and live acceptance

### Scope

- Run the complete applicable app test family and repository workflow checks.
- Review the whole diff for feature isolation and narrow host seams.
- Verify official GitHub profile independence, Project Todos behavior, feature
  flag fail-closed behavior, and browser exclusion.
- Build/install Happy dev and complete Windows live acceptance.
- Complete at least one iOS/Android live acceptance when a target is available;
  record unavailable platform evidence as an explicit gap rather than a pass.
- Verify list/detail/create, Close/Reopen, eligible delete, automatic Session
  repository association, current/new Session dispatch, Triage handoff, and
  post-Triage continuation.

### Allowed files

- Tests and workflow evidence required by this feature
- No unrelated product changes

### Dependencies

- T1 through T7.

### Acceptance

- All eleven specification criteria have exact evidence or named accepted gaps.
- Windows build/install/launch and end-to-end Issue flow pass.
- One mobile target passes when available.
- Whole-diff review confirms the feature remains isolated behind its flag and
  Module seam.

### Validation

- `pnpm --filter happy-app typecheck`
- Focused GitHub Issues Vitest suite.
- `pnpm --filter happy-app exec vitest run`
- Applicable commands from `.ai/project.json`.
- Tauri build/install/launch acceptance on Windows.
- Recorded mobile/manual evidence.

## Acceptance coverage

| Spec criterion | Owning tasks |
| --- | --- |
| AC1 returning list without account UI | T2, T3, T7 |
| AC2 Happy-native responsive UI | T3, T4, T5, T7 |
| AC3 rich list and preserved refresh | T1, T3 |
| AC4 repository selection/association | T1, T2 |
| AC5 detail/lifecycle/delete | T1, T4 |
| AC6 creation and drafts | T1, T5 |
| AC7 explicit repository-safe Triage dispatch | T1, T6 |
| AC8 Triage stop/continue behavior | T6 |
| AC9 complete state model | T1, T3, T5, T7 |
| AC10 feature/browser isolation | T1, T7, T8 |
| AC11 desktop/mobile live acceptance | T8 |

## Progress

- `2026-08-10`: approved UI v2 specification decomposed into eight planned
  implementation tasks.
- `2026-08-10`: T1 completed with feature-local controller contracts, preserved
  collection refresh state, relative-time descriptors, repository-safe identity
  comparison, and structured Triage-first Session tasks. Focused GitHub Issues
  tests and Happy app typecheck passed.
- `2026-08-10`: T2 completed with verified Session remote resolution, guarded
  device-local associations, remembered global repository, a searchable compact
  picker, visible fallback reasons, and Manage access. The Session entry now
  delegates Git inspection to the feature Module.
- `2026-08-10`: T3-T7 completed: Happy-native list/detail/create flows,
  repository-scoped drafts, Settings-owned connection management, matching
  Session dispatch, explicit Triage-first tasks, accessibility, responsive
  surfaces, and localized strings are implemented and covered by 70 focused
  tests.
- `2026-08-10`: T8 completed with an accepted mobile toolchain gap. Happy App
  passed 106 files/1052 tests, desktop build/install/launch passed, and the
  installed UI visibly exposed the Issues entry. Android targets were online,
  but Windows CMake/Ninja rejected React Native generated paths longer than 260
  characters before an APK could be produced.
