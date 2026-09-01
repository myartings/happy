# Decisions: `workspace-auto-import`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where does discovery run? | resolved | The machine CLI scans daemon-owned `~/workspace`; callers cannot supply a root. |
| D2 | Does discovery replace the registry? | resolved | No. Merge additively; preserve every existing entry and never delete. |
| D3 | How are worktrees and duplicates handled? | resolved | Reuse registry canonicalization; a linked worktree maps to its proven primary repository and canonical identities deduplicate. |
| D4 | How is partial failure handled? | resolved | Skip discoveries that disappear or cannot validate; commit all valid new identities in one validated atomic write. Existing registry bytes remain authoritative if the write fails. |
| D5 | What happens on repeated loads? | resolved | Re-scan for newly created projects, but do not write or increment revision when the registry already contains every canonical identity. |
| D6 | Is a schema migration required? | resolved | No. Schema 1 already represents imported projects; only additive records are written. |

## Risk assessment

Result: `cleared-with-controls`.

- Affected data: machine-local `~/.happy/projects.json` only.
- Blast radius: the selected Happy daemon machine; no Server or cross-device
  data mutation.
- Reversibility: imported entries are ordinary Saved Projects; source project
  directories are never modified.
- Controls: bounded trusted-root scan, canonical validation, identity
  deduplication, exclusive lock, single revision increment, validate-before-
  write, same-directory atomic rename, idempotent retry, and real Git fixtures.
- Stop conditions: corrupt/unsupported existing registry, lock failure, or
  atomic write failure aborts the response and preserves the prior registry.
