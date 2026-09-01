# Happy Product Requirements

## Codex-first Happy Desktop

### Problem

Happy Desktop already contains a substantial optional Studio presentation that
borrows visual ideas from Codex and OTTY while preserving Happy's existing
layout and interaction model. That product boundary no longer matches the
desired outcome. The desktop client should feel like a customized Codex client,
not like the existing Happy client wearing a Codex-inspired theme.

The challenge is to make current Codex Desktop the default UI and interaction
baseline without removing, hiding, or weakening the remote-agent, multi-backend,
cross-device, session-management, and operational capabilities that distinguish
Happy.

### Users

- People who want the familiar Windows Codex Desktop mental model and interaction
  quality while retaining Happy's additional capabilities.
- Existing Happy users who rely on its complete Session, Machine, Agent,
  permission, tool, diff, side-panel, and remote-control workflows.
- Users of non-Codex Agent backends who should receive the same coherent
  Codex-first desktop shell rather than a provider-specific product surface.

### Desired outcome

Happy Desktop becomes a globally Codex-first, customized Codex client. Across
all supported Agent backends, the currently installed native Windows Codex
Desktop application is the owning reference for information architecture,
layout, visual hierarchy, component behavior, interaction state, keyboard flow,
and feedback. Happy's functionality remains complete and is integrated as a
native-looking extension of that baseline.

When exact Codex parity would remove, obscure, or degrade a Happy capability,
the implementation uses the smallest necessary deviation and records the
functional reason, the reference behavior, the chosen adaptation, and its
verification evidence.

### Product requirements

1. The packaged desktop application uses one global Codex-first shell for all
   Agent backends and Session types; the experience is not restricted to Codex
   Sessions and is not presented as an optional visual theme.
2. The currently installed Windows Codex Desktop application is the primary
   runtime reference. Dated screenshots, recordings, measurements, and state
   traces must identify the exact observed build and environment when possible.
3. The Windows acceptance candidate covers the complete daily-use loop: project and
   Session navigation, starting and resuming work, conversation history,
   composer behavior, attachments and mentions, model/mode/permission controls,
   streaming activity, tool execution and output, approvals, diffs, command
   palette, contextual overlays, side panels, settings needed by that loop, and
   representative empty, loading, active, success, failure, and disabled states.
4. Codex is the default baseline for macro layout and information architecture,
   not merely for colors or component styling.
5. Codex is the default baseline for interaction ordering, state transitions,
   keyboard behavior, focus handling, disclosure, dismissal, selection, resize,
   and feedback timing wherever the platform permits faithful observation and
   implementation.
6. Happy's existing functionality remains discoverable, understandable, and
   operable. A visual or interaction match is not acceptable if it removes,
   hides, misrepresents, or materially degrades a Happy capability.
7. Happy-only capabilities use the closest applicable Codex interaction and
   component grammar before introducing a new pattern.
8. Every intentional difference from observed Codex behavior is maintained in
   a deviation ledger with its affected Happy capability, evidence, rationale,
   minimal adaptation, and verification method.
9. Visual acceptance uses matched Codex and Happy evidence across representative
   window widths and all required daily-loop states. A single fixed-size
   screenshot is not sufficient evidence for responsive behavior.
10. The client preserves usable keyboard navigation, focus visibility, text
    selection, reduced-motion behavior, readable contrast, and platform input
    conventions while converging on the Codex reference.
11. Development retains a bounded rollback path to the pre-convergence desktop
    presentation until the complete Windows result passes final acceptance.
    Recovery inputs and instructions must be proven; destructive rollback
    execution still requires separate authorization.
12. Intermediate milestones are verified automatically and recorded durably,
    but do not require user visual approval. The user performs one visual and
    product acceptance review after the complete Windows scope is delivered.
13. A material conflict between Codex parity and Happy functionality must stop
    autonomous implementation only when repository evidence cannot establish a
    safe minimal adaptation.
