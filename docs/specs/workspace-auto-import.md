# Workspace Auto-import for Saved Projects

## Goal

When a machine lists Saved Projects, Happy automatically discovers projects
beneath that machine's conventional `~/workspace` root and safely merges them
into the machine-local Saved Project registry. Existing Saved Project identity
remains authoritative.

## Boundary

- The import runs on the Happy CLI machine that owns the registry.
- The existing bounded workspace scanner defines project discovery.
- Import is additive. It never removes or rewrites an existing Saved Project.
- Linked worktrees resolve to their proven primary repository before identity
  comparison.
- The App continues to consume only the Saved Project registry.

## Non-goals

- Watching the filesystem continuously.
- Importing arbitrary directories outside `~/workspace`.
- Removing missing projects or renaming existing entries.
- Migrating Recent Session paths.
- Changing Server, authentication, or cross-device persistence.

## Observable behavior

1. `list-saved-projects` scans the daemon-owned `~/workspace` root before it
   returns the registry snapshot.
2. Every discovered directory that can be validated as an existing project is
   merged into the registry.
3. Existing canonical paths preserve their IDs and metadata.
4. Multiple discoveries that resolve to the same primary repository create at
   most one Saved Project.
5. A scan containing no new valid projects performs no registry write and does
   not advance the revision.
6. Invalid or disappeared discoveries are skipped without removing valid
   existing entries or preventing other valid discoveries from importing.
7. A successful multi-project import is committed with one revision increment
   and the registry's existing lock, validation, and atomic rename controls.
8. A missing `~/workspace` root returns the unchanged registry.

## Compatibility and operational constraints

- The schema remains version 1 and requires no destructive migration.
- Manual `add-saved-project` remains supported and revision-aware.
- Import is idempotent and safe to retry after interruption.
- The scanner remains bounded by its existing depth and project limits.

## Acceptance and evidence

| ID | Criterion | Evidence |
| --- | --- | --- |
| WAI-01 | Valid discovered projects are returned from `list-saved-projects`. | Machine RPC test. |
| WAI-02 | Existing entries preserve identity and a repeated import is a no-op. | Registry unit test. |
| WAI-03 | Linked worktrees and duplicate paths collapse to one primary project. | Real Git registry fixture. |
| WAI-04 | Invalid discoveries are skipped while valid discoveries import atomically. | Registry unit test. |
| WAI-05 | Missing/empty workspace leaves the registry unchanged. | Scanner and RPC tests. |
| WAI-06 | CLI focused suite and typecheck pass. | Deterministic commands in validation evidence. |
