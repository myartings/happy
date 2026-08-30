# Context: `new-session-project-picker-correctness`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Correct the full New Session Project picker without changing Session spawn,
  persistence, synchronization, or configurable workspace-root behavior.
- Search covers Recent and daemon-discovered projects. A matching Recent entry
  must become visible even when it was outside the five-item idle preview.
- Search ranking is exact name, name prefix, name substring, relative path,
  then absolute path, with deterministic ties.
- The daemon scanner returns outermost recognized project roots and does not
  descend into a recognized project to emit monorepo packages or IDE bundles.
- The optional Machine RPC accepts a bounded optional query. Old daemons that
  ignore it remain compatible and manual/Recent fallback remains available.
- See `contexts/implement.jsonl` for the bounded file set.

## Verification context

- Start with focused App and CLI RED/GREEN tests, then run both package
  typechecks and browser-smoke the real `/new` picker layout.
- Inspect the whole diff for protocol compatibility, path privacy, bounded
  traversal, and unchanged spawn behavior.
- See `contexts/check.jsonl`.

## Risk controls

- Keep the daemon-owned `~/workspace` root and existing maximum depth/result
  bounds.
- Accept only a trimmed, bounded query string and never log project results.
- Keep the RPC parameter optional so an older daemon can ignore it.
- Preserve the 3-second caller timeout and generation-based stale-result guard.
- Stop if implementation requires Server persistence, Session protocol, sync,
  authentication, or arbitrary scan roots.
