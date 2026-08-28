# Journal: `client-long-session-performance`

## `2026-08-28`

- Started workflow.
- Confirmed no active prior workflow and created a Feature-intensity residual
  performance workflow on the clean `quiet-forest` worktree.
- Reviewed official Happy issues/PRs, Codex, VS Code/Copilot, OpenCode, and
  Gemini CLI long-session performance evidence.
- Reconciled the plan against completed personal-client work: demand-driven
  history, hidden-cache limits, stable Session/turn projections, copy-on-demand,
  and ChatList tuning already exist and remain outside the new implementation.
- Located the residual paths in current `dev`: `useDraft` cleanup depends on
  `value`; `updateSessionDraft` scans all Sessions and rebuilds the list; live
  queues drain immediately; `applyMessages` clones and sorts the complete map.
- Accepted a client-only staged approach: exact draft correction, incremental
  draft projection, 24 ms live-message coalescing, ordered message updates, and
  safe idle visible-tail staging with atomic generation/seq-validated swap.
- Added the accepted feature specification, AC1–AC16 verification map, and
  dependency-ordered G0/T1–T7 task plan. No product code, tracker, PR, commit,
  push, installation, or release action was performed.
- Entered implementation and completed T1 without changing product behavior.
  Added an explicit, in-memory diagnostics capture that is inactive by default,
  covers all accepted residual counters, and preserves the 100/500/2,000
  Session plus 100/1,000/5,000 message fixture matrix.
- Added the first real hook RED. A mounted composer changing from `a` to `ab`
  to `abc` currently persists `ab` before the 2-second debounce because the
  supposed unmount effect cleans up on every value change. The focused test
  fails only on that observed extra write; T2 owns the GREEN.
- Verified the diagnostics tests (4 passed), the intended hook RED (1 intended
  failure), TypeScript (passed with a temporary ignored same-HEAD workspace
  dependency link), and `git diff --check` (passed). No dependency installation,
  message send, persisted draft mutation, commit, push, install, or release was
  performed.
- Completed T2 through serial RED→GREEN tracer bullets. `useDraft` now keeps
  latest value and Session identity in refs, resets the saved baseline per
  Session, separates value cleanup from lifecycle flush, cancels stale timers,
  prevents hydrate/clear resurrection, and keeps one AppState listener per
  mounted Session.
- The tracer bullets exposed and corrected seven concrete behaviors: per-value
  intermediate writes, cross-Session text contamination, post-clear timer
  resurrection, duplicate background writes, hydration overwriting with an
  empty value, A→B→A saved-baseline leakage, and an unwired real write counter.
  Failed persistence still leaves the latest value retryable.
- T2 verification passed: focused hook plus diagnostics 15/15, all hook suites
  73/73, and Happy App TypeScript. The temporary ignored same-HEAD workspace
  dependency link was removed by trap cleanup. No dependency install, commit,
  push, app install, message send, persisted live draft mutation, or release was
  performed.
- Completed T3 through serial RED→GREEN public-storage tracer bullets.
  `updateSessionDraft` now treats an unchanged normalized value as an exact
  Zustand no-op, persists from the module-owned `sessionDrafts` snapshot, and
  patches one indexed Session row plus only its containing object chain without
  regrouping, resorting, or scanning unrelated Sessions.
- The tracer bullets exposed and corrected five concrete behaviors: no-op
  writes/full-list rebuilds, loss of not-yet-hydrated drafts, replacement of
  unaffected project containers, deletion-time MMKV reload, and unwired real
  storage counters. Draft read/write/reprojection diagnostics were consequently
  moved from the hook seam to the actual storage boundary.
- Added compatibility and edge coverage for the unchanged `session-drafts`
  key/flat JSON shape, CJK/emoji values, whitespace clearing, repeated clear,
  archived direct rows, authoritative deletion, and 100/500/2,000 Session
  identity/order matrices. Existing project-todo and GitHub-issue insertion
  callers remain green.
- T3 verification passed: the combined T2/T3 gate is 70/70, the caller/list
  projection gate is 43/43, storage failure atomicity/retry is covered, and
  Happy App TypeScript passes. All four configured workflow-check commands also
  pass, with only the expected future T4–T7 gates pending. The temporary
  workspace dependency link was removed by trap cleanup. No dependency install,
  commit, push, app install, message send, persisted live draft mutation, or
  release was performed.
- Completed T4 through public Sync and focused scheduler RED→GREEN tracer
  bullets. Socket messages now coalesce independently per Session for 24 ms;
  timers only create FIFO-ready batches, and the final generation-validated
  apply runs inside the existing `AsyncLock`. Local optimistic/outbox messages
  retain the prior immediate path through an explicit scheduler flush.
- The tracer bullets exposed and corrected three concrete behaviors: 100 socket
  updates were published immediately instead of once at 24 ms; timer creation
  failure threw instead of falling back to immediate FIFO drain; and replacing
  an in-flight cache generation could temporarily create two owners for one
  Session. The scheduler now serializes owners across generation replacement.
- Added deterministic coverage for Session-isolated timers, FIFO batches,
  arrivals during an active drain, explicit flush and shutdown, 32 ms maximum,
  timer-failure fallback, generation invalidation, pending and in-flight cancel,
  deletion, reconnect bursts, and the proof that the 24 ms wait does not hold
  the per-Session lock. `messageQueueBatches` is recorded only at a successful
  generation-current apply boundary.
