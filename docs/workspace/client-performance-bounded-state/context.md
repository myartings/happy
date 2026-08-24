# Context: `client-performance-bounded-state`

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

- Goal: keep input, navigation, and scrolling responsive as Session and message
  counts grow by bounding retained state and making derivations incremental.
- Client-first boundary: no Session protocol, server, encryption, persistence,
  or cross-device contract changes.
- Ordered delivery: baseline, Session index, turn presentation, working-set
  bounds, render tuning, then evidence-based protocol escalation decision.