14. Packaged Windows is the owning acceptance platform for this delivery.
    Packaged Linux and standalone Web, iOS, and Android retain the legacy Happy
    presentation path. macOS native adaptation and acceptance follow later and
    must not reuse Windows evidence as proof of native macOS behavior.
15. Final comparison evidence captures current Windows Codex and packaged Happy
    at the same logical window size, theme, and representative state. It covers
    navigation, home, New Session, conversation, Composer, tools,
    permissions/questions, search, command palette, panels, Settings,
    responsive states, light/dark appearance, and keyboard/accessibility.
16. A bounded real daily-use loop may use ordinary reversible in-client actions
    through existing product behavior, preferably with isolated or disposable
    local context. It must not change authentication, authorization or permission
    payloads, synchronization/Server/Machine RPC/Session protocols, or data
    migration behavior.

### Observable success

- A user completing the daily coding loop perceives the product as a customized
  Codex client through its structure and behavior, without needing a Studio
  toggle or provider-specific Session.
- Matched evidence shows high-fidelity structure, hierarchy, components, and
  interaction states for every required Windows daily-loop surface.
- A feature inventory demonstrates that existing Happy capabilities remain
  reachable and functional, and each necessary difference from Codex has an
  accepted evidence-backed entry in the deviation ledger.
- The same Codex-first shell works for Codex and non-Codex Agent backends while
  preserving truthful provider-specific controls and runtime state.
- Representative narrow, standard, and wide desktop widths remain usable and
  preserve the observed responsive intent.
- Focused tests, the Happy App typecheck and applicable test suite, packaged
  Windows build, repository workflow checks, and a final installed-client smoke
  test pass.
- The final delivery includes an installable Windows client, reference/target
  comparison evidence, the deviation ledger, verification receipts, known
  limitations, and a rollback description for one user acceptance review.
- A reproducible bounded daily-use loop proves that preserved Happy Machine,
  multi-Agent, cross-device, Session, Tasks, Issues, Artifacts, Side Chat,
  files, changes, permissions, settings, and remote-control entry points remain
  reachable or are truthfully gated by their existing availability.

### Scope

- Packaged Happy Desktop on Windows as the complete current acceptance target.
- Global desktop shell and complete daily-use coding loop across Agent backends.
- Fresh Codex runtime evidence, Happy baseline evidence, a state-and-interaction
  matrix, and traceable visual-system measurements.
- Reuse or replacement of existing Studio modules according to the new
  Codex-first contract rather than their former optional-theme boundary.
- Feature-preserving adaptations for Happy-only capabilities.
- Native Windows Codex/Happy matched evidence and safe installed-client
  acceptance. macOS adaptation is a later, separate platform follow-up.

### Non-goals

- Removing Happy functionality to achieve superficial visual similarity.
- Making packaged Linux, iOS, Android, or standalone Web Codex-first in this
  Windows delivery.
- Reproducing account, billing, cloud-administration, or other low-frequency
  peripheral Codex surfaces outside the defined daily-use loop.
- Copying private Session content, Codex/OpenAI proprietary assets, or reference
  screenshots into tracked product source.
- Changing Session, encryption, authentication, authorization, sync, or server
  protocols solely to imitate a client-side reference.
- Public distribution, signing, store submission, notarization, official-
  baseline replacement, or macOS acceptance as part of this Windows delivery.

### Constraints

- Private reference evidence remains outside tracked source; committed records
  contain only non-sensitive observations, hashes, measurements, and paths.
- Product changes should remain in explicit feature modules with narrow host
  seams so upstream integration remains reviewable.
- Existing protocol, security, persistence, and cross-device behavior remain
  authoritative unless a separate risk-gated contract explicitly changes them.
- Autonomous execution may pause for missing authority, destructive external
  actions, or an evidence-backed product conflict; ordinary intermediate visual
  choices are resolved from the reference and verified without user review.

### Accepted product decisions

