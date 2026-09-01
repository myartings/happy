# Context: `fork-upstream-issue-routing`

## Accepted source

- User-approved local prerequisite Slice on 2026-08-31.
- Stable contract: `docs/specs/fork-upstream-issue-routing.md`.
- Follow-on consumer: upstream Happy Issue #1654, which remains a separate
  Delivery Slice and Workspace.

## Current behavior and evidence

- `scripts/workflow-issue-route.py` requires `origin` fetch and push URLs to
  match the Issue repository.
- `target` bases are restricted to `refs/remotes/origin/...`.
- Expected remote Issue-branch identity is also hard-coded to `origin`.
- Happy uses `origin=myartings/happy` and `upstream=slopus/happy`; the live
  #1654 route therefore fails before base and worktree planning.

## Implementation context

- `scripts/workflow-issue-route.py` — public planner CLI and JSON output.
- `scripts/test-happy-workflow-runtime.py` — deterministic public-runtime test
  seam using temporary Git repositories.
- `.agents/skills/tracker-workflow/SKILL.md` and
  `docs/workflow/tracker-workflow.md` — direct operator contract.

Implementation is serial in this current Root session. No implementation
manifest is created because no writer is dispatched.

## Verification context

- Targeted runtime behavior test first.
- Complete applicable workflow-infrastructure check family.
- Independent Spec and Standards review of one pinned final candidate.

No check manifest is created before actual review/check dispatch.

## Boundaries

- Current branch: `feature/fork-upstream-issue-routing`.
- Current human-facing session root: this repository checkout.
- No linked worktree, client launch, tracker mutation, commit, push, or PR is in
  scope.
- #1654 daemon product files are explicitly excluded.
