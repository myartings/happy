# Context: `codex-stalled-turn-recovery`

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

- User-visible failure: repeated follow-up messages appear accepted but produce
  no response until a much later message or manual Stop recovers the session.
- Evidence points to a stale Happy/Codex turn boundary, blocked steer RPC, and
  the fixed ten-minute local false-abort.
- Scope is limited to Happy CLI's Codex adapter and existing session-message
  visibility; no app/server/session-protocol changes are authorized.
