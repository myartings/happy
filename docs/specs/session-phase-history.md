# Session Phase-Aware History

## Status

Accepted feature contract for preserving provider-declared assistant message
phases across Happy's synchronized session pipeline and using those phases to
present compact, non-destructive conversation history.

## Problem

Codex App Server distinguishes intermediate `commentary` from
`final_answer`, but Happy drops that field while mapping the provider event to
its session protocol. The App later guesses that the newest assistant text in
each turn is final and folds every older assistant text with tool activity.
This can make substantive history appear replaced by the latest reply.

## Scope

- Carry supported assistant text phases through Happy Wire, Codex historical
  and live mappers, App normalization, reducer state, and display messages.
- Collapse only explicitly classified commentary and associated tool activity
  after an explicitly classified final answer completes the turn.
- Keep final answers and unclassified assistant text visible.
- Preserve existing tool grouping, interactive-question, attachment, thinking,
  permission, ordering, synchronization, and pagination behavior.

## Non-goals

- No database or stored-message migration.
- No server API, encryption, authorization, or provider execution change.
- No attempt to infer phases for Claude, Gemini, legacy Codex records, or
  unknown future phase values.
- No change to the existing 100,000-character session tool-output contract.

## Data contract

Assistant text session events may carry an optional phase with one of two
values: `commentary` or `final_answer`. The field is optional and additive.
Producers omit unknown values. Consumers treat absence as `unknown` and must
not infer that an unclassified assistant message is commentary.

The phase must survive:

```text
Codex App Server item
  -> Codex session envelope
  -> normalized App message
  -> reducer message
  -> AgentTextMessage
  -> grouped conversation display
```

## Presentation behavior

- While a turn is active, commentary and tool activity remain visible.
- After an explicit final answer exists, that final answer stays in the main
  timeline and explicitly phased commentary plus non-interactive tool activity
  may form one collapsible work group.
- Unclassified assistant text remains a normal timeline message.
- Turns without an explicit final answer do not create an agent-work group.
- Existing adjacent-tool grouping may still apply independently.
- Display grouping never deletes or mutates source messages.

## Compatibility and risk controls

- Older payloads omit phase and continue to parse.
- Older clients may strip the additive field and retain their previous display
  behavior; no synchronized data becomes unreadable.
- Unknown provider values are omitted at the producer boundary.
- Rollback consists of removing phase emission/consumption; stored messages
  remain valid because the field is optional.

## Acceptance criteria

1. Happy Wire accepts supported optional phases and rejects unsupported values.
2. Historical and live Codex agent messages preserve supported phases.
3. App normalization and reducer conversion expose the phase on agent text.
4. A final answer remains visible while explicit commentary and tools form a
   collapsible work group.
5. Unclassified assistant text is never folded merely because a newer text
   exists in the same turn.
6. A turn without an explicit final answer remains ungrouped at the agent-work
   level.
7. Existing interactive-question, attachment, thinking, and disabled-grouping
   behavior remains green.

## Evidence mapping

| Criterion | Evidence |
| --- | --- |
| 1 | `packages/happy-wire/src/sessionProtocol.test.ts` |
| 2 | `packages/happy-cli/src/codex/__tests__/sessionProtocolMapper.test.ts` and Codex App Server client tests |
| 3 | App raw-message and reducer tests |
| 4-7 | `packages/happy-app/sources/hooks/useGroupedMessages.test.ts` plus focused App tests |
