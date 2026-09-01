# Machine-saved main projects for New Session

## Status and source

- Status: accepted for implementation on 2026-09-01.
- Delivery source: [GitHub Issue #84](https://github.com/myartings/happy/issues/84).
- Boundary: one Feature Slice. The machine-local project registry, its Machine
  RPC surface, project selection, and safe session start form one rejection and
  rollback boundary.

## Outcome

A person explicitly saves an existing directory as a project on one machine.
Happy gives that project a stable machine-local identity, lists only saved
projects in the New Session project picker, and resolves the selected identity
to its current primary path on the machine immediately before session start.
A Git linked worktree never receives or appears as a separate project identity.

## Non-goals

- Creating, deleting, renaming, or reordering projects or directories.
- Synchronizing projects between machines or through the Server.
- Migrating scanner or Recent data into the registry.
- Removing the legacy workspace scanner RPC.
- Adding a new worktree-session entry or redesigning the complete picker.
- Publishing, deploying, or changing authentication/session wire protocols.

## Terms and data contract

`SavedProjectRegistry` is stored beneath the configured Happy home on the
machine. Version 1 contains `schemaVersion: 1`, a monotonically increasing
integer `revision` starting at zero, and `projects: SavedProject[]`.

Each `SavedProject` contains an opaque stable UUID `id`, user-facing `name`,
operational absolute `primaryPath`, real-path-normalized absolute
`canonicalPath`, `kind: "git" | "directory"`, and ISO-8601 `createdAt` and
`updatedAt` timestamps. A canonical path can have at most one project. Repeated
add returns the existing identity without incrementing the revision.

## Observable behavior

### Registry reads and writes

1. A missing registry reads as schema 1, revision 0, and no projects.
2. A valid add requires an existing directory. Relative input is resolved from
   the machine home directory, `~` is expanded there, and symbolic links are
   resolved before identity is assigned.
3. For a directory inside a Git worktree, Happy resolves Git top-level,
   per-worktree git dir, and common git dir. A normal repository or submodule
   uses its own top-level. A linked worktree maps to the primary repository
   root derived from the common git directory; when that root cannot be proven,
   add fails explicitly.
4. A path inside a Git project resolves to the same project as its top-level.
   A non-Git directory is itself the project boundary.
5. Registry replacement uses a same-directory temporary file and atomic rename
   while an exclusive registry lock is held. Callers may supply
   `expectedRevision`; a mismatch fails without modifying the file.
6. Malformed JSON, unsupported schema, invalid fields, or duplicate canonical
   identity is reported as corruption and is never replaced by list or add.

### Machine RPC

1. `list-saved-projects` returns the complete validated registry snapshot.
2. `add-saved-project` accepts a path and optional expected revision, then
   returns the saved project, resulting snapshot, and whether it was created.
3. A directory-spawn request may carry `projectId`. Immediately before calling
   the existing daemon spawn function, the machine resolves the ID and verifies
   that its primary directory still exists.
4. Unknown ID, corrupt registry, missing directory, or non-directory path fails
   before spawn. A caller directory cannot override project-ID resolution.
5. `list-workspace-projects` remains for compatibility, but the new App path
   never calls or silently falls back to it.

### App selection and start

1. The selected online machine's saved-project RPC is the sole source of
   project rows. Session Recent and scanned workspace candidates are not rows.
2. The picker exposes an existing-path input and explicit add/confirm action.
   Success selects the returned project identity and refreshes the registry.
3. A row is selected by `id` and displays its name and primary path. Changing
   machines clears the prior machine's project identity.
4. Starting the main project sends `projectId`; the daemon, not a cached display
   path, selects the spawn directory. Explicit worktree selection remains
   path-based and never saves the worktree as a project.
   A target daemon that cannot resolve the CLI-owned identity itself, including
   Happy Agent/Rig, reports the saved-project start unavailable rather than
   receiving the cached path or an unverified project ID.
5. Offline machines disable add/start through existing availability rules.
   Registry load/add/start errors remain visible and retain the draft.
6. Desktop and other New Session surfaces call the shared
   `useStartSessionFromDraft` start/cancel state machine; no second spawn flow is
   added.

## Compatibility and rollback

- New App against older CLI reports saved projects unavailable; no fallback.
- Old App against new CLI can continue using the retained scanner RPC.
- No user directory is created, moved, renamed, or removed.
- Rollback removes App consumption and new handlers. The registry remains inert
  and recoverable; no migration or cleanup is required.

## Acceptance and evidence mapping

| ID | Verifiable criterion | Planned evidence |
| --- | --- | --- |
| SP-01 | Empty registry and schema/revision/project fields are stable. | CLI registry unit tests. |
| SP-02 | Relative, symlink, Git child, normal repo, submodule, and linked-worktree paths normalize or reject as specified. | Temporary filesystem and Git fixture tests. |
| SP-03 | Duplicate canonical paths are idempotent; revision conflicts do not write. | CLI registry unit tests. |
| SP-04 | Writes replace atomically and corruption is never overwritten. | Filesystem fixture tests and unchanged-byte assertion. |
| SP-05 | Machine list/add RPCs validate and return the registry contract. | ApiMachine handler tests. |
| SP-06 | Project-ID spawn resolves current primary path and fails before spawn for stale identity/path/corruption. | ApiMachine handler tests. |
| SP-07 | Picker derives rows only from saved projects and supports explicit add confirmation. | App feature/presenter and wiring tests. |
| SP-08 | Selection persists machine-scoped identity; main start sends ID and worktree start remains path-based. | Draft/store and shared start-hook tests. |
| SP-09 | Desktop New Session uses the shared start/cancel hook with no direct duplicate orchestration. | Static wiring test plus hook suite. |
| SP-10 | App/CLI types and applicable workflow family pass. | Targeted Vitest, typechecks, and applicable workflow check. |
