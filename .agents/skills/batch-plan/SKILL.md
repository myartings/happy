---
name: batch-plan
description: Plan batch, worktree, writer-subagent, dependency, merge, and integration execution. Use for delegated writer work, parallel implementation, multiple ready issues, cross-session execution, or work needing explicit ownership and resource boundaries.
---

# Batch Plan

Enter this skill when `scoping` records `parallelAssessment=batch-plan`, or when
isolation or batching is otherwise required. Two or more independent ready
units are the normal parallel trigger. Do not use it for an ordinary
single-slice Feature whose recorded assessment selects `serial`; in that case,
keep worktree and writer-subagent execution optional.

A writer child is not a fresh human-facing session. This plan may authorize
bounded subagent work under its existing isolated-writer contract, but it never
authorizes a client launch for the user. That separate action follows the
explicit boundary in `docs/workflow/execution-isolation.md`.
Bounded writer-child worktrees are exempt from Root session–worktree affinity
because their result returns to the parent orchestrator; that exemption never
lets Root use a child worktree as its sustained implementation environment
without a native handoff or fresh human-facing session.

## Workflow

1. Inventory ready units and classify the batch as cross-Slice delivery or
   within-Slice execution.
2. For a cross-Slice batch, confirm every unit has its own independently
   accepted outcome and right-sizing assessment. For within-Slice execution,
   internal implementation-plan tasks inherit the one accepted Workspace/Slice
   contract; they need stable ownership, conflict, and test seams, not separate
   delivery assessments or tracker authority. A parent relationship is not an
   execution edge; build dependencies from exact artifacts, interfaces,
   commits, accepted outcomes, or internal task outputs as applicable.
3. Build a dependency graph and shared-file/conflict map.
4. Put shared schemas, interfaces, configuration, and fixtures in serial Batch 0/1.
5. Parallelize only independent execution units with stable boundaries. A
   cross-Slice unit retains its own review/rollback boundary; a within-Slice
   unit returns to the owning Slice for integrated review and rollback. Batch
   tiny same-shape edits only when their brief, deterministic validation,
   review surface, and rollback boundary are all shared.
6. For each writer child, define branch/worktree, allowed files, blocked files,
   acceptance criteria, validation command, stop conditions, return contract,
   expected base, and expected merge-base. Use role `writer` for ordinary
   accepted implementation. Use role `mechanical` only for a literal, fully
   specified transform with no semantic product, architecture, risk, or review
   judgment; it still obeys the complete isolated writer contract. Dispatch the
   direct `worker` agent type for ordinary accepted writing and the direct
   `mechanical` agent type only for that strict transform. Their static defaults
   are both Luna Max. High-risk writing uses the direct
   Sol `high_risk_worker` agent type. Topology and risk authority select the
   role before dispatch; model guidance never creates the writer or worktree.
   A writer child may not delegate.
7. Assign read-only research/review roles without write permission when possible.
8. Record children and parent-owned merge order under the accepted task's
   workflow folder. When implementation is actually dispatched, materialize
   `contexts/implement.jsonl`; when verification is actually dispatched,
   materialize `contexts/check.jsonl`. Each manifest contains only the paths
   and reasons needed for that phase. Agent roles such as `writer`,
   `mechanical`, or `reviewer` never become manifest filenames. Do not create
   either phase manifest merely because a task exists.
9. Rebase/merge in dependency order; the parent owns integration and final check.
10. After integration materially changes task readiness, dependencies, or
   ownership, append `workflow-state.py parallel-reassess` before dispatching
   another batch. Do not add a receipt when the graph is unchanged.
11. Follow the cleanup guard in `docs/workflow/execution-isolation.md` when an
    owned child worktree is no longer needed; cleanup is never implicit in a
    successful integration.

Do not spawn or delegate unless the runtime and user authorize it when
authorization is required. A writer subagent without an isolated worktree is
forbidden. Do not parallelize concurrent edits to the same shared contract.

Before creating a child worktree, inspect existing worktrees and submodules,
verify the intended path is ignored or outside the repository, and run the
configured baseline check named in the child contract. Resolve the expected
base and expected merge-base, compare them with the actual branch point, and
stop on mismatch before creation. Preserve the branch and
worktree until the parent proves the named integration checks green.
