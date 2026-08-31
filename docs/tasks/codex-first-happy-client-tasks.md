# Codex-first Happy Desktop Tasks

## Status

- Specification: `docs/specs/codex-first-happy-client.md`
- Delivery: packaged Windows application
- Execution: autonomous intermediate slices; one final user acceptance
- Tracker: local workflow only; no external Issue or Pull Request is authorized

## Progress

| Task | Status | Evidence |
| --- | --- | --- |
| T01 | completed | Codex-first runtime/identity/navigation/region/rollback contracts; 65 focused tests and Happy App typecheck pass |
| T02 | completed | `Happy Codex` shell, visible search/inbox, compact truthful destinations, archive/Settings preservation; 20 focused tests and typecheck pass |
| T03 | completed | Project-first compact hierarchy, reversible flat list, local destination/project/Session/path/Machine search, attention badge and input-required promotion; 84 focused/regression tests and typecheck pass |
| T04 | completed | Eight-state actionable home canvas, recent-project continuation, packaged prompt-first New Session rail; 106 focused/regression tests and typecheck pass |
| T05 | completed | Measured 46pt header, ~750pt reading/Composer alignment, neutral/customizable user bubble, global packaged runtime wiring; 108 focused/regression tests and typecheck pass |
| T06 | completed | Global packaged tool grammar, exact-once provider permission/Agent-question lifecycle, disconnected/expired/failed-retry projections; 186 focused/regression tests and typecheck pass |
| T07 | completed | Capability-gated Changes/files/Issues/side-chat family, shared panel/overlay grammar, complete Settings/palette inventory; 205 focused/regression tests and typecheck pass |
| T08 | completed | 720/1100/1470 desktop projections, left-first persistence/right-first collapse, light/dark evidence labels, focus/roles/states, focus return, and reduced motion; 177 deterministic tests and typecheck pass |
| T09 | completed | Final unsigned Windows package `0E89BAA4…C20C` passes exact-worktree build, nine-backup recoverable install, installed/build equality, exact-path launch, broad packaged daily-loop inspection, responsive/appearance evidence, localized UIA, and final-package focus/panel/New Session rechecks; current Codex pixel automation remains a labeled policy limitation |
| T10 | completed | Final configured check is accepted with one named unchanged Server fixture gap; whole-diff/protected-boundary review, AC-001–AC-032 evidence, recovery/limitations, and Windows acceptance handoff are complete without commit, push, signing, publication, release, or destructive rollback execution |

## Dependency order

```text
T01 desktop contract and rollback seam
  -> T02 product shell and destination family
      -> T03 project-first navigation, search, and notifications
      -> T04 empty state and New Session composition
      -> T05 conversation shell and global Studio promotion
          -> T06 tools, approvals, and composer integration
          -> T07 changes, overlays, panels, palette, and settings
              -> T08 responsive and accessibility hardening
                  -> T09 packaged runtime evidence
                      -> T10 whole-feature verification and handoff
```

T03 and T04 may proceed independently after T02. T06 and the non-conversation
parts of T07 may proceed independently after T05's shared presentation contract
is stable. Integration and evidence remain serial.

## Task conventions

- Every task starts with a failing public-interface test when its observable
  behavior is stable enough for TDD.
- Existing Happy behavior and payloads are the compatibility oracle.
- New implementation belongs in explicit feature modules. Existing host files
  receive only narrow composition, routing, or presentation seams.
- No task may modify authentication, authorization, encryption,
  synchronization, Server, Machine RPC, or Session protocol behavior.
- A task that discovers a functional conflict adds a deviation-ledger entry
  before choosing the smallest adaptation.
- Each completed task records commands and evidence in the workflow journal and
  `validation.md`.

## T01 — Establish the packaged-desktop Codex-first contract

**Outcome**

One pure, testable presentation/runtime contract identifies the packaged
desktop surface, makes Codex-first the default there, retains current behavior
elsewhere, and exposes a development-only rollback without data migration.