- Codex UI, information architecture, and interaction behavior are the default
  product baseline; Happy functionality is the hard preservation constraint.
- Codex-first applies globally across Happy Desktop Agent backends.
- Windows is the complete current acceptance target; macOS adaptation follows
  later and requires its own native evidence.
- The Windows acceptance candidate covers the complete daily-use loop rather than every
  peripheral Codex surface.
- The Goal advances through intermediate milestones autonomously and requests
  one user acceptance review only after the complete Windows result is ready.
## Non-UI Session Transport Reliability

### Problem

Happy's coding-session transport spans CLI/daemon processes, Socket.IO, HTTP
message persistence, server-side RPC routing, and provider-owned Codex threads.
Network interruption, process restart, retries, or lost acknowledgements can
therefore expose users to a missing or repeated prompt, reordered transcript,
or an RPC that waits after its target has died.

### Desired outcome

For persisted session messages, an interrupted client converges to the server's
ordered log without loss or duplicate delivery. Retried writes are idempotent.
CLI/daemon and Codex thread restarts resume the intended identity and history.
RPC calls either complete or return a bounded failure when their target dies.

### Product requirements

1. Disconnect and reconnect catch up every persisted message after the last
   message actually consumed by the client.
2. Duplicate or out-of-order socket notifications trigger ordered catch-up and
   do not produce duplicate application-level delivery.
3. A write retried after a lost acknowledgement creates one persisted message,
   identified by a stable client-generated idempotency key.
4. Pending writes survive transient transport failure for the life of the
   running CLI process and drain after recovery without reordering that queue.
5. CLI/daemon restart and Codex thread resume use durable identifiers and do
   not silently attach to a different Happy session or provider thread.
6. An RPC whose target is absent, disconnects, or never acknowledges returns a
   deterministic error within a documented bound; no call waits forever.
7. Each named failure mode has a deterministic automated test or repeatable,
   bounded stress script, and critical scenarios pass multiple consecutive
   rounds with zero lost, duplicate, or misordered messages.

### Observable success

- Automated fault injection covers offline recovery, Socket reconnect,
  CLI/daemon restart, Codex thread resume, duplicate delivery, reordering,
  acknowledgement loss, and dead RPC targets.
- Relevant happy-cli, happy-server, and happy-wire tests pass together.
- Relevant typecheck/build commands, strict workflow audit, and whole-feature
  verification pass.
- The workflow validation record states commands, round counts, elapsed time,
  findings, remaining limitations, and rollback instructions.

### Scope

- `packages/happy-cli`, `packages/happy-server`, and `packages/happy-wire`.
- Deterministic fault-injection tests and repeatable bounded stress tooling.
- Protocol and workflow documentation required to explain and verify the
  reliability contract.

### Non-goals

- Any change to `happy-app`, Studio, themes, visual assets, or UI behavior.
- Deployment, release, publication, database migration, or a new messaging
  product surface.
- Exactly-once execution of arbitrary RPC side effects; RPC guarantees are
  bounded completion and explicit retry semantics.

### Constraints

- Preserve wire compatibility with existing clients and server data.
- Prefer server-persisted sequence numbers for receive ordering and stable
  client local IDs for write idempotency.
- Tests must be deterministic; stress scripts must have explicit rounds and
  timeouts and must not require production infrastructure.
- Changes must be locally reversible and require no data rollback.

## Workspace Project Discovery

### Problem

Happy currently derives remote working-directory suggestions from paths that
already appear in Session history. A user who has not previously started a
Happy Session in a project, or who no longer remembers its exact path, cannot
discover that project from Happy and must type the absolute path manually.

### Users

- People who use Happy to start agent Sessions on one or more remote Machines.
- People whose projects live under the conventional per-user `workspace`
  directory on macOS, Linux, or Windows.

### Desired outcome

After selecting an online Machine, the user can open the existing Working
Directory picker, browse or search projects discovered under that Machine's
per-user `workspace` directory, select one, and continue through the existing
Session-start flow.

