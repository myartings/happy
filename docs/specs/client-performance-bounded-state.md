# Client Performance Bounded State

## Boundary

This feature bounds and incrementally derives Happy client state. It preserves
the existing Session/message protocol and server behavior. Protocol-level
pagination is a separately gated follow-up, not an implicit part of this spec.

## Observable behavior

### Performance evidence

1. A repository-owned benchmark can generate Session collections of 100, 500,
   and 2,000 rows and message collections of 100, 1,000, and 5,000 items.
2. The benchmark reports deterministic work counters and retained-item counts;
   wall-clock measurements may be recorded as diagnostic context but are not a
   flaky pass/fail gate.
3. Production behavior is unchanged when diagnostics are disabled.

### Session index

4. The Session index stores normalized Session-row projections separately from
   the nested list presentation.
5. Updating one Session reuses projections for unchanged Sessions.
6. A Session moves in presentation order only when an ordering or grouping key
   changes.
7. Status-only updates do not reconstruct unrelated project and archive rows.
8. Search, archive visibility, flat/grouped presentation, pinned/favorite
   ordering, unread markers, and selected-row behavior remain correct.

### Conversation working set

9. Initial entry continues to load at most the latest 100 server messages.
10. Older history remains available through the existing backward-page API.
11. A hidden Session cache larger than 500 messages or an estimated 10 MiB of
    normalized payload is evicted as one cursor-consistent unit.
12. A Session with an active message queue, send controller, or pending outbox
    remains protected from this size eviction.
13. Reopening an evicted Session requests the latest server page and continues
    to expose older history through the existing backward-page API.
14. An opened Session is not sliced into a double-ended window: the existing
    API can page backward but cannot safely recover an evicted middle/newer
    boundary. Cache eviction never deletes server history.

### Message derivation

15. Completed turns produce immutable display projections reusable across
    updates to the active turn.
16. Streaming updates recompute the active turn and any directly affected
    boundary only; they do not regroup every completed turn.
17. Agent-turn copy text is generated when copy is requested, not eagerly for
    every message after every update.
18. Message targeting performs full-history indexing only while a target
    request exists.

### Rendering and input

19. Chat and Session lists retain virtualization and stable keys.
20. Render-window and scroll-event settings are selected from recorded native
    and desktop evidence; the accepted desktop starting point is a chat
    `windowSize` no greater than 9 unless verification proves it unsafe.
21. New-message anchoring, reading older history during streaming, scroll-to-
    bottom, prompt navigation, and message highlighting remain correct.
22. The composer remains isolated from Session-index and transcript-wide state;
    IME composition does not synchronously trigger those derivations.

## Compatibility and failure behavior

- Existing server and older clients remain compatible.
- Diagnostic or cache-policy failure falls back to the current latest-page and
  backward-pagination behavior; it must not corrupt durable history.
- A protected set larger than the configured budget may exceed the bound and
  must emit a development diagnostic rather than discard protected content.
- Protocol escalation requires a new decision/risk receipt backed by a profile
  showing a material remaining transport or server-contract bottleneck.

## Acceptance-to-evidence mapping

| Criteria | Evidence |
| --- | --- |
| 1–3 | Focused benchmark tests and documented fixture output |
| 4–8 | Session-index projection unit tests and SessionsList integration tests |
| 9–14 | Hidden-cache policy tests and existing sync pagination behavior |
| 15–18 | Turn projection and copy-on-demand tests |
| 19–22 | ChatList/component tests, desktop/native inspection, IME smoke evidence |
| Compatibility | Happy app typecheck, full app tests, repository workflow checks |

## Non-goals

- Session protocol, database, encryption, or cross-device synchronization
  changes.
- Automatic durable-history deletion.
- A wholesale FlashList migration.
