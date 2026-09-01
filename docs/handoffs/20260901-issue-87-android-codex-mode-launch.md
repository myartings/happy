# Issue #87 Android Codex Mode Launch Capsule

## Goal

Start one fresh Happy Codex Root session in the dedicated Issue #87 worktree.
That Root owns the accepted high-risk Delivery Slice that preserves an existing
Codex session permission mode across Android/iOS replies, persists the launch
mode for new sessions, and safely recovers legacy YOLO sessions only from
unambiguous metadata.

Tracker source: https://github.com/myartings/happy/issues/87

## Accepted scope

- Preserve the effective permission mode of an existing Codex session when any
  Happy client sends a reply.
- Persist a new Codex session's launch permission mode into synchronized
  session metadata before another device can reply.
- For legacy sessions only, recover YOLO when
  `dangerouslySkipPermissions === true`; do not infer elevated permission from
  absent, false, ambiguous, or stale metadata.
- Keep the product-wide Codex default as Auto and preserve explicit user mode
  changes and their cross-device synchronization.
- Add focused regression tests at the session-mode resolver, outbound message
  metadata, session creation/persistence, and cross-device synchronization
  seams.
- Exclude unrelated approval UI, execution-policy semantics, release, and
  product-wide default changes.

The user explicitly accepted this one-Slice scope and authorized creating this
dedicated worktree and launching a fresh Codex Issue session. This capsule does
not pass a local lifecycle gate; the owning Root must re-read the live Issue and
confirm the accepted Slice before creating or accepting the Workspace.

## Completed work

- Diagnosed the observed behavior: Android replies can send the current Auto
  default when a YOLO session lacks a synchronized per-session mode, while iOS
  does not reproduce the downgrade.
- Identified the relevant behavior around commits `07732a97` and `17aed50e`.
- Created and verified GitHub Issue #87 with `bug` and `needs-triage` labels.
- Assessed the work as one coherent Delivery Slice.
- Assessed risk as `cleared-with-controls`: no ambiguous YOLO inference, cover
  false/absent metadata, do not change global defaults, and require independent
  review of the authorization-sensitive diff.
- Deterministically routed the Issue from verified `origin/dev` commit
  `304450403ea6c84d475f0ebc34f1c1fdc302bd2c` and created this registered
  worktree.
- No Workspace, lifecycle receipt, product implementation, commit, push, PR,
  release, Issue comment, or Project mutation has been created.

## Validation

- Repository: `myartings/happy`.
- Live Issue at preparation: open, labels `bug` and `needs-triage`, no comments,
  and no Project items.
- Verified base: `refs/remotes/origin/dev` at
  `304450403ea6c84d475f0ebc34f1c1fdc302bd2c`.
- Branch: `issue/87-android-reply-silently-changes-existing-codex-se`.
- Registered worktree:
  `C:\Users\myartings\workspace\.worktrees\happy-issue-87`.
- Before capsule creation, the target worktree was clean and its HEAD and
  branch matched the deterministic route.

## Dirty state

Target worktree expected status at launch:

- untracked launch capsule
  `docs/handoffs/20260901-issue-87-android-codex-mode-launch.md`;
- no product changes and no Workspace yet.

The shared checkout at `C:\Users\myartings\workspace\happy` is intentionally
dirty on `feature/fork-upstream-issue-routing`; those changes belong to separate
work. Do not stage, clean, switch, reset, or otherwise mutate that checkout.

## Blockers

- No local Workspace, tracker source receipt, acceptance gate, right-sizing
  receipt, scoping receipt, or persisted risk gate exists yet.
- The exact legacy metadata shapes must be verified before choosing a fallback;
  `dangerouslySkipPermissions === true` is the only currently accepted
  privilege-restoration signal.
- Issue #87 remains `needs-triage`; tracker state does not pass a local gate.
- Tracker mutation, commit, push, PR, release, and client release/install remain
  separately authorized actions.

## Stop conditions

- Stop before local lifecycle mutation if Issue URL, repository, branch,
  worktree, base, or accepted Slice cannot be confirmed exactly.
- Stop if Issue #87 materially changed, is claimed elsewhere, or is linked to
  another non-archived Workspace.
- Stop if the implementation would infer YOLO from absent, false, ambiguous, or
  stale metadata, or would change the global Auto default.
- Do not edit product or session-protocol code until Workspace source,
  acceptance, structured right-sizing, scoping, and risk gates pass.
- Do not infer authority for tracker mutation, commit, push, PR, release, or
  client installation from this capsule.

## Next action

In the fresh Happy Codex session:

1. Read this capsule, the live Issue, `AGENTS.md`, `.ai/project.json`, and
   `CONTEXT.md`; verify the exact branch, worktree, HEAD, and Git status.
2. Confirm the user's accepted one-Slice intent in that owning session.
3. Create and activate a Workspace for Issue #87 through
   `workflow-state.py`, record the tracker source, and snapshot the accepted
   Issue contract locally.
4. Pass acceptance and record the structured `accept-slice` right-sizing
   receipt, then run scoping and persist the high-risk gate with the controls
   above.
5. Build a deterministic red-capable regression test before implementation;
   stop for user input if exact legacy metadata evidence contradicts the
   accepted fallback.

Initial prompt:

> Read `docs/handoffs/20260901-issue-87-android-codex-mode-launch.md`, re-read
> live Issue #87 and the repository, confirm the accepted Slice, then create
> and activate its Workspace. Do not begin implementation before acceptance,
> right-sizing, scoping, and high-risk gates pass.
