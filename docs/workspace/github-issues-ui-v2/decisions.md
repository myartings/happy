# Decisions: `github-issues-ui-v2`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Product hierarchy | resolved | Session is primary; Issues are a Session-owned lightweight recording and Agent-dispatch accessory. |
| D2 | Navigation | resolved | The old top-level/sidebar decision is superseded. The Session header opens a Codex-style anchored Issue popover; selecting/creating opens one `Issues` tab in the existing right workspace alongside Side Sessions. Phone uses a Session bottom/full-height sheet. |
| D3 | Repository association | resolved | Automatically resolve an accessible Session GitHub remote; show the picker only for missing, ambiguous, inaccessible, or failed resolution. |
| D4 | Creation behavior | resolved | Creating records an Issue only; `Work on it` is a separate explicit action. |
| D5 | Dispatch targets | resolved | Current/active matching Sessions or a correctly scoped new Session; never a known different repository. |
| D6 | Triage boundary | resolved | Dispatch explicitly invokes repository-required Triage; maintain required maintainer decisions, then continue automatically after the confirmed Agent-ready outcome. |
| D7 | Workflow visibility | resolved | Do not expose Triage labels, Agent Briefs, Workspace gates, branches, worktrees, or verification state in Issue UI. |
| D8 | Infrastructure | resolved | Preserve Device Flow, device-local credentials, direct GitHub transport, feature flag, and official-profile isolation. |
| D9 | Panel multiplicity | resolved | Keep one Issues panel tab per parent Session, not one tab per Issue; selecting another Issue updates that tab's internal stack/history. |
| D10 | Quick versus durable surface | resolved | The popover is browse/select/create-entry only. Detail, lifecycle actions, creation, and dispatch live in the durable Issues panel/sheet. |

## Scoping assessment

Result: `ready`.

- Intensity: Feature. The reimplementation spans one feature Module and narrow
  Session-header, right-workspace panel, Settings, and mobile-sheet seams, with
  cross-platform UI acceptance.
- Contract: approved `docs/specs/github-issues-ui-v2.md` plus the eight-slice
  `docs/tasks/github-issues-ui-v2-tasks.md` plan.
- Decisions: D1-D8 are resolved; no material product decision is open.
- Tracker: local-only contract for this implementation because external Issue
  publication was not requested. The configured tracker target remains
  `myartings/happy` for later explicit use.
- Execution: one implementation owner on branch
  `myartings/github-issues-ui-v2`; no writer subagents or concurrent edits.
  Follow the serial batches in `execution-plan.md`.
- Allowed scope: GitHub Issues feature files/views/tests, narrowly required
  Session/New Session draft integration, Session quick-popover control,
  right-workspace panel registration, feature Settings, local settings, and
  translations named by the task plan.
- Blocked scope: official GitHub profile behavior, server Issue routes,
  credential permissions/storage design, browser support, Session protocol,
  protected native project directories, and unrelated Project Todos behavior.
- Test seams: pure repository resolution/cache/task builders; feature client;
  screen/controller and draft/navigation tests; full Happy app tests; Tauri and
  mobile live acceptance.

## Risk assessment

Result: `cleared-with-controls`.

### Affected systems and reversibility

- GitHub Issues are an external system. Create/close/reopen are externally
  visible; eligible permanent delete is irreversible.
- Session drafts and repository associations are device-local and reversible.
- Device Flow credentials and official Happy GitHub identity remain unchanged.
- UI rollout is reversible by turning off `devGithubIssuesEnabled` or reverting
  the feature branch.

### Failure modes and controls

| Failure mode | Required control |
| --- | --- |
| Wrong repository opens or receives a task | Verify normalized remote against accessible repositories; key cache by machine/project path; fail closed on mismatch/ambiguity. |
| Existing Session draft is overwritten or task is sent unexpectedly | Append only after confirmation when text exists; never auto-send. |
| Issue creation is duplicated | Disable concurrent submission and use the returned Issue as the success source. |
| Agent implementation starts before required Triage | Generate an explicit `/triage` task; preserve the maintainer checkpoint; continue only after the confirmed Agent-ready outcome. |
| Triage labels/state leak into product UI | Keep state interpretation in the repository/Agent workflow; Happy renders no workflow state. |
| Permanent delete targets the wrong Issue | Require `viewerCanDelete`, exact `owner/repository #number` confirmation, and irreversible wording. |
| Auth/offline/rate-limit failure destroys useful state | Preserve list/detail/form content and drafts; expose normalized retry states. |
| Personal feature changes official Happy behavior | Default-off flag, browser exclusion, official-profile regression checks, and narrow host seams. |

### Preconditions and stop conditions

- No new GitHub permission, secret, backend, or Session protocol change is
  allowed under this spec. Stop and record a new decision if one becomes
  necessary.
- Stop if repository equality cannot be proven before dispatch, if draft safety
  cannot be preserved, or if required Triage would be bypassed.
- Stop on any official GitHub profile, Project Todos, feature-off, or regular
  browser regression.
- Require a focused whole-diff review of Session dispatch and destructive action
  paths before live acceptance.
