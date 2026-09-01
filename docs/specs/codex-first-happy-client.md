# Codex-first Happy Desktop Specification

## Status

- Product contract: accepted through the decisions recorded in
  `docs/workspace/codex-first-happy-client/decisions.md`
- Delivery target: packaged Happy Desktop on Windows
- Product posture: a clearly customized Codex client, with Happy as the
  customization and capability layer
- Reference build: the currently installed native Windows Codex Desktop;
  exact build identity and usable runtime geometry must be refreshed in the
  dated evidence listed in `reference-evidence.md` before final comparison
- Supersedes: the optional-theme and preserve-existing-macro-layout boundaries
  in `docs/specs/codex-visual-theme.md`

## Intent

Make the authenticated packaged Windows application use Codex Desktop's product
shell, information hierarchy, conversation rhythm, and interaction grammar as
its default experience across every supported Agent backend. The result must
read as a customized Codex client before it reads as the former Happy client.

Happy remains the functional authority. A reference match is invalid if it
removes, hides, mislabels, or materially weakens a Happy capability. Happy-only
features must use the closest truthful Codex pattern, and every necessary
departure must remain traceable in the deviation ledger.

## Feature boundary

This contract covers the complete authenticated daily coding loop in the
packaged Windows application:

1. orient in the product shell;
2. find a project, Session, notification, or global destination;
3. start new work with the correct Machine, project, Agent, model, effort,
   permission mode, worktree, attachments, and initial prompt;
4. resume a Session and read or select its history;
5. send, stream, stop, and retry work;
6. inspect tool activity, command output, file changes, failures, and diffs;
7. answer permission or Agent questions without losing available decisions;
8. open and close contextual overlays and workspace panels;
9. reach daily-use settings and Happy extensions;
10. recover from offline, reconnecting, unavailable, loading, empty, and error
    states.

The shell applies to Codex, Claude, and any other supported backend. Provider
identity appears where it changes runtime truth or available controls, not as a
separate product shell.

## Non-goals

- Changing authentication, authorization, encryption, synchronization, Server,
  daemon, Machine RPC, or Session protocols.
- Removing provider-specific controls or manufacturing Codex-only controls for
  a backend that does not support them.
- Reproducing Codex account, billing, cloud administration, team management, or
  other low-frequency peripheral surfaces.
- Implementing Pull Requests, Sites, Scheduled tasks, or Plugins under Codex
  names when Happy does not provide those operations.
- Changing the packaged Linux, standalone Web, iOS, or Android product shell in
  the Windows delivery.
- Copying OpenAI artwork, private content, screenshots, source, or proprietary
  assets into Happy.
- Public distribution, signing, store submission, official-baseline
  replacement, or macOS acceptance.
- Claiming pixel, animation, or interaction parity for a reference state that
  was not captured.

## Evidence and fidelity contract

### Evidence precedence

1. A matched current-runtime observation controls when available.
2. The dated usable Codex runtime baseline controls visible shell structure and
   geometry where current capture is blocked.
3. Current official OpenAI documentation establishes capability and workflow,
   but not unobserved geometry or timing.
4. Existing Happy behavior establishes the capabilities and data that must be
   preserved.
5. Unobserved details are Happy adaptations and must be labeled as such.

Historical macOS captures may inform shared grammar but cannot substantiate a
Windows-native parity claim. Final Windows claims require fresh native Windows
Codex evidence or an explicit adaptation/limitation label.

### Fidelity levels

- **Observed parity**: the reference state is captured and Happy can be compared
  at the same logical window size.
- **Behavioral parity**: the behavior is documented or deterministically
  observed, and the Happy transition can be tested.
- **Grammar adaptation**: Codex lacks the Happy feature or reference evidence is
  unavailable; Happy uses the closest established component and interaction
  family.

The final report must never upgrade a grammar adaptation to observed parity.

## Product identity and shell

### Identity

- The persistent authenticated desktop shell must visibly communicate both
  `Happy` and `Codex`. The default product label is `Happy Codex` unless a
  later legal or product constraint requires another equally explicit label.
- The identity must not imply that Happy-only backends or features are official
  OpenAI surfaces.
- Product identity, global search, and notifications belong to one compact
  sidebar header below the Windows title-bar/non-client safe region.
- Back, forward, sidebar-collapse, and zen controls must have one owner each;
  the new shell must not duplicate native or existing overlay controls.