The feature is **Workspace Project Discovery**. It is not a Workspace or
Checkout management system.

### Product requirements

1. The picker presents existing Session-history paths as `Recent`, preserving
   their current content and priority when no search is active.
2. The picker can present projects discovered on the selected online Machine
   under a separate `Workspace Projects` section.
3. Discovery is requested only when the picker is open and the selected
   Machine is online.
4. One project search covers both Recent and discovered projects by project
   name, absolute path, and path relative to the workspace root. Search results
   prioritize exact name matches, then name-prefix/name-substring matches, then
   relative-path and absolute-path matches.
5. Recent and discovered paths are normalized according to the target
   platform and deduplicated. A matching Recent path wins.
6. Selecting a discovered project only updates the existing selected working
   directory. Starting a Session continues to use the current spawn flow.
7. Manual entry of any valid absolute path remains available.
8. Changing Machines must not show discovery results from the previously
   selected Machine.
9. A missing workspace root, permission failure, timeout, truncated result, or
   unsupported older daemon is non-blocking and leaves Recent paths and manual
   entry usable.
10. Discovery is bounded, read-only, and local to the selected Machine. It
    inspects directory names and recognized project markers, but does not read
    source-file contents, execute project scripts, or run Git commands.
11. Discovery results are short-lived in-memory UI data. They are not uploaded
    or persisted in Server, Machine, Session, or sync metadata.
12. The behavior works for native macOS, Linux, and Windows paths.
13. Discovery presents project roots rather than every nested package or IDE
    bundle inside an already recognized project.
14. When an unfiltered result is truncated, a search can ask a supporting
    daemon for matching projects beyond the original result window.

### Observable success

- A project under the selected Machine's conventional `workspace` root that
  has never appeared in Happy Session history is visible and searchable in the
  Working Directory picker.
- Selecting that project and starting a Session produces the same path-bearing
  spawn request as manually entering the path.
- Existing Recent, manual-path, Worktree, permissions, Agent selection, spawn,
  resume, and fork behavior remains available.
- An App connected to a daemon without discovery support does not crash and
  retains the pre-feature working-directory behavior.
- Automated tests cover scanner bounds and exclusions, path normalization and
  deduplication, stale-Machine result rejection, and unavailable-RPC fallback.
- A development daemon and App picker smoke test demonstrates discovery of a
  project absent from Session history.

### Scope

- A bounded scanner in the Happy CLI/daemon for the conventional workspace
  root: `~/workspace` on macOS/Linux and `%USERPROFILE%\\workspace` on Windows.
- A read-only optional Machine RPC for listing workspace projects.
- App-side request, compatibility fallback, short-lived caching, and state
  isolation by Machine.
- Shared picker-data logic integrated into the full New Session page in V1 and
  shaped for later Home Dock adoption.
- Search, loading, empty, truncated, and non-blocking error presentation.

### Non-goals

- Workspace IDs, Checkout IDs, database tables, migrations, or a durable
  cross-Machine project model.
- Grouping projects by Git remote or automatically merging project identities
  across Machines.
- Branch, Worktree, Checkout, or repository lifecycle management.
- Server, Sync Engine, encryption, Session protocol, or
  `spawn-happy-session` changes.
- Configurable scan roots, scanning a home/root/network/removable volume, a
  background watcher, or persistent scan results.
- Removing or replacing Recent paths or manual path entry.
- Refactoring the New Session page beyond the seams required by this feature.

### Constraints

- Discovery must use the existing encrypted Machine RPC channel and tolerate
  the new RPC method being unavailable.
- Scanning must have explicit depth, result-count, and time bounds; skip known
  generated or dependency directories; tolerate disappearing and unreadable
  directories; and avoid following links outside the workspace root.
- Full project-path result sets must not be logged or committed as test or
  workflow evidence.
- The initial implementation must remain removable without data migration.

### Accepted product decisions

