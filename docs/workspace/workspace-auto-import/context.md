# Context: `workspace-auto-import`

## Goal

Automatically import projects discovered beneath the machine's conventional
`~/workspace` root into the schema-1 Saved Project registry before the App
lists projects.

## Accepted source

- User request on 2026-09-01: `自动导入 workspace 下的项目`.
- Follow-up to archived Issue #84; this Workspace does not rewrite its history.
- Contract: `docs/specs/workspace-auto-import.md`.

## Current evidence

- The machine has 45 top-level directories under `~/workspace` but only one
  record in `~/.happy/projects.json`.
- `workspaceProjectScanner.ts` already provides bounded marker-based discovery.
- `SavedProjectRegistry` already owns canonical Git/worktree identity, locking,
  validation, and atomic writes.
- `list-saved-projects` currently returns the registry without discovery.

## Ownership and topology

- Current human-facing Root and current worktree.
- Serial implementation; no delegated writer or parallel batch.
- Product scope is limited to Happy CLI registry/discovery integration and
  tests. App UI and protocol schemas remain unchanged.