### Persistent regions

At a standard desktop width, the resting shell contains:

1. a persistent resizable left navigation region, targeting the observed
   275-point Codex width;
2. a quiet main canvas;
3. an optional resizable right workspace panel;
4. native Windows title-bar/non-client behavior without content underlap.

Persistent regions are separated by background or a single structural
hairline. Ordinary navigation and transcript content must not be presented as
nested decorative cards.

### Global destinations

The sidebar must expose a compact destination family above the project tree:

- New Session;
- Tasks when Project Todos are enabled;
- Issues when GitHub Issues are enabled and supported;
- Artifacts;
- Machines/Agents.

Labels must remain truthful to Happy. Missing or disabled features must not be
renamed to Codex features. Low-frequency account, connection, usage, developer,
and appearance destinations remain reachable from product/account menus or
Settings.

The selected destination uses the same restrained row grammar as a selected
project or Session. Navigating between destinations must preserve ordinary
router history and must not discard an unsent Session draft without the
existing confirmation behavior.

## Search, notifications, and command access

### Search

- A visible search affordance and the existing primary keyboard shortcut open
  one command/search surface.
- With no query it lists daily-use commands and recent Sessions.
- A query matches command titles, destination titles, Session names, project
  names, working-directory paths, and Machine names already present in local
  state.
- Results are grouped by kind, keyboard navigable, and activate exactly one
  existing route or action.
- Search is local and must not introduce a server API, persist queries, or log
  private Session titles or paths.
- Empty and no-match states remain actionable; Escape or outside dismissal
  returns focus to the invoking control.

### Notifications

- A visible notification/inbox affordance reflects unread or attention-worthy
  Happy state using existing Session attention, permission, error, and inbox
  data.
- It opens a truthful notification destination or overlay; it must not imply a
  cloud inbox that Happy does not have.
- Selecting an item opens the affected Session or existing inbox item and uses
  current read/attention semantics.
- The badge must distinguish zero from nonzero attention without animating
  indefinitely or replacing permission/error status.

## Project and Session navigation

### Default organization

- Project-first grouping is the packaged desktop default.
- Each expanded project contains compact, title-led Session rows.
- Project identity uses existing project/workspace grouping data. Machine name
  is shown in the resting hierarchy only when needed for collision,
  connectivity, or remote-context truth.
- Session rows retain current running, idle, permission, unread, error,
  archived, pinned, favorite, backend, branch, worktree, path, and Machine data.
  Resting rows show only the fields needed to identify or disambiguate the
  Session; the rest remains available in contextual detail.
- The selected row, keyboard focus, unread state, runtime activity, and error or
  permission state must remain distinguishable without turning every row into a
  status dashboard.

### Organization controls

- Project expand/collapse, Session selection, context menu, archive/unarchive,
  pin/unpin, favorite/unfavorite, and archive visibility retain their current
  behavior.
- The existing flat chronological view remains available as an explicit user
  preference or list option, but is not the first-run packaged desktop default.
- Changing list organization must not change Session data, Session shortcuts,
  current selection, or deep links.
- An empty project, no Sessions, archived-only account, unavailable Machine,
  reconnecting client, and filtered no-match state each receive distinct copy
  and a relevant next action.

## Empty and home states

- An authenticated account with no selected Session must never show an
  unexplained blank main canvas.
- When at least one Machine is online, the primary empty-state action starts a
  new Session and may offer recent projects.
- When Machines exist but none is online, the state explains connectivity and
  preserves navigation to Machine detail, connection help, and existing manual
  options.
- When no Machine exists, the state exposes the current connection flow.
- Sync loading and recoverable sync failure must be different from a confirmed
  empty account; stale locally available Sessions remain navigable.

## New Session flow

### Composition

- The desktop flow is prompt-first: the initial prompt and attachments occupy
  the visual center, with compact project context and a contextual
  configuration rail or disclosure surface.
- The existing spawn contract remains complete: Machine, working directory,
  recent and discovered projects, manual path, Agent, model, effort, permission
  mode, worktree mode, attachments, and prompt.
- Backend-specific controls are shown only when supported. Defaults remain
  inspectable before launch and the resulting request remains identical to the
  pre-convergence request for the same selections.

### States and transitions

The flow must represent:

