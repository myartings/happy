# Task: Fork-to-Upstream Named Issue Routing

## Plan

### Goal

Produce a backward-compatible, fail-closed named-Issue plan for a personal fork
publishing an upstream-owned Issue branch.

### Scope

- Planner remote-role input, validation, output, and branch-collision behavior.
- Behavior tests using temporary local Git repositories only.
- Directly required feature spec, tracker-workflow, validation, and finish evidence.

### Out of scope

- Happy CLI daemon ownership implementation for upstream #1654.
- GitHub writes, branch publication, PR creation, worktree launch, or client
  launch.
- Automatic remote discovery, network fork validation, or unrelated workflow
  refactors.

### Execution candidates

| Task | Dependencies | Likely ownership | Parallel candidate | Verification |
| --- | --- | --- | --- | --- |
| T1 Freeze remote-role and safety contract | none | Spec and Workspace decisions | no — shared contract | strict workflow audit |
| T2 Add failing public-CLI behavior tests | T1 | `scripts/test-happy-workflow-runtime.py` | no — establishes implementation oracle | targeted runtime test reports intended RED failures |
| T3 Implement explicit remote roles | T2 | `scripts/workflow-issue-route.py` | no — same public contract and fixtures | targeted runtime test turns GREEN |
| T4 Document invocation and safety semantics | T3 | tracker-workflow Skill and docs | no — must match final interface | validator and documentation inspection |
| T5 Run whole-slice verification and review | T3, T4 | applicable workflow checks and Workspace evidence | no — one candidate | `workflow-check.py --applicable`, Spec/Standards review |

All tasks are serial internal units of one Delivery Slice. None has an
independent merge, rollback, review, or user-value boundary.

## Allowed implementation surface

- `scripts/workflow-issue-route.py`
- `scripts/test-happy-workflow-runtime.py`
- `.agents/skills/tracker-workflow/SKILL.md`
- `docs/workflow/tracker-workflow.md`
- `docs/specs/fork-upstream-issue-routing.md`
- `docs/tasks/fork-upstream-issue-routing-tasks.md`
- `docs/workspace/fork-upstream-issue-routing/**`
- Generated active-workflow projection updated only by `workflow-state.py`

Any need to change external trackers, another workflow runtime, Git remote
configuration, #1654 product files, or branch/worktree lifecycle is material
growth and must return to the owning scope or authorization boundary.

## Verify

- [x] AC1–AC8 have deterministic evidence in the targeted runtime test.
- [x] The targeted RED failed only because explicit remote roles were absent.
- [x] The targeted GREEN and nearest workflow runtime suite passed.
- [x] The corrected candidate selected the exact `workflow` profile and passed
  every configured command.
- [x] The whole diff contains no #1654 product code, remote mutation, generated
  runtime data, credentials, or machine/session identifiers.

The final Spec and Standards conclusions are recorded in the mutable Workspace
finish evidence after this delivery candidate is content-addressed. Those
receipts do not alter the reviewed implementation candidate.

## Progress

- 2026-08-31: user accepted the branch and High-risk Workspace; contract
  created; status `planned`.
- 2026-08-31: T1 complete — Spec, decisions, risk controls, source, and
  scoping gates recorded.
- 2026-08-31: T2 complete — public CLI fork/upstream test produced the intended
  RED because the new flags were absent.
- 2026-08-31: T3 complete — explicit remote roles, strict repository identity,
  and fail-closed remote-ref attribution are GREEN across 16 focused tests and
  the complete runtime suite.
- 2026-08-31: T4 complete — tracker-workflow Skill and operator documentation
  repeat the complete remote/base authorization tuple.
- 2026-08-31: T5 is candidate-bound — each final workflow-only check and both
  independent conclusions are recorded against the exact pinned candidate in
  Workspace evidence; remediation repeats the complete gate.
- 2026-08-31: first candidate check selected `full` solely because a product
  PRD edit had no workflow-profile owner. The three product-domain failures are
  outside changed scope; the over-broad PRD companion was removed and T5
  returned to implementation before rerunning the exact candidate check.
- 2026-08-31: first pinned Standards review blocked overlapping slash-remote
  attribution. Two public-behavior regression tests now require unique
  attribution for both target bases and reusable publication refs.

## Finish

Status: `candidate complete; lifecycle conclusion is Workspace-owned`

### Outcome

- Explicit Issue and publication remote roles are implemented, tested, and
  documented without changing planner mutation or authorization boundaries.

### Evidence

| Command or review | Result | Notes |
| --- | --- | --- |
| `python3 scripts/test-happy-workflow-runtime.py` | pass | Complete nearest workflow runtime suite |
| `python3 scripts/workflow-check.py --applicable --staged` | pass | Exact `workflow` profile; structured receipt in Workspace evidence |
| Independent Spec and Standards review | Workspace-owned | Conclusions and package identity live in `docs/workspace/fork-upstream-issue-routing/finish.md` |

### Remaining limits

- Planner cannot prove GitHub fork ancestry offline; it validates only explicit
  local remote identities and preserves external-write authorization.

### Reusable learning

- Repository ownership and branch publication are separate remote roles in a
  fork contribution; both must remain explicit in planning and authorization.
- Candidate-only check selection depends on every delivery path having a
  configured owner; unrelated product documentation must not be added merely
  as a workflow companion.
