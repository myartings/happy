# Workspace Project Discovery Specification

## Status and boundary

- Status: accepted for task generation
- Product contract: `docs/PRD.md#workspace-project-discovery`
- Decision record:
  `docs/workspace/remote-workspace-project-discovery/decisions.md`

This feature adds bounded, read-only discovery of projects under the selected
Machine's conventional per-user `workspace` directory and exposes those paths
as optional candidates in the full New Session Working Directory picker.

Home Dock integration, durable Workspace/Checkout entities, and project
lifecycle management are outside V1.

## Terms

- **Recent path**: a working directory taken from an existing Session for the
  selected Machine.
- **Discovered project**: a directory beneath the conventional workspace root
  that matches at least one recognized project marker.
- **Workspace root**: `~/workspace` on macOS/Linux or
  `%USERPROFILE%\\workspace` on native Windows, resolved by the daemon.
- **Current request**: the discovery request whose Machine identity and request
  generation still match the currently open picker.

## Machine discovery contract

The daemon exposes an optional, encrypted, read-only Machine RPC named
`list-workspace-projects`. The App sends no user-controlled root path in V1.

Successful responses have this logical shape:

```ts
type WorkspaceProject = {
    name: string;
    path: string;
    relativePath: string;
    markers: string[];
    depth: number;
};

type ListWorkspaceProjectsResult = {
    root: string;
    projects: WorkspaceProject[];
    scannedAt: number;
    truncated: boolean;
};
```

All returned `path` values are absolute native paths on the target Machine.
`relativePath` is relative to `root` and never escapes it. `markers` contains
recognized marker names only. `depth` is the project's directory depth below
`root`, with an immediate child at depth 1. Project ordering is deterministic.

The scanner:

- defaults to maximum depth 3 and maximum 200 returned projects;
- stops adding results at the result limit and sets `truncated`;
- skips dependency, generated-output, cache, VCS-internal, and known large
  platform directories, including `.git` contents, `node_modules`, `.venv`,
  `venv`, `__pycache__`, `.next`, `.turbo`, `Library`, `DerivedData`, `target`,
  `build`, and `dist`;
- recognizes repository and common ecosystem markers, including `.git`,
  `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Package.swift`,
  Xcode project/workspace bundles, Visual Studio solutions, Unreal projects,
  and Unity project structure;
- reads directory entries and marker metadata only; it does not read source
  contents, execute programs, or invoke Git;
- does not follow a symbolic link whose resolved target is outside `root`, and
  cannot loop through symbolic links;
- tolerates an entry disappearing or becoming unreadable during traversal;
- returns an empty result for a missing workspace root and a bounded error for
  a root that cannot be inspected at all.

The RPC and scanner do not modify Server, database, Sync Engine, encryption,
Session metadata, Machine metadata, or spawn protocol state and do not log the
full project result set.

## App request and state contract

The App requests discovery only while all of these are true:

1. the full New Session Working Directory picker is open;
2. a Machine is selected; and
3. that Machine is online.

The App applies a 3-second caller timeout and may cache a successful result in
memory for 30-60 seconds keyed by Machine ID. Cache and timeout values are not
persisted. A representative workspace benchmark may lower these defaults
before finish without changing this behavioral contract.

State for the selected Machine is one of `idle`, `loading`, `ready`, or
`unavailable`:

- picker open on an online Machine: `idle -> loading` unless a fresh
  Machine-keyed cache entry can produce `ready`;
- successful current request: `loading -> ready`;
- missing root: `loading -> ready` with zero projects;
- unsupported method, timeout, transport/decryption error, or scanner error:
  `loading -> unavailable`;
- picker close, Machine change, or Machine becoming offline: visible discovery
  state returns to `idle`; late results from a no-longer-current request are
  ignored.

`unavailable` is a compatibility state, not a fatal New Session error. It must
leave Recent paths and manual input functional. V1 may use a generic unavailable
state and must not depend on matching a particular RPC error string.

