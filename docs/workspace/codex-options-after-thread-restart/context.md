# Context: `codex-options-after-thread-restart`

## Problem

Happy injects its option-chip instructions once per Codex thread. The CLI tracks
that with one process-wide boolean. If an interrupt timeout restarts app-server,
resuming the old thread can fail; the next message then creates a new thread,
but the stale boolean suppresses injection into that new thread.

## Accepted behavior

1. A Codex thread receives the Happy append prompt at most once.
2. A newly created replacement thread receives the append prompt even when an
   earlier thread in the same Happy session already received it.
3. Successfully resuming the same thread does not duplicate the prompt.
4. No app renderer, wire/session protocol, authentication, or mobile source is
   changed.

## Scope

- Track append-prompt injection by Codex thread identity instead of one global
  boolean.
- Cover same-thread and replacement-thread behavior with focused unit tests.
- Run the nearest CLI unit suite and build/typecheck.

## Out of scope

- Changing when the model chooses to offer options.
- Changing option XML parsing or rendering.
- Changing interrupt/reconnect policy or fixing the separate active-writer
  resume failure.
