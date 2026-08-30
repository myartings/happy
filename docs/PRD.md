# Happy Product Requirements

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