- V1 enables discovery in the full New Session page only. Home Dock remains
  unchanged while reusable picker-data logic preserves a follow-up seam.
- Marker labels are not required in V1.
- Scanner defaults begin at depth 3, 200 projects, and a 3-second caller
  timeout; a representative workspace benchmark must validate the final values.
# Happy Personal Studio Product Requirements

## Product intent

Preserve Happy's cross-platform functionality while providing a packaged
desktop Studio presentation for users who want coding-agent information density
and semantic clarity comparable to mature desktop and terminal coding tools.

## Studio execution transcript outcome

When an agent runs commands, emits terminal output, changes files, or reports a
result, a desktop Studio user can distinguish the command, arguments, working
directory, output, failure/success state, and diff relationship without reading
an undifferentiated code box.

Observable success:

- ordinary assistant prose stays neutral and readable;
- semantic color is reserved for links, commands, terminal output, statuses,
  errors, and diffs;
- shell execution output retains safe ANSI meaning, text selection, copy, CJK,
  Unicode, wrapping, and long-line usability;
- structured tool parts remain truthful to Happy's existing message data;
- packaged Tauri Studio gains the richer presentation while Default,
  standalone Web, iOS, and Android retain current behavior;
- existing and new clients remain mutually compatible when optional execution
  result metadata is present or absent; command execution and permission
  behavior do not change.

## Studio activity continuity outcome

When Codex completes a command, the result that already exists at the local
runtime reaches the matching Happy tool call without being flattened or
discarded. Studio can then present truthful `Ran`, `Explored`, and `Edited`
activity with restrained type and state color, while older clients and messages
that lack result metadata continue to behave exactly as before.

Observable success:

- command output, exit status, and duration survive the CLI-to-app path within a
  documented size bound;
- legacy `tool-call-end` events without result fields remain valid;
- non-zero command exits become observable tool errors without inferring status
  from prose;
- Studio activity rows distinguish terminal, read/search, edit, task, neutral,
  running, and failure semantics; completed rows retain their category color
  without coloring ordinary assistant prose;
- Studio file-edit activities expose their unified diff directly in the
  transcript with green additions, red deletions, file identity, and counts,
  instead of hiding the first useful view behind a generic disclosure;
- Default, standalone Web, iOS, and Android retain their existing presentation.

## Non-goals

- Reproduce terminal character-cell chrome or proprietary OTTY/Codex Desktop
  assets.
- Color arbitrary prose using heuristic sentiment or keyword detection.
- Build an interactive terminal emulator inside conversation history.
- Replace the existing Pierre diff parser/renderer.
- Change mobile or Default presentation in this feature.
- Stream live terminal cells or implement an interactive terminal emulator.
- Persist unbounded command output or retroactively manufacture output for old
  messages that never carried it.

# Happy Desktop Official Baseline Release

## Product outcome

The repository owner can request an official macOS desktop client refresh and
receive a locally built, stably signed, separately installed app sourced from
the validated personal `main` branch without disturbing the active `dev`
workspace or the installed development client.

Observable success:

- one `happyctl` command prepares an isolated official-baseline worktree, builds,
  signs, backs up, installs, verifies, and launches the client;
- product inputs on `main` are proven equivalent to `upstream/main`, allowing
  only the repository's declared devtools/instruction paths to differ;
- the app installs as `Happy (official baseline).app` with bundle identifier
  `com.slopus.happy.official-baseline`, alongside `Happy (dev).app`;
- a dry run reports the exact intended source and targets without mutation;
- a project-local Skill gives agents a concise, repeatable release procedure.

## Non-goals

- Apple notarization, App Store submission, DMG publication, GitHub Releases,
  or any other public distribution.
- Building official baseline artifacts from `dev` or from a dirty worktree.
- Replacing, stopping, or relabeling the personal development client.

# Bounded Client Performance

## Problem

