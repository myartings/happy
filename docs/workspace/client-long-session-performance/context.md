# Context: `client-long-session-performance`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Residual performance follow-up only: do not repeat completed demand-driven
  paging, hidden-cache LRU, Session/turn projections, copy-on-demand, or
  ChatList-window work.
- The smallest product seams are draft lifecycle, draft storage projection,
  message scheduling/order, visible-tail policy, and the ChatList live-tail
  signal.
- See `contexts/implement.jsonl` for exact files.

## Verification context

- Deterministic counters are the automated gate. Packaged WebContent RSS,
  CPU/GC, and keystroke distributions are same-run differential evidence.
- See `contexts/check.jsonl`.

## Notes

- Target personal `dev`; no server/protocol/persistence-format or cross-device
  behavior changes.
- Default owner is the main session. No writer delegation or batch plan is
  required for the serial shared-file work.
- Installation, commit, push, PR, and release are outside the current authority.