**Scope**

- Define runtime, appearance, identity, region, destination, and rollback
  projections used by later slices.
- Preserve existing light/dark/adaptive appearance and stored settings parsing.
- Make the old Studio implementation reusable beneath the new global contract;
  do not yet redesign host surfaces.
- Record the feature-module boundary in implementation context.

**Expected files**

- New `packages/happy-app/sources/features/codex-first-shell/**`
- Narrow updates under `features/studio-visual-style/**`
- `packages/happy-app/sources/sync/localSettings.ts` and its tests only if a
  rollback setting is necessary
- Desktop build configuration tests

**Dependencies**: none

**Acceptance coverage**: AC-001, AC-025, AC-027, AC-028, AC-029

**Deterministic validation**

```sh
pnpm --filter happy-app exec vitest run sources/features/codex-first-shell sources/features/studio-visual-style sources/sync/localSettings.test.ts
pnpm --filter happy-app typecheck
```

## T02 — Build the Codex-first product shell and destination family

**Outcome**

The authenticated packaged desktop has a compact `Happy Codex` product header,
correct title-bar safe area, one set of shell controls, the Codex-like region
hierarchy, and truthful Happy global destinations.

**Scope**

- Compose product identity, product/account menu, visible search and
  notification affordances, navigation history, sidebar collapse, and zen mode
  without duplicate controls.
- Replace boxed top controls with a compact destination-row family for New
  Session, enabled Tasks, enabled Issues, Artifacts, and Machines/Agents.
- Preserve Settings, account, connection, restore, usage, developer, and
  sign-out reachability.
- Establish selected, hover, pressed, focused, disabled, badge, and offline
  presentation states.

**Expected files**

- `features/codex-first-shell/**`
- `components/SidebarNavigator.tsx`
- `components/SidebarView.tsx`
- `components/MainView.tsx`
- Small route/layout seams under `sources/app/(app)/**`
- Existing localization files for new accessible labels or copy

**Dependencies**: T01

**Acceptance coverage**: AC-001–AC-004, AC-007, AC-023

**Deterministic validation**

```sh
pnpm --filter happy-app exec vitest run sources/features/codex-first-shell sources/features/studio-visual-style/studioSidebarWiring.test.ts
pnpm --filter happy-app typecheck
```

## T03 — Make project-first navigation, search, and attention coherent

**Outcome**

Projects and compact Session threads are the default desktop mental model;
Happy lifecycle metadata, organization controls, searchable local context, and
attention routing remain complete.

**Scope**

- Default packaged desktop to existing project/workspace grouping while
  retaining the flat chronological preference.
- Project compact title-led Session rows from existing data, showing Machine or
  backend only when needed for truth or disambiguation.
- Preserve selection, project collapse, context actions, archive, pin,
  favorite, unread, running, permission, error, reconnect, and shortcut order.
- Expand command/search results to destinations, projects, Sessions, paths, and
  Machines without remote APIs or query logging.
- Connect the visible notification affordance to existing inbox and Session
  attention semantics.

**Expected files**

- `features/codex-first-shell/**`
- `components/SessionsList.tsx`, `ProjectGroup.tsx`,
  `ActiveSessionsGroupCompact.tsx`, and Session-row components
- `components/CommandPalette/**`
- Existing Session display/grouping and notification utilities

**Dependencies**: T02

**Acceptance coverage**: AC-003, AC-005–AC-009, AC-022

**Deterministic validation**

```sh
pnpm --filter happy-app exec vitest run sources/utils/flatSessionList.test.ts sources/utils/flatSessionListPreferenceWiring.test.ts sources/hooks/useVisibleSessionListViewData.test.ts sources/components/CommandPalette sources/features/codex-first-shell
pnpm --filter happy-app typecheck
```

## T04 — Complete the empty/home and prompt-first New Session flow

**Outcome**

The main canvas is useful before a Session is selected, and new work begins
through a Codex-like prompt-first composition without losing any Happy spawn
capability or failure recovery.