Happy becomes progressively less responsive as the account accumulates many
Sessions and an opened Session accumulates a long, tool-heavy transcript. The
failure is client-wide: navigation and scrolling degrade, and renderer main
thread stalls can delay IME composition and ordinary text entry.

Virtualized lists alone do not bound the work performed before rendering.
Session updates still rebuild a projection of the complete Session collection,
while message updates can repeatedly derive display groups and copy metadata
from the complete loaded transcript.

## Desired outcome

Happy remains responsive while an account contains a large Session index and
while a long Session receives streaming updates. Work performed for one Session
or one active turn scales with the changed data, not with all retained Sessions
or all historical messages.

## Product requirements

1. A repeatable development benchmark records Session-index mutation work,
   message-derivation work, retained message state, and representative client
   latency before and after optimization.
2. Updating one Session does not rebuild unchanged row projections for every
   other Session.
3. Streaming one active turn does not repeatedly derive completed historical
   turns or eagerly construct copy payloads for every message.
4. The client retains a bounded working set of hidden Session message caches.
   An opened Session keeps its loaded history intact so existing one-way
   backward pagination cannot create an unrecoverable middle-page gap.
5. Session and chat list virtualization uses platform-appropriate bounded
   render windows without breaking newest-message anchoring, scroll-up history,
   message targeting, or IME input.
6. Existing Session protocol, encryption, persistence, cross-device behavior,
   and server compatibility remain unchanged in the client-first delivery.
7. A server/protocol pagination redesign is considered only when post-change
   evidence attributes a material remaining bottleneck to an unpageable or
   oversized transport contract.

## Observable success

- Deterministic tests prove unchanged Session rows retain stable projections
  across unrelated Session updates.
- Deterministic tests prove completed message-turn projections are reusable
  across active-turn updates and expensive copy text is generated on demand.
- Cache-policy tests prove configured Session and hidden-transcript bounds,
  including protection for active send/outbox work and latest-page reload.
- Representative 100, 500, and 2,000 Session fixtures and 100, 1,000, and 5,000
  message fixtures complete the recorded benchmark without unbounded retained
  state or full-collection work on a single-item update.
- Happy app typecheck, focused tests, full applicable app tests, and repository
  workflow checks pass.

## Scope

- Client-side benchmark and diagnostic counters that are absent from normal
  production behavior unless explicitly enabled.
- Incremental Session-index projection with stable unchanged rows.
- Incremental or turn-scoped message display derivation and on-demand copy
  payload generation.
- Bounded hidden-message-cache policy integrated with existing backward paging.
- Evidence-based Chat and Session list window tuning.

## Non-goals

- Changing Session wire formats, server database schemas, encryption, or agent
  runtime behavior in the client-first delivery.
- Deleting durable history or preventing users from loading older messages.
- Replacing React Native, Zustand, or every list component.
- Treating model-context compaction as a substitute for UI-state bounds.
- Shipping a speculative server protocol redesign without post-change evidence.

## Constraints

- Product logic should live in focused performance modules; `storage.ts`,
  `sync.ts`, `ChatList.tsx`, and `SessionsList.tsx` should contain narrow seams
  to reduce future upstream merge conflicts.
- Benchmarks must use generated, non-sensitive fixtures and must not capture or
  commit real Session content.
- Bounds must fail safe: active turns, pending permissions, unsent outbox data,
  and the currently targeted message cannot be silently discarded.

# Session Realtime Recovery

## Problem

During an active coding turn, Happy can show a Session as idle while Codex is
still working, and a visible client can miss persisted agent messages until the
user sends another prompt. The two failures overlap: Codex child-turn lifecycle
events can be mistaken for the primary turn, while a user-scoped data socket can
remain apparently connected without delivering updates.

## Desired outcome

Primary-turn activity remains accurate during multi-agent work, and a visible
client converges on the server's durable message log without requiring another
user action even when a realtime update is missed or a socket becomes half-open.

## Product requirements

1. A child Codex thread cannot replace, complete, abort, or clear the primary
   turn used for Session activity and user-message steering.
