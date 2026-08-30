# Client Long-Session Performance Tasks

## Objective

Implement `docs/specs/client-long-session-performance.md` as a residual
performance correction on the personal `dev` client. Preserve all behavior
already delivered by `client-performance-hotspots` and
`client-performance-bounded-state`.

## Dependency graph

```text
G0 Scope, decisions, and risk assessment
└─ T1 Deterministic residual baseline and RED fixtures
   ├─ T2 Draft lifecycle and flush correctness
   │  └─ T3 Incremental draft persistence and row projection
   └─ T4 Per-Session live-message coalescing
      └─ T5 Incremental ordered message collection
         └─ T6 Safe visible-tail staging and atomic rebase
            └─ T7 Integration, review, packaged macOS acceptance, rollout
```

T2 and T4 are independent after T1, but the main session is the default owner.
No writer delegation or batch queue is planned. T3 and T5 both touch storage and
must land serially. T6 starts only after T3–T5 are green.

## Global boundaries

- Base: current `quiet-forest` worktree from personal `dev`.
- Client-only: no server, protocol, database, encryption, authentication,
  authorization, cross-device sync, or durable-history deletion.
- Preserve the `session-drafts` key and JSON shape.
- Preserve latest-100 entry, demand-driven older paging, hidden-cache LRU,
  Session/turn projection caches, copy-on-demand, and ChatList window settings.
- Do not create a tracker item, PR, commit, push, install, or release without
  separate authorization.
- Every task records exact commands and outcomes in the active workflow.

## G0 — Scope, decisions, and risk assessment

Status: completed by planning.

### Scope

- Link the accepted spec and task plan.
- Record architecture decisions, local-only tracker reason, role contexts,
  compatibility boundary, rollback, and verification family.
- Classify as Feature intensity with decisions required and risk not required.

### Acceptance

- Workflow gates permit implementation.
- No material decision is open.
- Risk evidence explicitly excludes every `.ai/project.json` trigger.

### Validation

- `python3 scripts/workflow-state.py status client-long-session-performance`
- `python3 scripts/workflow-audit.py --strict --require-active client-long-session-performance`

## T1 — Deterministic residual baseline and RED fixtures

Status: completed on `2026-08-28`; the first behavior RED is intentionally
left for T2 to turn green.

### Scope

- Extend repository-owned performance fixtures with draft write counts,
  Session-row reprojection counts, queue-batch counts, sort-fallback counts,
  retained message count/bytes, and rebase attempt/swap/abort counts.
- Preserve the previous 100/500/2,000 Session and 100/1,000/5,000 message
  matrix.
- Add one meaningful failing test for the current per-value cleanup before
  production edits. Add the full-draft-rebuild, immediate-queue-drain, and
  full-sort REDs one at a time when T3, T4, and T5 begin.

### Likely files

- `packages/happy-app/sources/features/client-performance/clientLongSessionDiagnostics.ts`
- `packages/happy-app/sources/features/client-performance/clientLongSessionDiagnostics.test.ts`
- `packages/happy-app/sources/hooks/useDraft.test.ts`
- `docs/workspace/client-long-session-performance/validation.md`

### Acceptance

- Counters are deterministic and disabled from normal production behavior.
- The active RED fails for the intended missing behavior rather than test-environment
  collection errors.
- The live macOS baseline is recorded without sending a message or altering a
  persisted draft.

### Validation

- Focused performance fixture command.
- `pnpm --filter happy-app typecheck`

### Stop conditions

- If the current branch no longer reproduces a targeted path, update the spec
  with evidence before changing code.
- Do not use wall-clock time as the sole automated assertion.

## T2 — Draft lifecycle and flush correctness

Status: completed on `2026-08-28`; AC1–AC2 are green and T3 may begin.

### Depends on

- T1.

### Scope

- Make `useDraft` keep latest value/Session/save state in refs.
- Separate trailing debounce cleanup from true unmount flush.
- Keep one stable AppState listener per mounted Session.
- Cancel pending work on send/clear and prevent stale Session writes.

### Allowed files

- `packages/happy-app/sources/hooks/useDraft.ts`
- New `packages/happy-app/sources/hooks/useDraft.test.ts`
- Narrow test helpers required to mount the hook

### Acceptance

- AC1 and AC2 pass.
- A 100-character burst produces at most the initial and trailing saves.
- Background, Session switch, unmount, hydrate, send, clear, and fake-timer
  races save the exact expected value and nothing else.
- No production component outside the hook/composer seam changes.

