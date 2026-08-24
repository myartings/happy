# Finish Review: `client-performance-bounded-state`

## Summary

Completed the bounded client-performance slice for large Session indexes and
long transcripts. The client now reuses stable Session-row and completed-turn
projections, builds agent-turn copy text on demand, indexes message targets only
when requested, evicts oversized hidden transcript caches as cursor-consistent
units, and uses a smaller chat render window with lower scroll-event frequency.

## Verification

- 7 focused files / 36 tests passed in the final pre-commit run; the broader
  focused verification ledger records 74 passing changed-scope tests.
- `pnpm --filter happy-app typecheck` passed.
- Workflow validation, core tests, and workflow-CI regression tests passed.
- Windows/Tauri `Happy (dev)` built, installed through the recoverable devtools
  flow, matched the build artifact SHA-256, launched from the expected path,
  loaded the active long transcript, preserved older-reading position during
  streaming, and returned to the live tail.
- The user explicitly accepted the recorded unrelated baseline-suite failures,
  real-IME human confirmation gap, residual lightweight linear scans, and
  protocol-gated double-ended pagination limitation on 2026-08-25.

## Whole-diff review

Passed. The final review found no blocking correctness, compatibility,
data-integrity, security, concurrency, or rollback issue. Product changes stay
inside the client, durable history is never deleted, active queue/send/outbox
work is protected, and server/protocol behavior is unchanged.

## Rollback or mitigation

- Revert the atomic feature commit to restore the previous projection, cache,
  and ChatList behavior.
- The Windows installer flow retained recoverable `Happy (dev)` backups under
  `%LOCALAPPDATA%\Happy Devtools\backups` and verified the installed executable
  before leaving it running.
- If hidden-cache reload or scroll behavior regresses, disable the new cache
  eviction seam first; server history remains authoritative and retrievable.

## Lessons promoted

- None. The implementation-specific decisions and evidence are durable in this
  workflow, spec, and task set; no broader repository rule was justified.

## Follow-up

- Collect a runtime profile only if the installed client still shows material
  Session-list or long-transcript latency.
- Escalate to normalized ordering or a double-ended protocol cursor only when
  that profile attributes a material residual bottleneck to those seams.