2. Only completion of the primary turn may change the Session from thinking to
   idle.
3. A visible Session performs bounded incremental reconciliation when a turn
   becomes idle, when its data socket reconnects, and while it remains visible
   in the foreground.
4. The App detects an apparently connected user-scoped socket that no longer
   acknowledges server pings and reconnects it automatically.
5. Reconnection and reconciliation are idempotent and do not duplicate
   messages, visibility references, prompts, or turn completion.
6. Existing wire formats, encrypted message storage, server message ordering,
   and older clients remain compatible.

## Non-goals

- Enabling Socket.IO connection-state recovery or changing the server database.
- Treating React render forcing as the default fix without evidence that the
  message already reached the subscribed store.
- Changing proxy timeout configuration or guaranteeing foreground timers while
  a mobile operating system suspends the App.

## Constraints

- REST message history remains canonical; socket events are low-latency hints.
- Health probes use the existing acknowledged `ping` socket event and contain no
  Session content.
- Foreground reconciliation is incremental and restricted to visible Sessions.
- A transient probe failure must not cause an immediate reconnect loop.

# Windows Native Reliability

## Problem

Happy's Windows devtools, package scripts, and CLI tests do not yet have one
native, deterministic verification loop. PowerShell behavior is partly covered
only by Unix smoke tests or ad hoc commands, while known Windows-only failures
can be hidden by missing worktree dependencies or POSIX assumptions. Commands
near installation, registry, scheduled-task, daemon, Git-branch, and push-guard
boundaries also need proof that validation itself does not change external
state.

## Desired outcome

From an isolated worktree based on the validated `dev` commit, a maintainer can
run one Windows PowerShell 5.1-compatible smoke suite and a bounded set of real
build checks to prove Happy's Windows devtools, CLI, and desktop build path are
repeatable and non-destructive. Stable Windows-only failures are fixed with
regression coverage; failures that cannot be reproduced retain exact
environment and counter-evidence instead of speculative changes.

## Product requirements

1. `devtools/happyctl.ps1` has a self-contained Windows smoke/contract entry
   that runs under Windows PowerShell 5.1 without Pester or a new global
   dependency.
2. The suite covers PowerShell parsing, paths containing spaces and non-ASCII
   characters, isolated Node 20 resolution, doctor success/failure behavior,
   Git and product-difference guards, artifact discovery, and the supported
   desktop update/refresh dry runs.
3. Test fixtures and dry runs are isolated from real installs, uninstall
   registry entries, scheduled tasks, running applications, daemons, branches,
   remotes, and user configuration.
4. The `@slopus/happy-wire` package's standard test command works from native
   Windows package-script execution.
5. CLI tests express the platform behavior actually exercised on Windows:
   sandbox tests do not require non-Windows mocks when production skips that
   path, and path/tool-launcher assertions use native path semantics. Any
   production correction is limited to a runtime failure reproduced by the
   complete native suite.
6. A real Windows `doctor` and `build-desktop` run from the selected worktree
   succeeds with isolated Node 20 and produces fresh `app.exe`, NSIS, and MSI
   outputs without installing them.
7. Repository status, installed executable hashes, uninstall entries, Happy
   scheduled tasks, and Happy daemon/application process status are captured
   before and after final verification and remain unchanged except for tracked
   task changes and ignored build outputs.

## Observable success

- Windows PowerShell 5.1 parses the production script and the smoke entry with
  zero errors; PowerShell 7 also parses and runs it when installed.
- The complete Windows smoke suite passes twice consecutively.
- `happyctl.ps1 doctor` passes against the selected worktree.
- `happyctl.ps1 build-desktop` completes without installation, and all three
  required artifacts are newer than the recorded build start time.
- The standard happy-wire test, focused sandbox regressions, and complete CLI
  suite pass on native Windows.
- A machine-readable before/after comparison finds no external-state drift.

## Scope