### Validation

- `pnpm --filter happy-app exec vitest run sources/hooks/useDraft.test.ts`
- `pnpm --filter happy-app typecheck`

### Rollback

- Revert the hook-only slice; persistence and sync remain unchanged.

## T3 — Incremental draft persistence and Session-row projection

Status: completed on `2026-08-28`; AC3–AC4 are green and T4 may begin.

### Depends on

- T2.

### Scope

- Use the existing module-owned `sessionDrafts` snapshot as the persistence
  source instead of scanning `state.sessions`.
- Add normalized-value no-op behavior.
- Update only the affected Session and `hasDraft` row projection; retain
  unrelated row identities and ordering.
- Keep initial Session hydration and Session deletion synchronized with the
  same snapshot.

### Allowed files

- `packages/happy-app/sources/sync/storage.ts`
- `packages/happy-app/sources/sync/persistence.ts` only for compatibility tests,
  not a format change
- A focused pure draft/projection helper under
  `packages/happy-app/sources/features/client-performance/` if needed
- New focused storage/persistence tests

### Acceptance

- AC3 and AC4 pass at every Session fixture size.
- Unchanged draft returns the original Zustand state and performs zero MMKV
  writes.
- One changed draft rebuilds at most one row and never regroups/resorts the
  Session list.
- Existing project-todo and GitHub-issue draft insertion callers remain correct.

### Validation

- Focused draft storage, persistence, Session-row, project-todo, and GitHub
  issue tests.
- `pnpm --filter happy-app typecheck`

### Rollback

- Restore the previous aggregate rebuild while retaining the T2 lifecycle fix.

## T4 — Per-Session live-message coalescing

Status: completed on `2026-08-28`; AC5–AC6 are green and T5 may begin.

### Depends on

- T1.

### Scope

- Introduce a testable per-Session scheduler with the accepted 24 ms window.
- Wait outside `AsyncLock`, drain one FIFO batch inside it, and handle arrivals
  during/after a flush.
- Bind timers to cache generation and Session lifecycle.
- Drain or cancel explicitly on teardown so messages cannot be lost or applied
  to a deleted cache.

### Allowed files

- `packages/happy-app/sources/sync/sync.ts`
- New scheduler module/test under
  `packages/happy-app/sources/features/client-performance/` or `sources/sync/`
- Existing cache-policy/generation tests when extending lifecycle coverage

### Acceptance

- AC5 and AC6 pass.
- 100 same-window messages call `applyMessages` once in FIFO order.
- The scheduler never holds the Session lock while waiting.
- Deletion, generation change, reconnect burst, and timer races do not lose,
  duplicate, or stale-apply messages.

### Validation

- Focused scheduler and sync fake-timer tests.
- Existing realtime recovery and session cache policy tests.
- `pnpm --filter happy-app typecheck`

### Rollback

- Remove the scheduler and restore immediate queue drain; no stored state or
  protocol rollback is needed.

## T5 — Incremental ordered message collection

Status: completed on `2026-08-28`; AC7–AC8 are green and T6 may begin.

### Depends on

- T4.

### Scope

- Extract a focused ordered collection seam from `storage.applyMessages`.
- Preserve descending immutable `createdAt` order without normal-path full
  `Object.values(...).sort(...)` work.
- Support existing-message replacement, newest insertion, older-page append,
  duplicate replay, and mixed batches.
- Keep public selectors and unchanged Message identities stable.
- Retain a development-only invariant fallback and counter.

### Allowed files

- `packages/happy-app/sources/sync/storage.ts`
- New ordered message collection module/test under
  `packages/happy-app/sources/features/client-performance/`
- Reducer tests only when public behavior needs an equivalence fixture

### Acceptance

- AC7 and AC8 pass.
- Normal streaming replacement in a 5,000-message fixture records zero full
  sorts and preserves all unaffected object identities.
- Older paging, permissions, tool results, sidechains, todos, usage, and plan
  mode remain behaviorally equivalent.

### Validation

- Ordered collection property/fixture tests.
- Reducer and grouped-message equivalence tests.
- Existing client-performance baseline and turn projection tests.
- `pnpm --filter happy-app typecheck`

### Stop conditions

- If an invariant requires mutating prior Zustand snapshots or weakens selector
  correctness, stop and redesign the seam rather than hiding the mutation.

### Rollback

- Route all batches through the retained rebuild fallback while keeping T4
  coalescing enabled.

## T6 — Safe visible-tail staging and atomic rebase

