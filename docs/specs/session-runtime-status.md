# Session Runtime Status

## Goal

Make the existing session status row state the runtime condition plainly so a
user can tell whether a session is running, idle, waiting for permission, or
disconnected without inferring state from the absence of chat messages.

## Accepted behavior

- An online session with `thinking=true` displays the localized equivalent of
  **Running** with the existing pulsing blue indicator.
- An online session with a pending permission request displays the existing
  permission-required state, which takes precedence over running.
- An online session with no pending permission and `thinking=false` displays
  the localized equivalent of **Idle**.
- An offline session continues to display its last-seen state.
- The status text is deterministic; it does not rotate through playful activity
  words that obscure the underlying state.

## Boundaries

- Reuse the current presence, thinking, and permission signals.
- Do not change the session protocol, server, encryption, persistence, or
  heartbeat frequency.
- Do not claim that a running session is making semantic progress, estimate a
  percentage, infer a stuck state, or expose command contents.

## Risk assessment

- Blast radius is limited to status text in the personal Happy client; no user
  data, money, permissions, or external writes are affected.
- The material failure mode is a misleading label. Permission-required must
  therefore retain priority over running, and disconnected must retain priority
  over every online state.
- The change is immediately reversible by reverting the app utility and
  translation entries. Unit coverage and a real-session smoke check control the
  risk of false state presentation.

## Verification

- Unit-test the four state mappings and precedence rules through a pure resolver.
- Run the focused test and Happy App typecheck.
- Install the personal client and verify a real Codex session shows Running
  during a long command and Idle after the turn completes.
