# ADR 0006: Activate Trellis lifecycle only for an explicitly accepted task

## Status

Superseded for current work by ADR 0007 on 2026-09-05. Historical Workspaces
remain passive evidence. Previously accepted on 2026-08-19, superseding ADR
0003 and ADR 0005 and amending ADR 0004's submission routes.

## Context

The template imported Trellis lifecycle mechanics but omitted its task-creation
consent and small-task opt-out. Local policy then required either a complete
Workspace or a Micro receipt for every submitted diff. This made passive
handoffs and small documentation or maintenance changes trigger planning,
parallel-assessment, review-receipt, finish, archive, and staged-CI ceremony.

Matt Skills v1.2.3 keeps a bounded single-session build in its current context
and introduces specs, tickets, and fresh contexts only for multi-session work.
Trellis v0.6.15 preserves Plan/Execute/Finish after task activation while
allowing a simple conversation or small well-scoped change to proceed without a
task. The universal local lifecycle contradicted both routing boundaries and
increased session length and token cost without corresponding quality evidence.

## Decision

- Ordinary clear, bounded, normal-risk single-session work follows Matt without
  repository lifecycle evidence.
- Complex, high-risk, cross-session, durable, or coordinated work asks the user
  before creating a Trellis task. Once accepted, the complete ordered
  Plan/Execute/Finish lifecycle and repository Workspace adapter apply.
- Matt owns clarification, TDD, diagnosis, implementation, and applicable
  independent Spec/Standards review. Trellis owns accepted-task lifecycle and
  memory. Repository integration owns deterministic checks and submission
  safety without inferring a task from a diff.
- Retired local delivery routes and their runtime compatibility code are removed.
  Historical files remain passive Git history and do not affect current execution.
- Context manifests, tracker binding, session records, task checklists,
  parallel planning, and worktree isolation are conditional on actual task or
  execution topology.
- Default handoff follows Matt: explicit, concise, reference-first, redacted,
  and written to the operating-system temporary directory. It never activates a
  task or launches a client.

## Consequences

- Most routine solo development avoids lifecycle scaffolding while retaining
  applicable tests and Matt review.
- Trellis remains meaningful for work that needs durable orchestration instead
  of becoming a universal tax.
- Submission CI distinguishes no-task delivery from complete accepted-task
  delivery and rejects active-task bypass, partial lifecycle mutation, and
  mixed evidence.
- The active workflow contains no legacy authoring, migration, alias, or repair
  route.

## Reversal conditions

Revisit only with repeated evidence that explicit task consent causes material
state loss or quality regressions that cannot be addressed at the actual
cross-session/high-risk boundary. Do not restore a diff classifier merely to
obtain uniform receipts.
