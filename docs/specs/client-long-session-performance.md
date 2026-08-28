# Client Long-Session Performance

## Status and precedence

Planned follow-up to `client-performance-hotspots` and
`client-performance-bounded-state` for the personal Happy client on `dev`.

The earlier work remains authoritative for demand-driven history loading,
hidden-session cache eviction, stable Session-row projections, completed-turn
projection reuse, on-demand copy text, and the current `FlatList` window.
This specification addresses the residual input, live-update, and visible
long-session costs measured after those changes landed.

## Problem and evidence

A long-lived packaged macOS/Tauri Session becomes progressively expensive even
when the composer itself is uncontrolled. In the measured long Session:

- per-character input latency was about 101 ms median and 335 ms P95, versus
  about 30 ms median and 50 ms P95 in a shorter Session;
- the WebContent process retained about 2.7 GiB and transiently exceeded
  3.7 GiB;
- garbage-collection samples were about 5.9 times higher than the shorter
  Session;
- `useDraft`'s cleanup runs on every `value` change and calls a storage path
  that persists every draft and rebuilds the Session list;
- live message application immediately drains each socket burst, then clones
  and sorts the complete message collection.

Official Happy work already establishes the intended direction: PR #1245
isolated the composer, PR #1242 introduced latest-page entry and backward
pagination, and open PR #1452 proposes frame-sized streaming coalescing. VS
Code PR #328926 independently demonstrates that virtualized rows still require
historical reconstruction work to be batched and terminal observers skipped.

## Goal

Keep typing, streaming, scrolling, and navigation responsive during a long
desktop Session while bounding the heavy in-memory state retained for an idle
visible transcript. Preserve draft correctness, complete server history,
message order, live delivery, permissions, tool state, and scroll anchoring.

## Existing behavior that must remain

- The composer remains an uncontrolled platform input with imperative read and
  clear behavior.
- The latest 100 messages remain the normal first page.
- Older history remains demand-driven through `before_seq`.
- Hidden Session caches retain the existing LRU/count/estimated-byte policy.
- Completed-turn display projections, copy-on-demand, prompt navigation,
  stable Session rows, and `FlatList` windowing remain enabled.
- Drafts remain device-local in the existing `session-drafts` persistence
  format.
- Durable messages remain encrypted on the server and are never deleted by a
  client memory policy.

## Scope

### 1. Draft lifecycle

The draft hook keeps the latest text and latest Session identity in refs.
Changing `value` may reset the trailing debounce but cannot execute the
unmount-save path.

For one continuous burst that starts from an empty draft:

- the empty-to-nonempty transition may persist once immediately;
- subsequent changes persist once after the configured quiet interval;
- background, inactive, Session switch, and true unmount flush the exact
  latest unsaved text at most once;
- sending or clearing cancels pending work and cannot resurrect the cleared
  draft;
- hydrating an already persisted draft does not rewrite it.

The AppState listener is stable for a mounted Session and reads current refs;
typing cannot unsubscribe and resubscribe it.

### 2. Draft persistence and Session-list projection

`updateSessionDraft` normalizes whitespace exactly as today and returns the
existing Zustand state when the normalized value is unchanged.

The existing module-owned `sessionDrafts` snapshot becomes the persistence
source. Updating one draft cannot enumerate all Session objects to reconstruct
that snapshot. The persisted MMKV key and JSON shape remain unchanged.

One changed draft may replace the affected Session object and its Session-row
projection, but it cannot reproject, regroup, or resort unrelated Session rows.
Unchanged Session and row identities remain stable. Deleting a Session removes
the same entry from the in-memory snapshot and persistence.

### 3. Live message coalescing

Socket-delivered messages for one Session are collected for a bounded
frame-sized interval before entering `applyMessages`.

- The default coalescing window is 24 ms and cannot exceed 32 ms.
- FIFO order is preserved across batches.
- At most one processing owner exists per Session.
- Waiting happens outside the per-Session lock; only the final synchronous
  splice/apply runs under the lock.
- Session deletion, cache generation changes, shutdown, and explicit flushes
  cancel or drain pending timers without applying stale messages.
- A message delayed by coalescing remains within the 32 ms presentation bound.

### 4. Incremental message collection

