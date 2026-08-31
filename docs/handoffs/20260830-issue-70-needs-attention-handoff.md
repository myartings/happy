# Issue #70 — Needs Attention implementation handoff

## Goal

Implement [GitHub Issue #70](https://github.com/myartings/happy/issues/70),
“Needs Attention: surface pending permissions and questions,” as the accepted
current permission-and-communication slice.

## Accepted scope

The user explicitly accepted implementing #70 and explicitly chose an isolated
worktree plus a fresh Codex session. The owning Root must still re-read the live
Issue and record that acceptance in the repository-local lifecycle before any
implementation.

Use the Issue body as the slice boundary. In particular, the work is App-side,
navigation-only, preserves one row per Session, gives permission precedence over
answer-required, handles stale or missing source versions safely, and emits no
permission/communication response RPC or state mutation. Terminal outcomes,
Goal-derived reasons, provider handler changes, and a separate inbox remain out
of scope.

## Completed work

- Created and revalidated Issue #70; it was Open with `enhancement` and
  `needs-triage`, no comments, and no Project item at handoff time.
- Routed the Issue to this independent worktree without creating a local
  Workspace or editing product code.
- Created branch
  `issue/70-needs-attention-surface-pending-permissions-and` from verified
  `origin/dev` commit `cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a`.
- The finalized source contract remains an untracked user document in the
  coordinator worktree at
  `/Users/myartings/workspace/happy/.dev/worktree/brave-meadow/docs/specs/needs-attention-2-0.md`
  with Git blob hash `ae8f16b1eb9fd29933b6b9b1c9243d74d43a4db8`.

## Validation

- Live Issue URL: `https://github.com/myartings/happy/issues/70`
- Repository: `myartings/happy`
- Verified base: `cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a`
- Target worktree: `/Users/myartings/workspace/.worktrees/happy-issue-70`
- The Issue router returned `ready`, `create-from-verified-base`, and
  `manual-start-required`; no router mutation was performed.
- No tracker label, status, comment, or Project mutation was made during this
  transfer.

## Dirty state

This target worktree should contain only this untracked handoff before the new
session begins. The coordinator worktree remains independently dirty with the
user-owned changes below; do not clean, move, stage, edit, or commit them from
this session:

- `CONTEXT.md`
- `docs/PRD.md`
- `docs/specs/needs-attention-2-0.md`

## Blockers

There is no known implementation blocker. The finalized Spec is not committed
on the target base, so the owning Root must read it at the absolute source path
above, verify its blob hash, and preserve the accepted contract in the new
Workspace after local acceptance. Do not edit the source copy.

Issue labels and other tracker state remain unchanged. Do not mutate them
without fresh authorization.

## Stop conditions

- Stop before implementation if the live Issue, branch, worktree, or accepted
  intent no longer matches this handoff.
- Stop before lifecycle mutation if user acceptance cannot be confirmed from
  the conversation and live Issue.
- Do not create more than one active Workspace for #70.
- Do not touch the coordinator worktree or broaden the slice into terminal
  outcomes, Goal Mode, provider behavior, or a new inbox.

## Next action

In the fresh owning Root session, read this file, the live Issue, `AGENTS.md`,
`.ai/project.json`, and the finalized Spec. Confirm the accepted Issue binding,
then use the repository `start` workflow to create and accept exactly one local
Workspace, record the Issue and Spec sources, run the required strict audit and
scope gates, and only then plan and implement #70 through the complete local
lifecycle.