**Scope**

- Distinguish sync loading, no Machine, all offline, reconnecting, no Session,
  archived-only, and recoverable failure states.
- Provide relevant New Session, recent project, Machine, and connection actions.
- Recompose the desktop New Session page around the prompt with compact project
  context and a contextual configuration rail/disclosure.
- Preserve Machine, recent/discovered/manual path, Agent, model, effort,
  permission, worktree, attachment, prompt, draft, and spawn semantics.
- Verify stale discovery rejection, duplicate-start prevention, failure draft
  preservation, and narrow desktop projection.

**Expected files**

- `components/EmptyMainScreen.tsx`, `EmptySessionsTablet.tsx`, `MainView.tsx`
- `sources/app/(app)/new/index.tsx`
- Existing New Session feature/hooks/utilities and their tests
- `features/codex-first-shell/**` for presentation projections

**Dependencies**: T02

**Acceptance coverage**: AC-007, AC-010–AC-013, AC-024

**Deterministic validation**

```sh
pnpm --filter happy-app exec vitest run sources/hooks/useNewSessionDraft.test.ts sources/hooks/useStartSessionFromDraft.test.ts sources/utils/newSessionAgentSelection.test.ts sources/utils/newSessionModeSelection.test.ts sources/utils/newSessionPickerInteraction.test.ts sources/utils/newSessionPickerItems.test.ts sources/utils/newSessionSidebarLayout.test.ts sources/components/newSessionProgress.test.ts sources/features/codex-first-shell
pnpm --filter happy-app typecheck
```

## T05 — Promote the conversation shell and Studio grammar globally

**Outcome**

Every packaged desktop Session uses the Codex-like compact header, centered
conversation rhythm, unboxed assistant prose, compact user bubbles, semantic
text, and floating composer independent of backend or appearance selection.

**Scope**

- Replace optional Studio activation at packaged-desktop host seams with the
  T01 contract while leaving non-Tauri surfaces unchanged.
- Calibrate header, reading measure, message rhythm, overflow escape hatches,
  scrolling, and composer anchoring to the reference evidence.
- Preserve title/folder/runtime truth, navigation, Markdown, selection, links,
  CJK/Unicode, copy, scroll anchoring, long transcript behavior, and mobile/Web
  gates.
- Keep the development rollback functional.

**Expected files**

- `features/studio-conversation-layout/**`
- `features/studio-semantic-text/**`
- `features/studio-composer/**`
- `components/ChatHeaderView.tsx`, `ChatList.tsx`, message views, and
  `AgentInput.tsx` through narrow seams
- `sources/-session/SessionView.tsx`

**Dependencies**: T01, T02

**Acceptance coverage**: AC-002, AC-014, AC-015, AC-018, AC-019, AC-025,
AC-027, AC-029

**Deterministic validation**

```sh
pnpm --filter happy-app exec vitest run sources/features/studio-conversation-layout sources/features/studio-semantic-text sources/features/studio-composer sources/components/ChatListStudioScroll.test.ts sources/components/agentInputLayout.test.ts sources/components/agentInputPrimaryAction.test.ts
pnpm --filter happy-app typecheck
```

## T06 — Integrate tool activity, approvals, and composer states

**Outcome**

The full send-to-result loop has one globally active, truthful Codex-first
presentation for streaming work, tool output, diffs, permissions, Agent
questions, failures, stop, and retry across representative backends.

**Scope**

- Promote existing Studio execution, tool-presentation, and disclosure modules
  through the global packaged-desktop contract.
- Cover terminal/read/search/edit/task/neutral, legacy result, truncation,
  expand/copy, success, failure, running, and completed states.
- Preserve every provider permission and Agent-question payload/action exactly
  once with pending, disabled, resolved, expired, and disconnected projections.
- Verify composer attachments, autocomplete, backend controls, send/stop,
  validation, and focus restoration in combination with tool/approval states.

**Expected files**

