# Client Performance Hotspots

## Goal

Remove three measured sources of avoidable work when opening and navigating a
Happy session, without changing visible behavior or synchronization contracts.

## Acceptance criteria

1. Prompt Navigator uses already-loaded messages immediately and does not fetch
   a 500-message history page on ordinary session entry.
2. Older prompt history loads on demand in pages of 100 and prompt jumps retain
   reliable navigation without temporarily rendering 500 chat rows.
3. Entering a session performs one Git status invalidation; reconnect refreshes
   visible messages without starting a second Git status scan.
4. Encryption caches maintain least-recently-used order with O(1) Map-order
   touch and eviction rather than scanning every cache entry on insertion.
5. Existing session loading, prompt navigation, reconnect recovery, encryption
   cache limits, and cache clearing behavior remain covered by tests.

## Boundaries

- No protocol, persistence format, server, or cross-device behavior changes.
- No background history prefetch.
- No visual redesign of the Prompt Navigator.
- No desktop build, installation, merge, or push in this task.

## Rollback

Revert the single feature commit. The changes are client-local scheduling and
cache implementation details and do not migrate stored data.
