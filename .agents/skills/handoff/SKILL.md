---
name: handoff
description: Compact the live thread for recovery when the user explicitly requests a handoff or work is actually pausing or transferring to another session, person, client, or device.
---

# Create Handoff

## Workflow

1. Treat handoff as an explicitly invoked standalone bridge, not a finish step
   or lifecycle route. Create a handoff only for an actual pause, an actual transfer, or an explicit user request.
   Planning, Issue inspection, and worktree preparation alone do not create a handoff.
   Checks, review, finish, and ordinary continuation in the same coherent
   session are not independent triggers either.
2. If a Trellis task is active, first update only the durable task state needed
   for recovery through guarded commands. Do not create a task, session receipt,
   or Workspace merely because a handoff was requested.
3. Observe the exact repository root, Issue and accepted local slice when
   applicable, branch, registered worktree, HEAD, and dirty state. If repository,
   Issue, accepted-slice, branch/worktree, or dirty-state identity is ambiguous
   or mismatched, readiness fails closed: record the ambiguity, mark active code
   `not cross-device-ready`, and keep the work local.
4. Write a concise Markdown file to the operating-system temporary directory as
   a private temporary file with mode 0600. Verify the resulting mode, avoid a
   shared predictable filename, and include a cleanup instruction for after the
   receiving session has consumed it. Keep only the live thread. When active
   code is in flight, use these explicit fields, with `none` or `unknown` instead
   of implication:

   - Repository identity
   - Issue and accepted local slice
   - Branch and registered worktree
   - Explicit Git status, including modified and untracked files
   - Cross-device readiness: `ready` or `not cross-device-ready`
   - Recoverable Git artifact type/reference, coverage, and recovery instruction,
     or the reason none exists
   - Completed and remaining work
   - Exact checks run/results and checks still missing
   - Resolved decisions and unresolved blockers
   - Smallest next action
   - Authority exclusions
   - Any non-blocking follow-up candidates with classification and rationale,
     or an explicit statement that none were found

5. Cross-device active code is `ready` only when exact identity is unambiguous,
   a verified commit, PR/source ref, Git bundle/patch, or another explicitly
   recorded recoverable Git artifact covers the in-flight code, and the target
   device can access that artifact through its recorded recovery path. A
   local-only commit is `not cross-device-ready`; a branch or existing HEAD does
   not cover later dirty files. Without verified coverage and target access, report
   `not cross-device-ready`, state that uncommitted files remain on the source device,
   and do not imply that the handoff moved them. This skill does not create,
   commit, publish, or synchronize an artifact implicitly.
6. Reference existing specs, plans, ADRs, issues, commits, diffs, and active-task
   files by exact path, revision, or URL instead of copying their settled content.
7. Distinguish facts from hypotheses and name user-owned changes that must be
   preserved.
8. Suggest the smallest relevant skills for the next session.
9. Redact credentials, tokens, personal data, private URLs, and unnecessary
   machine-local details before writing. Omit secrets or replace them with safe references.
10. Report the temporary handoff path, its verified private mode, how the next
   session should reference it, and when/how the operator should remove it.
   Do not automatically launch a client, create a branch/worktree, commit,
   publish, delete the handoff prematurely, or ingest it into project
   documentation.

For a dedicated Issue session, recovery preserves the same Issue lifecycle
owner. A coordinator may prepare the recoverable Git artifact, exact worktree,
capsule, or receiving session, but it does not resume or advance the local
lifecycle. The newly verified owning session re-reads the live Issue and local
state before continuing.

A handoff transfers execution context only; it does not transport code or uncommitted files.
A handoff never authorizes client launch, commit, push, PR, tracker mutation, or destructive Git actions.
Branch/worktree changes, artifact creation, cleanup, and every external action
remain separately authorized. A platform-native rebind or explicit
user-authorized new session remains a separate adapter action. Use `/compact`
instead at an intentional phase break when continuing the same conversation is
preferable. Do not describe work as complete when checks are missing.