- `features/studio-execution-transcript/**`
- `features/studio-tool-presentation/**`
- `features/studio-tool-output-disclosure/**`
- Permission, Agent-question, tool-group, and Composer components/tests
- `features/codex-first-shell/**` integration projections

**Dependencies**: T05

**Acceptance coverage**: AC-015–AC-019

**Deterministic validation**

```sh
pnpm --filter happy-app exec vitest run sources/features/studio-execution-transcript sources/features/studio-tool-presentation sources/features/studio-tool-output-disclosure sources/components/ToolGroupViewStudioPresentation.test.ts sources/features/studio-composer
pnpm --filter happy-app typecheck
```

## T07 — Unify changes, overlays, panels, palette, and Settings

**Outcome**

Daily-loop secondary work uses a consistent Codex-like action, floating-surface,
and side-panel grammar while every Happy route and operation remains truthful
and reachable.

**Scope**

- Establish the visible Changes/files/Issues/side-chat action family and shared
  right-panel header/surface.
- Preserve diffs, file overlays, back/forward, panel selections, side chat,
  GitHub Issues flags/context, and resize state without inventing unsupported PR
  actions.
- Apply one overlay family to product/Session menus, selectors, autocomplete,
  and command/search, including clamping, dismissal, focus return, and
  destructive confirmation.
- Complete Command Palette destinations and search integration.
- Bring daily-use Settings shells into the same desktop grammar and confirm all
  account/system routes remain accessible.

**Expected files**

- `features/studio-overlays/**`, `features/studio-panel-resize/**`
- `components/FilesSidebar.tsx`, Session view/header panel seams, diff/file
  overlays, Session action popover, and `components/CommandPalette/**`
- Desktop Settings route presentation seams
- Existing GitHub Issues presentation modules only where required

**Dependencies**: T03, T05

**Acceptance coverage**: AC-004, AC-020–AC-023

**Deterministic validation**

```sh
pnpm --filter happy-app exec vitest run sources/features/studio-overlays sources/features/studio-panel-resize sources/components/CommandPalette sources/features/github-issues sources/features/codex-first-shell
pnpm --filter happy-app typecheck
```

## T08 — Harden responsive, appearance, keyboard, and accessibility behavior

**Outcome**

The complete shell remains usable from the configured minimum through standard
and wide Windows windows in light, dark, adaptive, keyboard-only, and
reduced-motion operation.

**Scope**

- Define and test deterministic narrow/standard/wide projections and panel
  collapse priority.
- Protect title-bar safe area, reading/composer width, left/right resize bounds,
  sidebar collapse, zen restoration, and overlay clamping.
- Complete visible focus, keyboard ordering, shortcuts, accessibility
  labels/roles/states, non-color state cues, contrast review, and reduced-motion
  behavior.
- Prove standalone Web and mobile gates still resolve their prior presentation.

**Expected files**

- `features/codex-first-shell/**`
- Existing responsive, keyboard, interaction-state, overlay, and panel modules
- Host components only for missing accessibility metadata or focus seams

**Dependencies**: T03, T04, T06, T07

**Acceptance coverage**: AC-003, AC-021, AC-024–AC-029

**Deterministic validation**

```sh
pnpm --filter happy-app exec vitest run sources/features/codex-first-shell sources/features/studio-panel-resize sources/features/studio-overlays sources/features/studio-visual-style sources/keyboard sources/components/CommandPalette
pnpm --filter happy-app typecheck
```

## T09 — Build and verify the packaged Windows candidate

**Outcome**

An installed native Windows development bundle—not the QR-login Web surface—
provides reproducible matched visual, interaction, keyboard/accessibility, and
bounded real daily-loop evidence against the current installed Windows Codex
Desktop reference.

**Scope**

- Capture the exact installed Windows Codex identity and representative
  navigation, home, New Session, conversation, Composer, tools,
  permissions/questions, search, command palette, panels, Settings,
  responsive, light/dark, keyboard, and accessibility states.