- T4 verification passed: focused scheduler/realtime/cache suites are 24/24,
  the combined T1–T4 gate is 94/94, Happy App TypeScript passes, and all four
  configured workflow-check commands complete with only expected future gates.
  The temporary workspace dependency link was removed by trap cleanup. No
  dependency install, commit, push, app install, message send, persisted live
  draft mutation, or release was performed.
- Completed T5 through a public storage RED and focused ordered-collection
  tracer bullet. A single tool-result replacement in a 5,000-message Session
  called the old full-array sort once; the new collection replaces it by stable
  indexed position, sorting only bounded new batches and merging them with the
  retained descending history.
- The collection keeps its positional index outside Zustand, publishes fresh
  arrays/lookups only when messages change, preserves unaffected `Message`
  identities, and drops its per-Session index on cache eviction or deletion.
  External source replacement is safely reindexed; length, map, order,
  timestamp, or position violations route through the retained full rebuild,
  development warning, and `messageSortFallbacks` diagnostic.
- Added deterministic coverage for replacements, newest/middle/equal-time
  inserts, older-page appends, empty and duplicate replays, repeated IDs, 100
  legacy-sort-equivalent mixed batches, tool results, permission transitions,
  5,000-message identity preservation, and fallback snapshot immutability.
- T5 verification passed: the focused suite is 9/9, the combined T1–T5 and
  reducer/grouping/turn equivalence gate is 199/199, Happy App TypeScript
  passes, and all four configured workflow-check commands have zero failures
  with only expected future T6–T7 gates. The temporary dependency link was
  removed by trap cleanup. No dependency install, commit, push, app install,
  message send, persisted live draft mutation, or release was performed.
- Completed T6 through serial policy, staging, atomic-storage, UI-signal, and
  Sync race tracer bullets. Visible caches are evaluated only after the strict
  750-message/20 MiB trigger and a two-second quiet interval, then retain at
  most 500 messages/10 MiB unless extending to the older user prompt is needed
  to keep a complete turn and its tool/sidechain tree.
- ChatList and composer state is aggregated by mounted source: every transcript
  must be at the live tail, while any older-reading, target, viewport, input,
  permission, queue, outbox, mutable-tool, or thinking state blocks staging.
  Web composition events receive an explicit guard; native text activity stays
  protected through the same quiet interval.
- A fresh latest-page reducer is built outside Zustand, including the current
  AgentState. Random staged IDs are mapped back to visible IDs by server record
  identity or optimistic `localId`, and deep public-message equivalence must
  pass before commit. Any boundary, fetch, decrypt, reducer, generation, seq,
  Session, UI revision, or store-entry mismatch keeps the old cache untouched.
- Successful replacement publishes messages, lookup, reducer, pagination, and
  the new oldest cursor as one observable transition. The real integration
  fixture reduces 760 messages to 500 with cursor 261, retains newest IDs and
  content, and reloads 100 discarded messages with `before_seq=261`; seq,
  fetch, and decrypt failures produce zero swaps and named abort diagnostics.
- T6 verification passed: the combined T1–T6 gate is 234/234, Happy App
  TypeScript passes, AC9–AC13 regressions are green, and all four configured
  workflow checks have zero command failures. Only T7 full integration,
  whole-diff review, and packaged macOS acceptance remain. The temporary
  same-HEAD workspace link was removed by trap cleanup. No dependency install,
  commit, push, app install, message send, persisted live draft mutation, or
  release was performed.
- Completed the T7 product implementation and whole-diff review. The complete
  Happy App run collected 191 files/1,631 tests; 187 files/1,616 tests passed,
  while four unmodified baseline files retain 15 stable failures involving
  Studio expectations and one absent settings route. Focused implementation
  evidence remains 234/234, exact Happy App/server typechecks pass, and the
  post-review affected gate passes 17 files/83 tests with no unresolved
  blocking/high/medium review finding.
- Built the exact workspace dev app without installation. The configured
  `tauri:build:dev` compilation reaches bundling but cannot use the missing
  Bulka Developer ID identity; the supported app-only `--no-sign` validation
  build succeeds at the expected Tauri target with arm64 executable SHA-256
  `895ae821e66280145885cb371e0a87213aa87a5a97495d8fab8cc6a1d6728689`.
- Launched only workspace validation instances and proved exact PID/executable
  identity without touching the installed `/Applications/Happy (dev).app`
  process. A final 10-second idle sample held the app at 94,896 KiB RSS and its
  associated WebContent at 131,888-131,904 KiB, both at 0.0% CPU.
- Packaged interaction acceptance stopped at the approved UI evidence boundary:
  Computer Use returned `cgWindowNotFound` for both the exact bundle and a
  hash-identical uniquely named copy, while metadata window capture could
  identify the PIDs/windows but lacked permission to create an image. No
  alternate UI automation, message send, or draft mutation was attempted.
  Long/short typing P95, streaming/scroll smoke, and three eligible rebase RSS
  cycles therefore remain explicitly unavailable rather than being inferred.
- Closed every validation-only process, left installed PID 70203 running, and
  moved the generated uniquely named automation copy to the recoverable Trash.
  Workflow adoption, 14 workflow-core tests, 14 workflow-CI tests, strict
  audit, and tracked/untracked whitespace checks pass. The workflow is now in
  verification with implementation/review passed and check/finish awaiting the
  user's explicit acceptance of the two named evidence gaps.
- The user explicitly accepted both named verification gaps on `2026-08-28`.
  Recorded `check=accepted_gaps` without misrepresenting the unmeasured AC15
  budgets as passed, entered finish, and retained the full consequences in the
  validation ledger. No installation, commit, push, PR, or release was
  authorized by that acceptance.
