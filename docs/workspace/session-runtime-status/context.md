# Context: `session-runtime-status`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Notes

- The app already derives `presence`, `thinking`, and pending permission state
  from synchronized session data. This feature makes those existing signals
  explicit in the status row; it does not add another runtime contract.
- Implementation worktree:
  `C:\Users\myartings\workspace\happy-session-runtime-status` on
  `feature/session-runtime-status`, branched from `dev` at `66ec1fe0`.
