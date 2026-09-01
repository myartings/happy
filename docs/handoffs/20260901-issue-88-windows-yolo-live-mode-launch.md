# Issue #88 Happy Codex launch handoff

## Goal

Resolve [Issue #88](https://github.com/myartings/happy/issues/88): an explicit Auto-to-YOLO or YOLO-to-Auto selection in a Happy client must reach the connected Codex CLI without requiring another user message, with deterministic and truthful handling of an approval request that is already pending.

## Accepted scope

The user accepted Issue #88 as one independent delivery slice and authorized this dedicated worktree and a fresh Happy Codex Issue session. The slice may change the Happy client session-mode update/control-plane path, Codex CLI remote permission-mode state and active-turn approval handling, narrowly required UI feedback, and focused regression tests. It excludes changing global defaults, the missing-mode recovery tracked by #87, broad approval UI redesign, unrelated agents, and release work.

The owning Root must re-read the live Issue and repository, confirm this acceptance, then create or accept the local Workspace and own the complete lifecycle. No local Workspace exists yet.

## Completed work

- Published Issue #88 with confirmed reproduction evidence, acceptance criteria, scope, verification, right-sizing, and authorization risks.
- Created the dedicated registered worktree at `C:\Users\myartings\workspace\.worktrees\happy-issue-88`.
- Created branch `issue/88-windows-permission-picker-does-not-apply-yolo-to` from verified `origin/dev` commit `304450403ea6c84d475f0ebc34f1c1fdc302bd2c`.
- Kept Issue #87 and its active worktree/session separate.

## Validation

- The registered worktree path, requested branch, and HEAD commit agree.
- The target worktree was clean before this handoff file was added.
- `worktree_session.py --no-launch` returned `status: prepared` and `worktree_origin: existing-registered`.
- The live Issue is open and currently labeled `bug` and `needs-triage`; it has no comments or GitHub Project item.

## Dirty state

Only this launch handoff file is expected to be untracked in the Issue #88 worktree before the owning session creates durable lifecycle state. The shared checkout contains unrelated user-owned workflow changes and must not be modified, cleaned, or incorporated.

## Blockers

No launch blocker is known. The authorization-sensitive design must prevent stale or replayed metadata from silently elevating permissions. The owning session must resolve pending-approval correlation and Auto/YOLO transition semantics through the repository risk and lifecycle gates before implementation.

## Stop conditions

- Stop before implementation if the live Issue, branch, base, or worktree no longer matches this handoff.
- Stop if session-root binding cannot be verified.
- Stop for any scope expansion, risk waiver, destructive action, push, PR, merge, release, or external tracker mutation that lacks separate authorization.
- Do not edit or reuse the Issue #87 worktree.

## Next action

Start a fresh Happy Codex Root session in this exact worktree. Re-read `AGENTS.md`, `.ai/project.json`, applicable context, and the live Issue; confirm the accepted slice; create the formal local Workspace; run the authorization/cross-device risk gate; then proceed through planning, scoping, implementation, verification, independent review, finish, and delivery preparation without pushing or opening a PR unless separately authorized.
