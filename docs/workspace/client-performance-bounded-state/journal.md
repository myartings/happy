# Journal: `client-performance-bounded-state`

## `2026-08-24`

- Started workflow.
- Researched merged Happy performance work, open Happy long-history issues,
  Codex app-server pagination, and Codex long-thread failure reports.
- Accepted a client-first sequence with protocol escalation only after measured
  residual evidence.
- Added PRD, feature spec, dependency-ordered tasks, and resolved decisions.
- Baseline counters confirmed linear full-collection work: 2,000 Session rows
  caused 2,000 projection reads and 5,000 messages caused 20,000 grouping reads.
- Added stable Session-row and turn projections, on-demand agent-copy payloads,
  target-only indexing, hidden-cache eviction, and bounded ChatList settings.
- Amended D2 after implementation inspection: slicing an opened transcript on
  a backward-only cursor would create a middle-page gap. The safe client-only
  boundary therefore evicts oversized hidden caches atomically; a double-ended
  active window remains protocol-gated.

## `2026-08-25`

- Built and installed the Windows/Tauri `Happy (dev)` client through the
  recoverable devtools flow; installed and built executable hashes match.
- Verified the real active long transcript loads, scrolling upward during
  streaming preserves the older-reading position, and returning to the live
  tail works.
- Final focused tests, app typecheck, workflow validation/core/CI checks, and
  whole-diff review passed.
- User explicitly accepted the named baseline-suite, human IME, residual scan,
  and protocol-pagination gaps and requested commit and push.