```text
unconfigured
  -> selecting machine/project
  -> ready
  -> starting
  -> opened Session

selecting machine/project
  -> loading discovery
  -> ready | non-blocking discovery error

starting
  -> opened Session | recoverable start failure
```

- Machine changes invalidate stale project-discovery results.
- Offline selection, missing paths, unsupported discovery, and discovery
  failures retain recent paths and manual entry.
- While starting, duplicate submission is prevented and the user can still
  identify the requested project and backend.
- A failed start preserves the draft and every selection needed for retry.
- Unsaved-draft navigation continues to use the existing discard/keep contract.

## Conversation workspace

### Header and reading column

- The main header is compact and title-led. It exposes project/folder context,
  a truncated Session title, truthful connection/runtime state when relevant,
  and quiet trailing actions for workspace panels and Session detail.
- Standard-width prose uses a centered Codex-like reading measure. Assistant
  prose is unboxed; user messages use a compact right-aligned neutral surface.
- Code, terminal output, tables, and diffs may exceed the prose measure within
  deterministic bounds and must remain horizontally usable.
- Text selection, copy, links, Markdown, CJK, Unicode, wrapping, and scroll
  anchoring retain their existing behavior.

### Runtime lifecycle

The workspace must visibly distinguish:

```text
loading history
  -> ready

ready
  -> sending
  -> streaming/tool activity
  -> waiting for permission or Agent answer
  -> streaming/tool activity
  -> completed | failed | disconnected

streaming/tool activity
  -> stopping
  -> stopped | completed
```

- Existing streaming reconciliation, optimistic user messages, stop behavior,
  retry affordances, unread state, and reconnect recovery remain authoritative.
- Status is shown once at the most relevant layer. The shell, row, transcript,
  and composer must not emit contradictory states.
- A failed or disconnected state retains visible completed history and an
  actionable recovery path.

### Tool activity and output

- Existing structured Studio presentations for terminal, read/search, edit,
  task, neutral, running, completed, and failure activity become the default
  packaged desktop presentation rather than an optional appearance.
- Commands, arguments, working directories, bounded output, exit status,
  duration, edit identity, and diff counts remain truthful to available data.
- Collapsed summaries, expand/collapse, full transcript, copy, long-line,
  truncation, failure, and legacy-no-result states remain operable.
- Ordinary assistant prose must not inherit semantic command, terminal, status,
  or diff color.

### Permissions and Agent questions

- Every decision currently supported by a provider remains available with its
  original payload semantics, including one-time, Session-scoped, edit,
  deny/reject, or bypass choices where supported.
- The most common safe action may be visually primary, but destructive or broad
  authorization must not be promoted merely to match reference order.
- Pending, submitting, accepted, denied, expired, disconnected, and already
  resolved states are distinct and prevent duplicate submission.
- Keyboard focus enters the decision surface predictably and returns to the
  composer or previous control after resolution.

### Composer

- The existing Studio floating composer becomes the default packaged desktop
  contract.
- It retains multiline input, selection, paste, attachments, mentions and
  autocomplete, Agent/model/effort/permission controls, send, stop, disabled,
  reconnecting, and pending-permission states.
- The lower control row uses compact labels and ordering based on the Codex
  grammar while retaining only controls truthful for the selected backend.
- Send never becomes available when the current Happy spawn/message contract
  considers the draft invalid. Stop never silently sends a second message.
- Focus is retained after send where current conversation behavior permits; an
  overlay or autocomplete dismissal restores input focus.

## Changes, review, overlays, and panels

### Changes and review

- File edits and diffs use one visible `Changes` action family in the transcript
  and header/panel controls.
- Existing unified diff, all-files diff, file overlay, back/forward navigation,
  source actions, and review-related affordances remain reachable.
- Happy must not display Pull Request, comment, undo, or editor actions unless
  the corresponding operation is implemented and truthful.

### Contextual overlays

- Product menus, Session actions, selectors, autocomplete, search, and other
  nonblocking overlays use one desktop floating-surface family.
- They clamp to the visible window, avoid title-bar and composer occlusion,
  support keyboard selection, dismiss with Escape and appropriate outside
  interaction, and restore focus to their invoker.
- Nonblocking overlays do not dim the entire window. Destructive actions retain
  confirmation and semantic styling.

### Right workspace panels

- Files, changes/diffs, GitHub Issues, and side chat use one panel shell and one
  compact header/action grammar.