Applying a batch does not rebuild a sorted array through
`Object.values(messagesMap).sort(...)` when message creation timestamps are
unchanged.

The collection seam must support:

- replacing an existing streaming message at its stable position;
- inserting a new newest message;
- appending an older fetched page;
- deduplicating a replayed ID;
- applying a mixed batch in deterministic descending `createdAt` order;
- preserving unchanged `Message` object identities and the public
  `messages[]`/message lookup behavior.

Fallback rebuilding is allowed only for a detected invariant violation and
must emit a development diagnostic. It cannot become the normal streaming
path.

### 5. Visible Session tail rebase

The existing hidden-cache policy does not bound a Session that remains visible
for hours. A visible cache therefore gains an idle tail-rebase policy with
hysteresis:

- evaluation starts after 750 retained messages or 20 MiB estimated normalized
  payload;
- a successful rebase targets at most 500 messages and 10 MiB, extended only
  enough to preserve a complete user/agent turn and tool/sidechain boundary;
- the policy may temporarily exceed the target while no safe boundary exists.

A rebase is eligible only when all of the following are true:

- the user is at the live tail and no message target or prompt jump is active;
- older history is not loading and the user is not reading an older viewport;
- no Session message queue, send controller, pending outbox item, permission
  decision, or mutable tool call is active;
- the composer is not composing text and the Session has been quiet for the
  configured idle interval.

The replacement is built as a staging tail from the existing latest-page API,
with the current AgentState, outside the live store. It becomes visible through
one atomic swap only when cache generation and highest observed `seq` still
match the snapshot used to start the build.

If the Session changes, a cursor advances, the boundary is unsafe, fetching or
decryption fails, or the user leaves the live tail, the candidate is discarded
and the old state remains untouched. A later idle interval may retry.

After a successful rebase:

- the latest visible message IDs and content are unchanged;
- the reducer, message lookup, ordered array, and oldest/newest cursors describe
  the same retained tail;
- `hasMoreOlder` is true when older server history exists;
- scrolling upward reloads the discarded contiguous head with `before_seq`;
- no blank transcript, scroll jump, draft loss, send loss, or durable-history
  deletion occurs.

### 6. Diagnostics and rollout

Repository-owned deterministic counters cover draft persistence calls,
Session-row reprojections, queue batches, full-sort fallbacks, retained message
count, estimated bytes, rebase attempts, successful swaps, and aborted swaps.
Production diagnostics remain disabled unless the existing development logging
path is enabled.

The implementation lands in independently reversible slices. Tail rebase is
enabled only after focused tests, complete applicable client tests, typecheck,
whole-diff review, and a packaged macOS/Tauri long-Session smoke pass.

## Performance budgets

Deterministic budgets are release gates; wall-clock and process-memory values
are packaged-runtime acceptance evidence rather than flaky unit-test gates.

| Signal | Required result |
| --- | --- |
| 100-character burst inside one debounce interval | At most two draft persistence calls: initial nonempty and trailing flush |
| Unchanged normalized draft | Zero persistence, Session replacement, list projection, or subscriber-visible state change |
| 100 streaming updates arriving inside one coalescing window | One `applyMessages` batch, FIFO preserved |
| Update to one existing streaming message in a 5,000-message fixture | No full collection sort; unchanged message identities retained |
| Safe visible-tail rebase | Retained tail at or below target unless one complete boundary requires a documented excess |
| Long-Session packaged typing | P95 no more than 2x the short-Session control and no more than 100 ms in the same run |
| Rebase memory evidence | WebContent RSS drops materially from the same-session pre-rebase baseline and does not monotonically grow across three eligible cycles |

## Compatibility and failure behavior

- No Session protocol, server route, database, encryption, authentication,
  authorization, permission semantics, or cross-device synchronization change.
- No local persistence migration or new durable key is required.
- Old clients and the official baseline remain compatible.
- A draft flush failure leaves the latest value available for a later lifecycle
  flush; it cannot report a false saved value.
- A scheduler failure drains through the existing immediate path rather than
  dropping or reordering messages.
- An incremental-order invariant failure uses the diagnostic rebuild fallback.
- A tail-rebase failure is fail-open for memory and fail-closed for correctness:
  retain the old cache and retry later.

## Edge cases

- One-character draft, whitespace-only draft, emoji, CJK, combining text, and
  IME composition.
