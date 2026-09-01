# Issue #79 Canonical Session Binding Launch Capsule

## Goal

Start one fresh Happy Codex Root session in the dedicated Issue #79 worktree.
That Root owns the accepted high-risk Delivery Slice for a canonical
account-scoped `0..1 <-> 0..1` GitHub Issue–Happy Session binding and, only
after confirming acceptance, owns the complete local lifecycle from Workspace
creation through delivery preparation.

Tracker source: https://github.com/myartings/happy/issues/79

## Accepted scope

- One Issue, one Delivery Slice, one future Workspace, and one canonical Happy
  Session per live GitHub Issue within an account.
- Atomic claim-or-resume before the first Issue task is sent, cross-device race
  convergence, durable lifecycle behavior, Session badge/chip/info projection,
  context freshness, explicit replacement/repair, fork and side-chat rules,
  compatibility, privacy, accessibility, rollout, and rollback.
- Acceptance seam: AC1–AC12 in Issue #79 and the accepted local Spec.
- Internal implementation plan: T1–T9; these are not child Issues.
- High-risk triggers: session protocol, cross-device synchronization, privacy,
  and data migration.
- Excluded: implicit GitHub workflow mutations, Agent Goal or Workspace-state
  conflation, a general CLI/daemon automation protocol, exclusive custody,
  official-upstream delivery, release, and independently shipping partial UI,
  persistence, or concurrency behavior.

The user explicitly confirmed the canonical 1:1 Spec, requested generation of
the implementation tasks, requested creation of the GitHub Issue and
Workspace, and then explicitly selected creation of this exact worktree plus a
fresh Happy Codex session. Tracker projection and this capsule do not pass a
local lifecycle gate; the owning Root must re-read the live Issue and confirm
the accepted Slice before creating or accepting the Workspace.

## Completed work

- Created and verified GitHub Issue #79 with `enhancement` and `needs-triage`.
- Assessed the feature as one coherent Delivery Slice with no child Issues and
  no blocking tracker dependency. Issues #74 and #75 are adjacent but do not
  block this Slice.
- Authored the accepted Spec and T1–T9 task plan in the coordinator checkout.
- Updated the parent GitHub Issues UI v2 Spec there to replace arbitrary
  matching-Session selection with canonical claim-or-resume.
- Verified AC1–AC12 task coverage, task structure, whitespace, selective
  workflow adoption, and the all-Workspace strict workflow audit.
- Deterministically routed Issue #79 to this exact branch and worktree, then
  created the registered worktree from verified `origin/dev` commit
  `68cfb6f915fb25f5ecd444df2aefafeccae92fa8`.
- No Issue comment, Project mutation, Workspace, local gate receipt, product
  implementation, commit, push, PR, or release has been created.

Accepted contract sources currently remain in the coordinator checkout:

- `C:\Users\myartings\workspace\happy\docs\specs\github-issue-canonical-session-binding.md`
- `C:\Users\myartings\workspace\happy\docs\tasks\github-issue-canonical-session-binding-tasks.md`
- modified parent file
  `C:\Users\myartings\workspace\happy\docs\specs\github-issues-ui-v2.md`

## Validation

- Live Issue at preparation: open, unassigned, no comments, no Project items,
  labels `enhancement` and `needs-triage`.
- Repository: `myartings/happy`; Issue and publication remote: `origin`.
- Verified base: `refs/remotes/origin/dev` at
  `68cfb6f915fb25f5ecd444df2aefafeccae92fa8`.
- Branch: `issue/79-add-canonical-1-1-github-issue-happy-session-bin`.
- Registered worktree:
  `C:\Users\myartings\workspace\.worktrees\happy-issue-79`.
- Before capsule creation, target worktree status was clean and its HEAD and
  branch matched the verified route.
- Coordinator-side checks passed:
  `python scripts/validate-happy-workflow.py` and
  `python scripts/workflow-audit.py --all --strict`.

## Dirty state

Target worktree expected status at launch:

- untracked launch capsule
  `docs/handoffs/20260831-issue-79-canonical-session-binding-launch.md`;
- no product changes and no Workspace yet.

The coordinator checkout is intentionally dirty on
`feature/fork-upstream-issue-routing`. Its existing staged and unstaged files
belong to separate work. Preserve all of them. The accepted canonical-binding
Spec and task plan are also untracked there, while the parent UI Spec has one
overlapping unstaged edit. Read only the three exact contract paths listed
above; do not stage, clean, switch, reset, or otherwise mutate the coordinator
checkout.

## Blockers

- The accepted Spec/task/parent amendment are not yet present in this worktree.
  The owning Root must re-read the live Issue and exact coordinator files,
  reconcile any drift, and use `apply_patch` to materialize the accepted
  contract here before linking it to a Workspace.
- No local acceptance, right-sizing, scoping, or risk receipt exists yet.
- Issue #79 remains `needs-triage`; its state does not pass a local gate.
- Tracker comments, labels/state changes, assignments, commits, pushes, PRs,
  implementation, and release remain separately authorized actions.

## Stop conditions

- Stop before local mutation if Issue URL, repository, branch, worktree, base,
  or accepted Slice cannot be confirmed exactly.
- Stop if Issue #79 materially changed, is already claimed elsewhere, or is
  already linked to another non-archived Workspace.
- Stop if the coordinator contract files are missing or differ materially from
  AC1–AC12 in the live Issue.
- Stop if material product, persistence, privacy, capability, migration, or
  rollback decisions remain unresolved after T1; route them through the
  repository decision and high-risk gates.
- Do not edit product or protocol code until Workspace source, acceptance,
  right-sizing, scoping, and risk requirements pass in the owning Root.
- Do not infer authority for tracker mutation, commit, push, PR, release, or
  client installation from this capsule.

## Next action

In the fresh Happy Codex session:

1. Read this capsule, the live Issue, `AGENTS.md`, `.ai/project.json`, and
   `CONTEXT.md`; verify exact branch, worktree, HEAD, and Git status.
2. Confirm the user's accepted one-Slice intent in that owning session.
3. Read and reconcile the three coordinator contract files named above, then
   materialize them into this worktree without touching the coordinator state.
4. Create and activate
   `docs/workspace/github-issue-canonical-session-binding/` through
   `workflow-state.py`, record Issue #79 with `workflow-state.py source`, and
   link the accepted Spec and T1–T9 task plan.
5. Pass acceptance, record the structured `accept-slice` right-sizing receipt,
   then run scoping and the required high-risk gate. Stop before implementation
   whenever one of those gates requires a user decision.

Initial prompt:

> Read `docs/handoffs/20260831-issue-79-canonical-session-binding-launch.md`,
> re-read live Issue #79 and the repository, confirm the accepted Slice, then
> create and activate its Workspace. Do not begin implementation before
> acceptance, right-sizing, scoping, and high-risk gates pass.