## Picker data contract

The picker data layer accepts the target platform/home directory, Recent paths,
the current selected path, discovery state, discovered projects, and search
text. It produces source sections without performing RPC work.

- `Recent` precedes `Workspace Projects`.
- Paths are compared after whitespace trimming, home expansion where possible,
  trailing-separator removal except at filesystem roots, separator
  normalization appropriate to the target platform, and case folding on
  Windows only.
- If Recent and discovered entries normalize to the same path, only the Recent
  entry is shown.
- The current manually entered path remains selectable even if it is not Recent
  or discovered.
- Search matches project name, absolute path, and relative path without changing
  the stored selected path.
- Selecting a discovered entry writes its absolute `path` into the existing
  selected-path state. It does not create a Workspace record or change the
  existing spawn request shape.
- Loading, empty, truncated, and unavailable discovery states are understandable
  and non-blocking. Marker labels are not required in V1.

## Compatibility and edge cases

- An older daemon that does not expose `list-workspace-projects` retains the
  pre-feature Recent and manual-entry behavior.
- Machine changes cannot reuse visible data or late responses from another
  Machine, even when requests overlap.
- Unix paths are case-sensitive for deduplication. Native Windows drive and path
  comparisons are case-insensitive and accept either slash style.
- Filesystem roots retain their root separator during normalization.
- Duplicate projects discovered through multiple markers produce one entry
  whose markers are deduplicated.
- Truncation never prevents selection of already returned entries and never
  blocks manual input.

## Acceptance criteria and evidence map

| ID | Verifiable criterion | Planned evidence |
| --- | --- | --- |
| AC1 | A marked project absent from Session history appears under `Workspace Projects` for the selected online Machine. | CLI scanner unit test; App picker-data test; real daemon/App smoke |
| AC2 | Search matches discovered project name, absolute path, and relative path. | App picker-data unit test |
| AC3 | Recent remains first and wins normalized duplicates on macOS/Linux and Windows. | App picker-data unit tests |
| AC4 | Selecting a discovered entry only updates the existing selected path used by the unchanged spawn flow. | New Session integration/component test or focused inspection plus smoke |
| AC5 | Manual path entry and Recent remain usable during loading, empty, truncated, timeout, RPC failure, and old-daemon method absence. | App request-state tests and focused New Session test |
| AC6 | Changing or disconnecting the Machine clears visible discovery state and rejects late stale responses. | App request-state tests |
| AC7 | Scanner respects root containment, depth/result bounds, skip directories, marker rules, disappearing/unreadable entries, and deterministic deduplication. | CLI scanner fixture tests on the host platform plus platform-independent path cases |
| AC8 | No source contents, project commands, or Git commands are used during scanning. | Scanner dependency seam tests and semantic diff inspection |
| AC9 | No Server, DB, Sync Engine, Session protocol, Machine/Session metadata, or spawn RPC shape changes occur. | Whole-diff review and repository path inspection |
| AC10 | App and CLI typechecks plus targeted test families pass. | `pnpm --filter happy typecheck`; `pnpm --filter happy-app typecheck`; targeted Vitest commands |
| AC11 | A representative workspace scan completes within the accepted caller timeout or records a justified lower bound/limit adjustment. | Timed local benchmark recorded in workflow validation |
| AC12 | A development daemon/App smoke discovers and starts from a project absent from Session history; any unavailable real-device evidence is recorded as an explicit gap. | Manual smoke receipt with private paths redacted |

## Accepted uncertainty

- The exact UI component used to render source sections is an implementation
  choice as long as the observable ordering and non-blocking states hold.
- The final cache duration within 30-60 seconds and scan defaults at or below
  the accepted upper bounds may be selected from benchmark evidence.
- Marker weighting and deterministic secondary sort are implementation details;
  they must not make results nondeterministic or exclude the listed markers.

