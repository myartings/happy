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
   their current content and priority.
2. The picker can present projects discovered on the selected online Machine
   under a separate `Workspace Projects` section.
3. Discovery is requested only when the picker is open and the selected
   Machine is online.
4. Users can search discovered projects by project name, absolute path, and
   path relative to the workspace root.
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