- Run focused and full applicable Happy App checks before packaging.
- Build the Windows bundle through the exact worktree-bound
  `devtools/happyctl.ps1 build-desktop` flow.
- Inspect app/MSI/NSIS identity, hashes, version, architecture, unsigned state,
  and launch state.
- Install only through the repository's safe development-client procedure,
  preserving every existing recoverable backup and registry snapshot.
- Capture Codex and Happy at identical logical size, theme, and representative
  state, plus the configured minimum and a wide state. Label any unreachable
  reference state as adaptation or known limitation.
- Smoke the global destinations, search, notification routing, project/Session
  selection, New Session draft/start, conversation send/stop, tool output,
  permission/question fixture or safe existing state, changes/panels, palette,
  Settings, resize, light/dark, keyboard focus/order, and Windows UI Automation
  names/roles/states.
- Complete a bounded real daily-use loop with isolated or non-destructive
  context where practical. Do not answer a real permission request, change
  authentication/account state, alter protocol/sync/Server/Machine RPC/data-
  migration behavior, or execute destructive rollback.
- Reprove installed/build identity, exact-path launch, backup/registry recovery
  inputs, and written rollback instructions after the final build.
- Update the deviation ledger and validation receipts without committing private
  Session content.

**Expected files**

- Workflow evidence only; product changes return to the owning task
- Generated bundles remain ignored under `src-tauri/target/**`
- Private screenshots remain under
  `C:\Users\myartings\Sync\tmp\codex-first-happy-client\`

**Dependencies**: T08

**Acceptance coverage**: AC-002, AC-030–AC-032

**Deterministic validation**

```sh
pnpm --filter happy-app typecheck
pnpm --filter happy-app exec vitest run
pwsh -NoLogo -NoProfile -File devtools/happyctl.ps1 doctor
pwsh -NoLogo -NoProfile -File devtools/happyctl.ps1 build-desktop
pwsh -NoLogo -NoProfile -File devtools/happyctl.ps1 update-desktop -DryRun -KeepBackups 5
pwsh -NoLogo -NoProfile -File devtools/happyctl.ps1 verify-desktop
```

### Historical initial native Windows install slice — 2026-08-30

- Revalidate the exact worktree-bound unsigned NSIS candidate and the existing
  per-user `Happy (dev)` target before any system change.
- Run the update dry-run and actual update with `KeepBackups=4`, preserving the
  three existing backups plus the newly created pre-replacement backup.
- Require the updater's registry snapshot, exact installed/build executable
  hash equality, uninstall-entry validation, and automatic backup/registry
  rollback on failure.
- Run `verify-desktop` only as a bounded launch smoke; it must resolve the
  installed executable at the exact expected path and stop only processes it
  started for verification.
- Do not sign, commit, push, publish, release, replace the official baseline, or
  exercise account/permission/external mutations.

### Current remediated native Windows package slice — 2026-08-30

- Rebuilt the exact four-fix source after the 8-file / 34-test focused family,
  217-file / 1747-test Happy App suite, and App/Server typechecks passed.
- Produced unsigned x64 app/MSI/NSIS artifacts and installed only after an
  exact-target `KeepBackups=5` dry-run planned no backup removal.
- Proved installed/build app SHA-256 equality at
  `CEBB6EBE86F4A2663DECA94F76E050FD7712ECEA358A153F508B243B99C046F1`,
  retained five backups with registry snapshots, and passed exact-path launch.
- Inspected the installed New Session shell at 1682, 1469, 1199, 1099, and
  719 x 479. The right rail collapses into the narrow top stack, the Composer
  stays usable, navigation stays scrollable, and one persistent Header owns
  back/forward controls at every size.
- The naturally present duplicate `agent-skill-registry` contexts exposed
  macOS/Windows Machine identity. No counted attention state was naturally
  present, so no action that could change read state was clicked.
- Stopped only the path-confirmed inspection process and removed the external
  temporary build configuration. Signing, rollback execution, commit, push,
  PR, publication, and release remain outside this receipt. This earlier smoke
  is supporting evidence only; it does not replace the fresh complete Windows
  acceptance required by D11.

### Final owning Windows package acceptance — 2026-08-31

- Whole-diff and live packaged review found two final truthfulness gaps: an
  expanded Changes/Files workspace used the Side Chat-specific collapse name,
  and the packaged Codex-first New Session composer retained an English
  placeholder in the Simplified-Chinese UI. Each behavior first produced a
  focused 1/5 RED, then passed 5/5 after the smallest gated localization fix.
- Happy App typecheck and the complete 220-file / 1761-test suite pass. The
  final exported bundle contains both localization keys/values while preserving
  the exact legacy English placeholder outside Codex-first desktop.
- Exact-worktree doctor/build produced unsigned x64 app/MSI/NSIS SHA-256 values
  `0E89BAA43909EB90882A23F216CBE72E1F9AE4A6EC47B9648D1211FACDCBC20C`,
  `86D3A7DFF6BE023873894A7F946D625A705D84D3C1982EB1A38FA109DC6CC9D6`,
  and `CE489211A2534107C596B9CB1CE2A6C61DACAEE2FD7804DB33AF4823FC4F2E4E`.
- `update-desktop -DryRun -KeepBackups 9` selected only PID `107680` at the
  exact installed path, planned no backup removal, and made no changes. The
  matching update retained all nine backups, installed byte-identical app
  `0E89BAA4…C20C`, and `verify-desktop` launched/stopped only PID `48584` at
  that path.
- The new backup
  `Happy (dev)-windows-20260831-015534` contains predecessor app
  `E248B306…07D1`, `uninstall.exe`, and `uninstall-registry.json`. Manual
  rollback remains documented but deliberately unexecuted.
- Final UI Automation reinspection proved `收起工作区面板`, the New Session
  editor name/description `你想做什么？`, and the click → Escape → Enter
  command-palette focus-return loop. No message, Agent, permission, account,
  Issue, Todo, Artifact, Side Chat, or protected external operation was
  created or changed.

## T10 — Complete whole-feature check, review, and acceptance handoff

**Outcome**

Repository evidence proves the specification, no protected contract drift, and
one installable Windows candidate is ready for the user's single product and
visual acceptance review.

**Scope**

- Trace every AC to a passing test, command, inspection, or runtime artifact.
- Audit all Happy capabilities in the gap matrix and close each deviation entry
  with evidence or an explicit known limitation.
- Review the complete diff for functional regression, privacy leakage,
  cross-platform leakage, accessibility gaps, unsupported Codex claims, and
  upstream-integration risk.
- Run repository workflow checks and strict audit.
- Produce final app path, installed identity, evidence index, deviations, known
  limitations, recovery inputs and rollback procedure, plus an explicit later
  macOS adaptation boundary.
- Treat unchanged out-of-scope native-Windows Server fixture mismatches as a
  named check gap unless separately authorized; do not silently edit protected
  Server code to manufacture a green result.
- Do not commit, push, publish, sign, or release externally without separate
  authorization.

**Expected files**

- `docs/workspace/codex-first-happy-client/validation.md`
- `docs/workspace/codex-first-happy-client/deviation-ledger.md`
- `docs/workspace/codex-first-happy-client/finish.md`
- Workflow state and journal receipts

**Dependencies**: T09

**Acceptance coverage**: AC-001–AC-032

**Deterministic validation**

```sh
python3 scripts/validate-happy-workflow.py
python3 scripts/test-workflow-core.py
python3 scripts/test-workflow-ci.py
python3 scripts/workflow-audit.py --strict --require-active
git diff --check
```

## Blocked questions

None currently block implementation. The exact current Windows Codex build and
runtime state inventory must be captured before claiming observed parity. Any
state that cannot be reached safely remains a labeled grammar adaptation or
known limitation rather than a fabricated parity claim.
