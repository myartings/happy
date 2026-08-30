# Context: `codex-stalled-turn-recovery-hardening`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Final review found four concrete loss/duplication/error-ownership gaps in the
  staged `codex-stalled-turn-recovery` implementation.
- This follow-up changes only Codex app-server delivery/recovery logic and its
  focused tests. It preserves the original accepted behavior and protocol
  boundaries.

## Verification context

- See `contexts/check.jsonl`.

## Notes

- Work is local-only on `fix/codex-stalled-turn-recovery`; no tracker or PR is
  required for this immediate, single-owner repair.
- The original archived workflow remains immutable and is linked as prior
  evidence rather than edited.