Status: completed on `2026-08-28`; AC9–AC13 are green and T7 may begin.

### Depends on

- T3, T4, and T5.

### Scope

- Add a pure eligibility/boundary policy with count/byte hysteresis and every
  protection from the spec.
- Feed live-tail/older-reading/target/composition state through a narrow
  client-only seam.
- Build a fresh latest tail and reducer state in staging.
- Atomically swap only after generation/highest-seq validation.
- Restore older paging from the new retained boundary.
- Record attempts, abort reasons, successful retained count/bytes, and excess
  caused by a protected boundary.

### Allowed files

- `packages/happy-app/sources/sync/sessionMessageCachePolicy.ts`
- `packages/happy-app/sources/sync/sync.ts`
- `packages/happy-app/sources/sync/storage.ts`
- `packages/happy-app/sources/components/ChatList.tsx`
- `packages/happy-app/sources/-session/SessionView.tsx` only for the narrow
  composition/visibility signal
- New policy/staging helpers and focused tests under
  `packages/happy-app/sources/features/client-performance/`

### Acceptance

- AC9–AC13 pass.
- Every protected/busy/reading state prevents a swap.
- Generation or seq movement discards the candidate without touching live
  state.
- Successful swap is one store update, retains newest content and complete
  boundaries, and reloads discarded older history on demand.
- No send, permission, tool, prompt-target, highlight, copy, scroll-anchor, or
  hidden-cache regression.

### Validation

- Pure policy matrix and boundary fixtures.
- Staging success/failure/race integration tests.
- Mounted ChatList tests for live-tail, older-reading, target, and anchor state.
- Existing pagination, cache, reducer, grouping, copy, and prompt navigation
  suites.
- `pnpm --filter happy-app typecheck`

### Stop conditions

- No atomic swap if the staging reducer cannot prove complete tool/sidechain
  boundaries.
- No server/protocol change; a protocol need returns the workflow to planning
  with a new risk/decision assessment.

### Rollback

- Disable the visible-tail eligibility call. Hidden-cache eviction and T2–T5
  remain independent.

## T7 — Integration, review, packaged macOS acceptance, and rollout

Status: completed on `2026-08-28` with explicit user acceptance of two named
verification gaps: the unrelated four-file/15-test Happy App baseline and the
unavailable packaged interaction/three-rebase-cycle evidence. Product
implementation, deterministic verification, workspace bundle, startup/idle
sampling, and whole-diff review are complete; installation, commit, push, PR,
and release remain separate choices.

### Depends on

- T2–T6.

### Scope

- Run focused and complete deterministic verification.
- Review the whole diff for correctness, data integrity, concurrency, memory,
  scroll behavior, and rollback.
- Build the dev Tauri app and launch the workspace artifact without replacing
  `/Applications/Happy (dev).app` unless the user separately authorizes it.
- Repeat the same-run long/short typing protocol, streaming/scroll smoke,
  WebContent RSS/CPU/GC sampling, and three eligible tail-rebase cycles.
- Record exact baseline, post-change, and remaining gaps.

### Acceptance

- AC14–AC16 pass.
- Long-Session typing meets both the absolute and relative P95 budgets.
- Same-session memory drops materially after rebase and does not monotonically
  grow across three eligible cycles.
- No unresolved blocking/high/medium review finding remains.
- The user explicitly accepts packaged interaction evidence and any named
  unrelated baseline gap before finish.

### Deterministic validation

- Focused T2–T6 Vitest command recorded during implementation.
- `pnpm --filter happy-app typecheck`
- `pnpm --filter happy-app exec vitest run`
- `pnpm --filter happy-server typecheck`
- `python3 scripts/validate-happy-workflow.py`
- `python3 scripts/test-workflow-core.py`
- `python3 scripts/test-workflow-ci.py`
- `python3 scripts/workflow-audit.py --strict --require-active client-long-session-performance`
- `git diff --check`

### Packaged validation

- `pnpm --filter happy-app tauri:build:dev`
- Launch the exact workspace bundle from
  `packages/happy-app/src-tauri/target/release/bundle/macos/Happy (dev).app`.
- Capture exact executable paths, process IDs, WebContent RSS/CPU samples,
  input-latency distribution, retained counters, and interaction notes.
- Close only the workspace validation process and restore any temporary UI
  state. Do not send messages or leave drafts.

### Finish boundary

- Installation, commit, push, PR creation, or distribution remains a separate
  explicit user choice after validation and review.
