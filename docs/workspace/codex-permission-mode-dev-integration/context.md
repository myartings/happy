# Context: `codex-permission-mode-dev-integration`

## Outcome

Integrate Issue #87's cross-device permission-mode preservation with Issue
#88's live permission-mode control in one normal merge for PR #90.

## Source and ownership

- User-authorized local-only merge integration.
- Current Root owns the existing Issue #87 worktree and pending merge.
- Serial topology; overlapping authorization-sensitive files make writer
  parallelism unsafe. Independent reviewers remain read-only.

## Fixed inputs

- Ours: `5f8585f8` (`fix(app): preserve Codex session permission mode`).
- Theirs: `633c5b94` (`origin/dev`, including merged PR #89 / Issue #88).
- Delivery PR: https://github.com/myartings/happy/pull/90

## Exclusions

No new permission behavior, global defaults, policy mappings, server/native
scope, history rewriting, force push, PR merge, release, installation, or Issue
closure.

`context.md` is the human-readable overview. When an accepted task actually
dispatches implementation or verification work, materialize only the needed
machine-readable, role-scoped manifests:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

Do not create these files for serial work that remains in the current context.

## Implementation context

- For dispatched implementation work, see `contexts/implement.jsonl`.

## Verification context

- For dispatched verification work, see `contexts/check.jsonl`.

## Notes

- Remove irrelevant placeholders.
- Add feature-specific source and test files to the appropriate role manifest.