- Background or true unmount during an active debounce.
- Rapid Session A → B → A navigation with pending draft timers.
- Send/clear on the same tick as the debounce or AppState transition.
- Remote socket replay, reconnect burst, local echo, and cache eviction while a
  coalescing timer exists.
- Multiple updates to the same message in one batch.
- Equal timestamps, older-page duplicates, and mixed older/live batches.
- Pending permission, active sidechain, incomplete tool result, or one very
  large tool output near a tail boundary.
- Prompt target loading while a rebase becomes eligible.
- Rebase candidate invalidated by a new socket `seq` before swap.
- Offline/decryption failure and server history shorter than the target.

## Acceptance criteria and verification map

| ID | Verifiable behavior | Required evidence |
| --- | --- | --- |
| AC1 | Value changes do not execute the unmount flush | Hook lifecycle test with fake timers and rerenders |
| AC2 | Burst, idle, AppState, Session switch, unmount, hydrate, send, and clear draft semantics are exact | Hook tests with call counts and latest-value assertions |
| AC3 | Unchanged draft is a true no-op and one changed draft does not scan/reproject unrelated Sessions | Pure storage/projection tests at 100, 500, and 2,000 Sessions |
| AC4 | Existing `session-drafts` data loads, updates, and deletes without migration | Persistence compatibility tests |
| AC5 | Coalescing preserves FIFO and bounds one-window bursts to one application | Fake-timer scheduler tests |
| AC6 | Locks, cache generations, deletion, and teardown cannot apply stale queued messages | Sync concurrency/lifecycle tests |
| AC7 | Existing-message updates, newest inserts, older-page appends, duplicates, and mixed batches remain correctly ordered | Ordered collection property and fixture tests |
| AC8 | Normal 5,000-message streaming updates perform no full sort and retain unaffected identities | Deterministic performance counter test |
| AC9 | Tail policy observes count/byte hysteresis and every busy/reading/composition protection | Pure policy matrix tests |
| AC10 | Staged tail replacement is atomic and aborts on generation, cursor, boundary, fetch, decrypt, or viewport changes | Sync staging and race tests |
| AC11 | Successful rebase preserves latest content, reducer/lookups/cursors, complete boundaries, and older reload | Storage/reducer/pagination integration tests |
| AC12 | Prompt navigation, message highlighting, copy, permissions, tool groups, scroll anchoring, and return-to-tail remain correct | Existing focused suites plus new mounted ChatList tests |
| AC13 | Hidden-cache limits and prior Session/turn projection optimizations remain enabled | Existing client-performance regression suites |
| AC14 | Happy App typecheck and complete applicable tests pass, or every unrelated baseline gap is named and accepted | Exact validation ledger |
| AC15 | Packaged macOS/Tauri long- and short-Session typing, streaming, scroll, RSS, and three-cycle evidence meets the runtime budgets | Metadata-backed process measurements and interaction log |
| AC16 | Whole-diff review finds no unresolved correctness, data-integrity, concurrency, scroll, or rollback issue | Review receipt and post-review focused verification |

## Non-goals

- Replacing `FlatList` with FlashList or another list engine.
- Restoring background full-history prefetch.
- Deleting, compacting, or summarizing durable server history.
- Changing model context, CLI transcript files, or provider payloads.
- Adding a synchronized performance setting.
- Redesigning Session navigation, tool cards, or the composer.
- Publishing an upstream PR, installing a build, or distributing a release
  without separate authorization.

## Accepted uncertainty

- Exact WebContent RSS varies with WebKit and message payload shape, so
  deterministic retained-item/byte counters are authoritative and RSS is a
  same-run differential signal.
- A pathological unfinished tool or sidechain can force the visible tail above
  the normal target; correctness wins and the excess is diagnosed.
- The staging builder may initially reuse the existing reducer rather than a
  new normalized model, provided the atomicity and boundary criteria are met.

## Rollback

- Draft lifecycle and draft projection changes can be reverted independently.
- Streaming coalescing can return to immediate drain without changing stored
  state.
- Incremental collection can return to the diagnostic full rebuild.
- Tail rebase can be disabled while keeping hidden-cache eviction and all
  earlier performance work intact.
- No rollback requires data migration, server action, or durable-history repair.