- Existing per-panel selection, navigation, and resize state remain intact.
- Opening one panel must not silently discard another panel's persisted
  selection.
- At constrained widths, panel projection protects a usable transcript and
  composer before preserving simultaneous left and right panels.

## Settings and account access

- Daily-use settings for Agents/Machines, permissions/defaults, appearance,
  language, voice where enabled, connections, and feature availability remain
  reachable through the product/account menu or Settings.
- Settings pages in packaged desktop use the same canvas, header, list,
  selection, control, overlay, and focus grammar as the main shell.
- Account, usage, connection, developer, restore, sign-out, and destructive
  actions remain available at their current authorization and confirmation
  boundaries even when they are not primary navigation rows.
- Appearance may retain light, dark, and adaptive selection. `Studio` must no
  longer be presented as an optional product identity required to obtain the
  Codex-first packaged desktop shell.

## Responsive desktop behavior

The supported Windows window range begins at the configured 720 x 480 logical
minimum. Verification must cover narrow, standard, and wide states, including
the exact standard comparison size recorded for current Codex and Happy.

- Standard and wide states keep the project sidebar visible by default.
- The left panel remains user resizable within current safe bounds and starts
  near the observed 275-point reference width.
- A visible right panel may resize within current safe bounds.
- When the window cannot fit all regions, the right panel collapses or overlays
  before the main reading/composer region becomes unusable; the left sidebar
  may then collapse through its explicit control.
- No state may create unreachable controls, content beneath Windows title-bar
  or non-client controls, a zero-width reading column, or a composer clipped
  outside the viewport.
- Zen mode remains available and reversible without losing panel widths or
  Session selection.

## Appearance, accessibility, and platform conventions

- Light mode is compared directly with available Codex evidence.
- Dark mode is a Happy grammar adaptation until equivalent Codex runtime
  evidence exists; it must remain internally coherent and accessible.
- Adaptive appearance tracks the existing platform behavior.
- Keyboard navigation, visible focus, screen-reader labels/roles/states, text
  selection, contrast, reduced motion, and Windows input conventions are hard
  constraints.
- Hover, pressed, selected, focused, disabled, loading, error, permission, and
  destructive states must not rely on color alone where that would obscure
  meaning.
- New user-facing copy uses the existing localization system. Product names are
  not translated.

## Compatibility and rollback

- Existing local and synced settings parse without migration failure.
- Existing authenticated accounts, Sessions, drafts, panel widths, visual
  appearance, archive preference, shortcuts, deep links, and navigation history
  remain usable.
- No message, tool, permission, Session, Machine, or Server schema changes are
  required by this feature.
- Packaged Linux, standalone Web, iOS, and Android continue to resolve their
  current shell and appearance.
- During Windows convergence, a development-only bounded rollback may restore the
  prior packaged desktop presentation without data migration. It is not a
  second end-user product mode and may be removed only after final acceptance.
  Recovery inputs, artifact identity, and instructions must be verified;
  destructive rollback execution requires separate authorization.
- Source changes remain concentrated in explicit Codex-first/Studio feature
  modules with small host seams so upstream merges remain reviewable.

The risk gate is **cleared with controls** only for this client-presentation
boundary. The authoritative controls and stop conditions are recorded in
`docs/workspace/codex-first-happy-client/risk-assessment.md`.

## Error and edge-state requirements

The implementation and evidence fixtures must include at least:

- no Machines; all Machines offline; reconnecting; stale local Sessions;
- no Sessions; archived-only Sessions; duplicate project names across Machines;
- no search results; long titles and paths; CJK and Unicode titles;
- New Session discovery loading, unsupported, truncated, failed, and stale;
- start failure with preserved draft; duplicate-start prevention;
- history loading, empty history, long transcript, streaming, stopping,
  disconnected, recovered, and failed message;
- terminal success, nonzero exit, no output, long output, truncated output, and
  legacy missing result metadata;
- file edit with one and multiple diffs;
- pending, submitting, accepted, denied, expired, and disconnected permissions;
- attachment success, failure, removal, and send-disabled state;
- left/right resize bounds, both panels requested at narrow width, collapsed
  sidebar, and zen-mode restoration;
- light, dark, keyboard-only, and reduced-motion operation.

## Windows owning acceptance and later platform adaptation

- Packaged Tauri Windows resolves the Codex-first presentation contract and is
  the owning complete acceptance platform. Packaged Linux and every non-Tauri
  standalone client retain the legacy Happy presentation path.
