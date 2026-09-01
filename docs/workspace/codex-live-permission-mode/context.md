# Context: `codex-live-permission-mode`

## Goal

Resolve GitHub Issue #88: an explicit permission-mode selection in the shared
Happy session UI must affect the connected Codex CLI immediately, including a
deterministic already-pending approval race, without another user message.

## Accepted boundary

- Source: https://github.com/myartings/happy/issues/88
- Worktree: `C:\Users\myartings\workspace\.worktrees\happy-issue-88`
- Branch/base: `issue/88-windows-permission-picker-does-not-apply-yolo-to` at
  `304450403ea6c84d475f0ebc34f1c1fdc302bd2c` from `origin/dev`.
- Included: shared client picker/control seam, Codex live mode and approval
  handling, truthful failure feedback, focused tests.
- Excluded: defaults, Issue #87 missing-mode recovery, broad approval UI,
  other agents, server redesign, packaging/release, push/PR/merge.

The live Issue was re-read on 2026-09-01 and matched the launch handoff. The
user's `继续` confirmed the previously accepted one-slice contract in this
owning Root session.

## Current architecture

`SessionView` calls `sessionSetAgentModes`, which updates the local mirror and
encrypted session metadata. The CLI receives user messages and updates
`CodexRemoteModeState` from `message.meta.permissionMode`; it does not consume
permission changes from metadata updates. The approval handler can consult the
latest in-memory state, but that state remains stale until another message.

The existing session RPC path is scoped by session ID and encrypts request and
response with the session key. It provides a narrower authorization channel
than metadata and returns an explicit acknowledgement or timeout/error.

## Applicable contracts

- `docs/specs/codex-live-permission-mode.md`
- `docs/tasks/codex-live-permission-mode-tasks.md`
- `docs/workflow/ticket-task-contract.md`
- `docs/workflow/discovered-work-scope-containment.md`
