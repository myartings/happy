# Context: `codex-session-permission-mode-preservation`

## Outcome

Preserve an existing Codex session's effective permission mode across replies
from any Happy client. Persist the launch mode with a newly created session and
recover only unambiguous legacy YOLO sessions.

## Source and ownership

- Accepted source: GitHub Issue #87.
- Owning Root: the current Issue #87 session in the registered worktree.
- Execution topology: serial current-root work; no writer dispatch or role
  manifest is required.

## Relevant boundaries

- Happy App resolves composer and outbound message modes.
- Happy CLI creates the authoritative encrypted session metadata at launch.
- Existing synchronized `metadata.permissionMode` remains the cross-device
  per-session authority.
- `metadata.dangerouslySkipPermissions === true` is compatibility evidence only
  when an old Codex session has never published `permissionMode`.

## Exclusions

- Global agent defaults, Codex execution-policy semantics, approval UI,
  release/install work, native projects, server persistence, and tracker writes.

## Verification context

Focused App resolver/message/synchronization tests and CLI session-metadata
tests precede the configured applicable workflow check and independent
high-risk review.