- Native Windows reference capture, package, recoverable per-user development-
  client install, bounded daily-use loop, accessibility/keyboard inspection,
  responsive and appearance evidence, and rollback documentation collectively
  satisfy this delivery when every criterion below is closed.
- When accepted source changes after a Windows install receipt, the previous
  candidate becomes historical evidence. A replacement must be rebuilt from
  the exact owning worktree and tied to fresh artifact and installed hashes.
- Ordinary reversible daily-loop actions through existing client behavior are
  allowed with isolated or non-destructive context where practical. Changes to
  authentication, authorization/permission payloads, sync, Server, Machine RPC,
  Session protocols, or data migration remain outside the cleared boundary.
- Windows signing, public distribution, release, official-baseline replacement,
  and destructive rollback execution remain outside scope.
- macOS native adaptation and acceptance occur later. Windows evidence must not
  be relabeled as macOS-native evidence.

## Acceptance criteria

### Shell and identity

- **AC-001**: An authenticated Windows package opens into one global Codex-first
  shell labeled as a Happy customization of Codex, independent of Agent
  backend and without requiring a Studio selector.
- **AC-002**: At the freshly recorded identical Windows logical comparison
  size, theme, and representative state, matched Codex/Happy evidence shows
  the observed Codex region hierarchy: compact product header, compact global
  destination family, project/thread navigation, quiet main canvas, compact
  conversation header, centered reading column, and floating composer.
- **AC-003**: Search and notifications are visible in the shell and work with
  mouse and keyboard.
- **AC-004**: New Session, enabled Tasks, enabled Issues, Artifacts, and
  Machines/Agents are reachable from the primary shell; Settings, account,
  connection, restore, usage, and sign-out remain reachable.

### Navigation and lifecycle

- **AC-005**: Project-first grouping is the packaged desktop default, with flat
  chronological organization still selectable and reversible.
- **AC-006**: All existing Session organization and lifecycle semantics remain
  correct: selection, running, unread, permission, failure, reconnect, archive,
  pin, favorite, and shortcut order.
- **AC-007**: Empty, loading, offline, reconnecting, archived-only, and no-match
  shell states are distinct and actionable; no authenticated main route renders
  an unexplained blank canvas.
- **AC-008**: Search matches local commands, destinations, Sessions, projects,
  paths, and Machines without introducing remote search or private query logs.
- **AC-009**: The notification surface opens the correct existing Session or
  inbox target and preserves current attention/read semantics.

### New Session

- **AC-010**: The prompt-first New Session composition preserves every current
  Machine, path/discovery, Agent, model, effort, permission, worktree,
  attachment, and prompt option.
- **AC-011**: Equivalent selections produce an equivalent existing spawn
  request for each representative backend.
- **AC-012**: Machine changes reject stale discovery results; discovery errors
  retain recents and manual path entry.
- **AC-013**: Starting prevents duplicate submission; failure preserves the
  complete draft; success opens the created Session.

### Conversation

- **AC-014**: The header, transcript, user/assistant messages, tool surfaces,
  and composer use the global Codex-first desktop presentation for Codex and
  non-Codex Sessions.
- **AC-015**: Sending, streaming, stopping, completion, failure, disconnect,
  reconnect, optimistic messages, scroll anchoring, and retry remain correct.
- **AC-016**: Terminal, search/read, edit, task, and neutral tool activity retain
  truthful metadata and distinct running, success, failure, truncation,
  disclosure, copy, and legacy-result states.
- **AC-017**: All provider-supported permission and Agent-question choices emit
  their existing payloads exactly once and expose pending, disabled, resolved,
  and disconnected states.
- **AC-018**: The composer retains multiline input, attachments, mentions,
  autocomplete, backend-specific controls, send/stop, focus restoration, and
  validation behavior.
- **AC-019**: Markdown, links, code, tables, terminal output, diffs, CJK,
  Unicode, selection, copy, wrapping, and long-line handling do not regress.

### Panels, commands, and settings

- **AC-020**: Changes/diffs, files, Issues, and side chat remain reachable
  through one quiet action and panel grammar without claiming unsupported Codex
  operations.
- **AC-021**: Overlay placement, keyboard selection, Escape/outside dismissal,
  focus return, and destructive confirmation pass for each overlay family used
  in the daily loop.
