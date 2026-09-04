# Publish Launch-Pinned Codex Effort Before the First Message

## Status and source

- Status: accepted for implementation
- Source: [GitHub Issue #103](https://github.com/myartings/happy/issues/103)
- Related authority: `docs/PRD.md#runtime-confirmed-codex-route-metadata`
- Dependencies: Issue #80 runtime-confirmed route projection and Issue #99
  launch-route preservation are present in the verified `origin/dev` baseline.

## Outcome

A fresh Happy Codex Session launched with a concrete model and effort creates
and publishes one App Server-confirmed effective pair before Happy displays or
sends the first user message. Creating this authority performs no inference
and injects no synthetic or empty user input.

## Behavioral contract

### Cold-start authority

1. Happy starts or resumes the Codex App Server and establishes the Session's
   thread before waiting for the first Happy message.
2. A fresh thread receives the launch model and launch effort through supported
   App Server configuration. `thread/start` remains the authority source: only
   its complete concrete `model` / `reasoningEffort` response may publish the
   effective pair.
3. Thread creation alone must not call `turn/start`, begin inference, emit a
   user message, or consume the first-message prompt path.
4. The confirmed pair is written atomically to Session metadata and projected
   through the existing daemon effective-route update before the message loop
   accepts the first outbound turn.
5. Missing, null, malformed, rejected, or incomplete App Server evidence stays
   fail-closed. Happy must not substitute CLI argv, Session requested state, or
   the global Medium default as effective evidence.

### First-message and explicit-change behavior

1. If the user does not touch route controls, Issue #99 omission semantics keep
   the launch pair sticky and the first `turn/start` uses the same model and
   effort.
2. An explicit model, effort, or combined selection before the first message
   is sent on that `turn/start`; existing effective metadata is cleared while
   the change is unconfirmed and the next complete App Server evidence becomes
   authoritative.
3. Resume, reconnect, and fork continue using their existing confirmation
   paths. Fresh eager creation must not create a second thread for the first
   message or alter replay/backfill behavior.

## Compatibility and constraints

- The global Codex model and effort defaults are unchanged.
- `modelMode` / `effortLevel` remain requested or synchronized UI state, not
  authority evidence.
- The Issue #80 complete-pair validators and daemon projection remain the only
  publication contract.
- Permission, sandbox, MCP server, service-tier, goal-command, resume, fork,
  reconnect, side-chat, and non-Codex behavior remain compatible.
- No new store, migration, daemon polling loop, empty prompt, or downstream
  `ai-coding-template#123` implementation is introduced.

## Acceptance criteria

- **AC1 — pre-message pair:** launching Luna/Max publishes an App
  Server-confirmed Luna/Max pair to Session metadata before the first message.
- **AC2 — pre-message projection:** the existing daemon projection exposes the
  same generation-bound pair before the first message.
- **AC3 — no inference:** cold initialization issues `thread/start` but no
  `turn/start`, user input, or synthetic prompt.
- **AC4 — unchanged first turn:** the first untouched message uses Luna/Max and
  does not create a second thread.
- **AC5 — explicit override:** an explicit pre-message model or effort change
  overrides the corresponding launch value and the next complete App Server
  evidence becomes authoritative.
- **AC6 — fail closed:** absent, rejected, malformed, or incomplete thread-start
  evidence never publishes the global Medium default or requested argv as the
  effective pair.
- **AC7 — lifecycle compatibility:** resume, reconnect, fork, side-chat, goal,
  permission, sandbox, MCP, and service-tier behavior remains compatible.
- **AC8 — complete cold-path evidence:** focused tests cover launch options,
  App Server thread configuration/response, Session metadata, daemon
  projection, first `turn/start`, and explicit transition behavior.

## Verification map

| Criteria | Planned evidence |
| --- | --- |
| AC1-AC3, AC6 | App Server client tests for effort configuration, complete/partial responses, and thread-without-turn behavior |
| AC1-AC5, AC7-AC8 | `runCodex` cold-start orchestration seam tests covering metadata, daemon projection, first turn, and explicit route changes |
| AC4-AC7 | Existing App message metadata, CLI remote-mode, resume/fork, and App Server lifecycle regression suites |
| Whole contract | CLI typecheck, applicable repository check, and independent Spec/Standards review of one pinned candidate |

## Risk controls and rollback

- Treat only complete App Server responses as authority and retain Issue #80's
  centralized pair validation.
- Bind the eager thread to the same launch model, effort, cwd, permission,
  sandbox, and MCP configuration that the first-turn lazy path used.
- Test no-turn/no-prompt behavior and one-thread reuse explicitly.
- Fail initialization without publishing false authority when App Server
  configuration or `thread/start` fails.
- Rollback restores lazy first-message thread creation and removes the eager
  orchestration tests; no persisted-data rewrite or server migration is needed.
