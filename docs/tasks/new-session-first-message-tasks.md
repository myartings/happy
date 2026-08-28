# Task: Preserve the first message when starting a session

## Plan

### Goal

Starting a session with text or attachments must either queue that first message in the created session or leave the draft intact and clean up the unusable empty session.

### Scope

- Make `sync.sendMessage` report whether it queued a message locally.
- Make both new-session launch paths wait for that result before clearing the draft or navigating.
- Reuse the existing stop/kill/archive fallback when a created session cannot accept its first message.

### Out of scope

- Session protocol or server API changes.
- Delivery acknowledgement beyond the existing local outbox contract.
- New UI or translation copy.

## Verify

- [x] A successful first-message enqueue clears the draft and opens the new session.
- [x] A rejected first-message enqueue preserves the draft, does not navigate, and cleans up the empty session.
- [x] The focused new-session hook tests pass.
- [x] Happy App typecheck and the nearest applicable test family pass.
- [x] The whole diff contains no unrelated, generated, credential, or runtime files.

## Progress

- 2026-08-28: contract created; status `planned`.

## Finish

Status: `complete`

### Outcome

The first message is now proven to be in the local outbox before the draft is cleared and the new session is opened. Failed or canceled enqueue attempts preserve the draft and reclaim the empty session.

### Evidence

| Command or review | Result | Notes |
| --- | --- | --- |
| Focused Vitest files | `33 passed` | New-session hook and Sync enqueue result coverage. |
| Configured typechecks | `passed` | Happy App and Happy Server. |
| Whole-diff review | `passed` | No blocking finding. |

### Remaining limits

- Five unrelated Studio/flat-list test files still fail in the repository-wide App suite; see workflow `validation.md`.

### Reusable learning

- Do not clear a launch draft based only on successful session creation; require a positive local enqueue result for its first message.