- Windows PowerShell devtools tests and the narrow production seams required by
  failures those tests reproduce.
- Windows-compatible package-script and CLI corrections for the recorded gaps
  and any additional stable Windows failures exposed by the required complete
  baseline run.
- Native Windows dependency, doctor, dry-run, build, artifact, and invariant
  evidence.

## Non-goals

- Daemon/service startup architecture.
- Product UI, Studio, theme, animation, or visual alignment work.
- Installing, replacing, launching for install verification, or rolling back a
  desktop application.
- Writing uninstall registry state or registering/removing scheduled tasks.
- Publishing, branch synchronization, commit, push, merge, or work on another
  platform or product feature.

## Constraints

- Behavior changes require a stable native Windows reproduction first.
- Tests use temporary fixtures and restore process-scoped environment changes.
- Real validation may write only ignored dependency/build outputs and
  repository workflow evidence.
- A daemon architecture choice or any required external-state mutation blocks
  completion pending explicit owner approval.

# Runtime-confirmed Codex Route Metadata

## Problem

Happy publishes the model requested by its UI or CLI, but does not publish one
machine-verifiable pair containing the model and reasoning effort that Codex
App Server actually accepted. Downstream launch verification must therefore
stop for manual confirmation even when process, branch, worktree, and session
binding are otherwise valid. Treating requested values as effective would
create a false authorization signal.

## Desired outcome

Every effective Codex route exposed in Happy Session metadata is one current,
atomic model/effort pair confirmed by Codex App Server. Consumers can verify a
matching route automatically and detect a mismatch without trusting launch
arguments, picker state, defaults, prior metadata, or process inspection.

## Product requirements

1. Codex Session metadata supports optional `effectiveModel` and
   `effectiveReasoningEffort` fields without redefining the requested-state
   `modelMode` field.
2. The effective fields are published or updated together only from a Codex
   App Server response or notification that confirms both concrete values for
   the current thread or accepted route change.
3. Initial thread start, resume/reconnect, and supported fork paths publish the
   confirmed pair.
4. Later accepted model or effort changes replace the pair only after Codex
   confirms the resulting concrete pair; requested/effective mismatches remain
   visible as the reported effective values.
5. Missing, null, malformed, partial, reset/default, or otherwise unconfirmed
   evidence withholds or clears both effective fields and never retains a stale
   or mixed pair.
6. The existing daemon Session projection exposes the optional pair without
   adding prompt content, credentials, tokens, raw logs, or other sensitive
   state.
7. Existing startup flags, requested-state display, remote mode selection,
   reconnect behavior, non-Codex agents, and older metadata consumers remain
   compatible.

## Observable success

- A deterministic Luna Max fixture reaches the daemon projection as
  `effectiveModel=gpt-5.6-luna` and `effectiveReasoningEffort=max` from App
  Server-confirmed evidence.
- Negative fixtures prove fail-closed behavior for requested/effective
  mismatch, absent effort, stale metadata, reset/default, resume, and
  model-only or effort-only changes.
- The unchanged launcher v0.5 parser accepts a matching confirmed pair and
  rejects or defers every missing, partial, or mismatched pair.

## Scope

- Happy CLI Session metadata typing, the focused Codex runtime metadata seam,
  App Server lifecycle response propagation, `runCodex` integration, existing
  daemon Session projection, focused tests, and minimal contract documentation.

## Non-goals

- Routing-policy, default-model/effort, picker, permission, service-tier,
  sandbox, launcher, canary, UI, release, install, or non-Codex-agent changes.
- New polling, telemetry, logs-as-protocol, or any inference from arguments,
  environment variables, process state, launch receipts, or previous metadata.

## Constraints

- Optional fields must remain backward compatible and contain only the
  non-sensitive confirmed route values.
- Publication is fail-closed and atomic: partial evidence clears or withholds
  the whole effective pair.
- The change is locally reversible by removing the optional fields and their
  propagation; rollback returns consumers to manual verification.
