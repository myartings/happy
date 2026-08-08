# Execution Isolation Policy

This template lets the agent choose the lightest execution route that improves
speed, context quality, or safety. The main session is the default
implementation owner for Low-risk work and ordinary single-slice Feature work.
Use subagents and worktrees for research, review, batch work, long-running
isolation, high-risk experiments, and clearly scoped writer delegation.

When subagents or worktrees are selected, the main session remains the
orchestrator. It decomposes the work into focused roles, gives each role the
minimum context it needs, and owns integration and final verification.

## Defaults

- Main session: product decisions, architecture tradeoffs, ordinary
  single-slice implementation, task decomposition, merge order, integration,
  final verification, finish review, and final user response.
- Read-only subagent: research, architecture analysis, diff review, test gap
  analysis, and verification planning.
- Writer subagent: implementation in a worktree only.

Low-risk changes and ordinary single-slice Feature work may stay in the main
session when direct editing is lower overhead than creating a child worktree.
The agent records the routing reason instead of asking the user to choose.

## Queue Planning

Execution isolation does not mean parallel writer-first. When multiple issues,
spec slices, or workspace tasks are ready, the main session must plan the queue
before code edits:

1. List candidate issues/slices and their readiness.
2. Map dependencies, related issues, duplicates, and priority.
3. Map likely file ownership and shared resources.
4. Land shared contracts serially when needed.
5. Dispatch only parallel-eligible writer children to subagents in worktrees.
6. Keep serial-only, needs-info, and human-decision work out of the parallel
   batch.

This is the default route for broad prompts like "continue", "do it", "继续",
"做吧", "advance ready issues", or "process the queue". If only one candidate is
executable after queue analysis, route it back to main-session implementation
unless a writer subagent, agent-selected worktree, long-running branch, or
high-risk isolation need remains.

## Hard Rule

Any subagent that can write files must run in a worktree.

Required child-worktree contract:

- branch/worktree name
- `.codex/SCOPE.md`, `.claude/SCOPE.md`, or equivalent scoped instruction file
- allowed files
- blocked files
- stop conditions
- validation gate
- shared-resource policy

A write-capable subagent without a worktree is forbidden.

## Shared Contract Policy

Do not let multiple children independently change the same shared contract.
Land or block shared contracts before child implementation begins:

- data schema or migrations
- root navigation or composition
- dependency injection root
- design tokens or shared UI primitives
- build/project configuration
- shared test fixtures
- release or deployment configuration

If a child discovers it needs a blocked file or a product/architecture decision,
it must stop and return to the parent workflow.

## Workflow Shape

For work that selects subagents or worktree isolation:

1. Main session runs `start`.
2. Plan resolves PRD/spec/tasks/decision-map/prototype/research as needed.
3. `scoping` selects context, risk gates, tests, roles, and resource policy.
4. `batch-plan` creates parent/child execution state when a writer subagent,
   agent-selected worktree, queue batch, or multiple parallel children are
   needed.
5. Writer children implement scoped work in worktrees.
6. Review/check roles inspect child diffs and validation evidence before the
   parent merges the child.
7. Main session merges in order, runs integration checks, then uses `check` and
   `finish-work`.

## When Not To Use Writer Subagents

Keep implementation in the main session when:

- the change is Low-risk and local
- the work is a single-file mechanical edit
- the task is mostly product judgment rather than code
- the child cannot be given a meaningful allowed/blocked file set
- the work requires exclusive local resources and no explicit slot is available

These are route-selection reasons before subagents are required. They are not
fallbacks after a route has selected subagent execution.
