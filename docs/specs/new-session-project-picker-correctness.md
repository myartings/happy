# New Session Project Picker Correctness Specification

## Status and boundary

- Status: accepted by the user on 2026-08-30 through the request to implement
  the complete diagnosed solution.
- Extends `docs/specs/remote-workspace-project-discovery.md` and the Workspace
  Project Discovery section of `docs/PRD.md`.
- Scope: the full New Session Project picker, its pure data/search layer, and
  the optional daemon Machine RPC/scanner.
- Non-goals: Home Dock, configurable roots, persistence, Server/Sync changes,
  Session/spawn protocol changes, project lifecycle management, or deeper
  arbitrary filesystem search.

## Observable behavior

1. The Project search control occupies the available row width on web/desktop
   and native layouts; its complete placeholder and entered text remain usable.
2. With an empty query, Recent remains first, preserves source order, and shows
   at most five entries until expanded.
3. With a non-empty query, both Recent and Workspace projects are filtered.
   Every matching Recent entry is eligible for display regardless of its idle
   preview position.
4. Matching is case-insensitive and considers display/project name, absolute
   path, and workspace-relative path when available.
5. Results are deterministic and rank exact name matches before name prefixes,
   name substrings, relative-path matches, and absolute-path matches. Recent
   wins normalized duplicates and remains ahead of an equally ranked Workspace
   result.
6. Empty search results are presented once for the combined result set rather
   than claiming Workspace is empty while a Recent result is visible.
7. The scanner emits an outermost recognized project root and does not recurse
   inside it to emit nested package manifests or project bundles as additional
   projects.
8. The optional `list-workspace-projects` request may include a query. A
   supporting daemon applies the query before the result cap, so a matching
   project outside the unfiltered first 200 can still be returned.
9. Query-aware scans retain the conventional root, maximum depth, maximum
   matching-result count, directory exclusions, read-only behavior, and
   deterministic ordering. The query is trimmed and length-bounded.
10. The App debounces query RPCs, rejects stale responses, and preserves the
    existing 3-second timeout with a Machine/query-keyed short-lived cache.
11. Older daemons may ignore the optional request field or omit any new
    response metadata. Recent, manual entry, and client-side filtering remain
    non-blocking fallbacks.
12. Selecting a project still writes only the existing selected path and uses
    the unchanged spawn flow.

## Interface compatibility

The existing request evolves compatibly from an empty object to:

```ts
type ListWorkspaceProjectsRequest = {
    query?: string;
};
```

The response shape remains compatible. It may optionally echo the normalized
query for diagnostics/UI interpretation, but clients must accept its absence.
No Server API, stored schema, encryption payload, Session metadata, or spawn
request changes.

## Risk controls and rollback

- Query length is capped before scanning; invalid values behave as an empty
  query or a bounded RPC error without escaping the workspace root.
- Full paths and result sets are never logged or copied into durable evidence.
- Scanner traversal remains bounded by root, depth, exclusions, and matching
  result count; the App retains its caller timeout.
- Rollback removes the optional request field/debounce and restores the prior
  scanner recursion behavior; no migration or data cleanup is required.

## Acceptance criteria and evidence

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | Project search input fills its row and is not clipped. | Browser DOM measurement and screenshot smoke; focused style inspection. |
| AC2 | Active search finds a matching Recent entry beyond the idle five-item preview. | App pure-data/preview regression test. |
| AC3 | Exact-name matches outrank prefix, substring, relative-path, and absolute-path-only matches deterministically. | App ranking unit tests. |
| AC4 | Combined empty state does not contradict a visible Recent match. | Focused component/render inspection or test seam plus browser smoke. |
| AC5 | Scanner suppresses nested package and IDE-bundle projects beneath a recognized outer root. | CLI scanner fixture tests. |
| AC6 | Query filtering occurs before the result cap and can recover a match beyond the unfiltered window. | CLI scanner regression test. |
| AC7 | App sends debounced optional queries, caches by Machine/query, and rejects stale results. | Loader/operation tests and focused integration inspection. |
| AC8 | Old-daemon response compatibility and manual/Recent fallback remain intact. | App runtime-validation tests and whole-diff inspection. |
| AC9 | Existing path normalization, selection, and spawn behavior remain unchanged. | Existing targeted tests, App typecheck, semantic inspection. |
| AC10 | App and CLI targeted suites and configured typechecks pass. | Recorded deterministic commands in workflow validation. |

## Accepted uncertainty

- Older daemons cannot recover a project omitted by their own unfiltered cap;
  they retain the documented non-blocking fallback until upgraded.
- Worktrees deeper than the fixed discovery depth are not newly scanned. Known
  worktrees remain accessible through searchable Recent entries or manual path.