- **AC-022**: The command palette contains every primary daily-loop destination,
  recent Sessions, project/Session search, current shortcuts, and existing
  account/system actions.
- **AC-023**: Daily-use Settings and all pre-existing account/connection/system
  routes remain discoverable and preserve current authorization boundaries.

### Responsive, accessible, and compatible delivery

- **AC-024**: Narrow, standard, and wide fixtures keep navigation, transcript,
  composer, and requested panels usable with deterministic collapse and resize
  behavior.
- **AC-025**: Light, dark, and adaptive appearance work; dark is reported as a
  Happy adaptation unless new reference evidence is captured.
- **AC-026**: Keyboard-only use, visible focus, accessibility roles/names/states,
  readable contrast, text selection, and reduced motion pass focused checks.
- **AC-027**: Packaged Linux, standalone Web, iOS, and Android retain their
  current presentation path; packaged Windows resolves the Codex-first shell
  for this owning delivery. Existing packaged-macOS eligibility remains in
  source, but native macOS adaptation and acceptance are deferred.
- **AC-028**: Existing settings and user data require no destructive migration;
  authentication, authorization, encryption, synchronization, Server, Machine,
  and Session protocols are unchanged.
- **AC-029**: A development-only rollback restores the prior packaged desktop
  presentation without data migration during convergence.
- **AC-030**: Every retained Happy-specific adaptation is present in the
  deviation ledger with passing verification evidence.
- **AC-031**: Happy App typecheck, focused tests, applicable full tests,
  repository workflow checks, Windows bundle build, artifact identity and
  unsigned/signing-state inspection, installed-app launch, and bounded real
  daily-loop checks pass.
- **AC-032**: Final delivery contains the installable Windows app, matched
  reference/target evidence, narrow/standard/wide evidence, light/dark evidence,
  deviation closure, known limitations, and rollback instructions for one user
  acceptance review. macOS adaptation is explicitly deferred and is not a
  prerequisite for this Windows acceptance.

## Verification map

| Criteria | Planned proof |
| --- | --- |
| AC-001–AC-004 | Shell projection/unit tests, component interaction tests, route-reachability inventory, packaged app capture |
| AC-005–AC-009 | Session grouping/order tests, lifecycle fixtures, search projection tests, notification navigation tests, packaged shell smoke |
| AC-010–AC-013 | New Session state/projection tests, existing spawn-request assertions, discovery stale/error tests, packaged start-flow smoke |
| AC-014–AC-019 | Existing Studio and conversation suites promoted to global-desktop cases, provider matrices, transcript fixtures, authenticated packaged Session smoke |
| AC-020–AC-023 | Panel projection/resize tests, overlay tests, palette result/action tests, route inventory and Settings smoke |
| AC-024 | Pure responsive projection tests plus Windows captures at 720 x 480, the matched standard comparison size, and a wide state |
| AC-025–AC-026 | Appearance projection tests, matched light/dark captures where reference states exist, keyboard/focus assertions, Windows UI Automation accessibility inspection, reduced-motion fixture |
| AC-027–AC-029 | Runtime-gating tests, non-Tauri regression tests, settings parse tests, protected-path diff audit, rollback smoke |
| AC-030 | `deviation-ledger.md` mapped to receipts in `validation.md` |
| AC-031 | focused Vitest commands; `pnpm --filter happy-app typecheck`; applicable full Happy App tests; workflow checks; `devtools/happyctl.ps1 build-desktop`; artifact/hash/signing-state and installed launch inspection; bounded real daily-loop receipt |
| AC-032 | final evidence index and one packaged-client acceptance handoff |

## Accepted uncertainty

- The current native Windows Codex Appx identity is captured, but its executable
  manifests as policy-prohibited `ChatGPT.exe`; automated same-state reference
  pixels therefore remain unavailable. Historical macOS reference evidence is
  context only and is not relabeled as Windows parity proof.
- Any current Codex search, notification, command-palette, permission, settings,
  dark-mode, resize, hover, focus, or motion state that cannot be safely reached
  must remain an explicit Happy grammar adaptation or known limitation.
- The exact final product copy may change if a concrete legal or product naming
  constraint is discovered. Any replacement must still make both Happy
  customization and Codex-first intent explicit.
- macOS-native chrome, platform adaptation, and acceptance are deliberately
  deferred until after the Windows Goal; Windows evidence does not prove them.
