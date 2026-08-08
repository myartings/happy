# Workflow Source Mapping

This document audits how AICodingTemplate absorbs ideas from iOSTemplate's
Matt-style skills, Trellis-style repository memory, and Superpowers-style
execution discipline. The template keeps only stack-neutral workflow rules.
Technology commands, project vocabulary, and domain constraints belong in each
adopting repository.

## Design Boundary

AICodingTemplate is a workflow core with a small repository-local enforcement
runtime, not an external framework runtime:

- It does not require Matt skills, Trellis, Superpowers, or their CLIs.
- It requires `scripts/workflow-state.py` for structured workflow transitions
  and `scripts/workflow-audit.py --strict --require-active` before guarded work.
- It does not assume a programming language, app platform, deployment target, or
  business domain.
- It stores durable project facts in repository files so Codex, Claude Code, and
  human maintainers can resume from evidence instead of chat history.
- It treats human-visible trackers as coordination and acceptance-boundary
  surfaces, not as replacements for repository acceptance criteria and
  validation evidence.

## Matt-Style Discipline

| Source idea | Template landing point | Status |
| --- | --- | --- |
| Clarify before committing to scope | `grilling`, `create-prd`, `decision-map`, `generate-spec` | Adopted |
| Keep shared project language | `CONTEXT.md`, `AGENTS.md`, `CLAUDE.md` | Adopted |
| Prefer TDD where a stable seam exists | `tdd`, `scoping`, `implement` | Adopted |
| Diagnose from evidence before patching | `diagnose`, `check` failure routing | Adopted |
| Handoff with durable state | `handoff`, `docs/workspace/<slug>/` | Adopted |
| Architecture review for consequential changes | `risk-gate`, `review`, ADRs | Adopted |
| Tracker-first coordination | `.ai/project.json` tracker adapter, `tracker-workflow`, GitHub issue template, local-only exception, and task links | Soft default for durable work |

The template does not make brainstorming, a full PRD, or tracker creation
mandatory for low-risk work. For durable Feature work, prefer a
human-visible tracker boundary or record why the work is intentionally
local-only. The intensity matrix decides how much ceremony is justified by risk
and durability.

## Trellis-Style Repository Memory

| Source idea | Template landing point | Status |
| --- | --- | --- |
| Complete delivery loop | `docs/workflow.md` Start/Plan/Scope/Build/Verify/Review/Finish/Archive | Adopted |
| Project spec as durable context | `docs/PRD.md`, `docs/specs/`, `docs/tasks/` | Adopted |
| Workspace memory for active tasks | `docs/workspace/<slug>/` | Adopted |
| Role-scoped context selection | `contexts/implement.jsonl`, `contexts/check.jsonl` | Machine-enforced |
| State, journal, session, and validation records | `workflow.json`, generated `state.md`, `journal.md`, `session-index.md`, `sessions/`, `validation.md` | Adopted |
| Continue from repository state | `start`, `continue`, `workflow-state.py` | Adopted |
| Explicit downstream adoption | `.ai/template-sync.json`, `sync-template.py` | Adopted |
| Learning promotion | `finish-work`, `update-spec`, `finish.md` | Adopted |
| Parallel task tracking | `children.md`, `children.json`, `integration.md` | Adopted when needed |
| `.trellis/` directory and Trellis CLI | Not included | Deliberately omitted |

The omission is intentional: adding `.trellis/` would create a second source of
truth beside `docs/PRD.md`, `docs/specs/`, `docs/tasks/`, and
`docs/workspace/`.

## Superpowers-Style Execution Discipline

| Source idea | Template landing point | Status |
| --- | --- | --- |
| Test-driven development | `tdd` | Adopted conditionally |
| Systematic debugging | `diagnose` | Adopted |
| Verification before completion | `check`, `finish-work`, gate receipts, `validation.md` | Machine-enforced |
| Independent review | `review`, High-risk intensity gate | Adopted |
| Subagent/worktree isolation | `batch-plan`, intensity matrix, `execution-isolation.md` | Adopted when delegated or isolated writing occurs |
| Branch/worktree finish discipline | `finish-work`, `batch-plan`, `task-links.md` | Adopted |
| Mandatory scratch ledger | Not included | Deferred until repeated state-loss evidence |
| Mandatory subagent implement/review loop | Not included | Deferred until repeated review-drift evidence |
| Mandatory workflow behavior pressure tests | `scripts/test-workflow.py`, `scripts/test-workflow-ci.py` | Adopted |

Superpowers is used as a failure-mode reference, not as a second workflow layer.
If agents repeatedly claim completion without evidence, lose long-task state, or
review their own work unreliably, tighten the relevant local skill instead of
installing the whole framework by default.

## Generic Workflow Mapping

| Generic phase | Main surfaces | Key rule |
| --- | --- | --- |
| Start | `start`, `continue`, `docs/workspace/ACTIVE.md` | Resume from repository state, not chat memory. |
| Plan | `create-prd`, `decision-map`, `generate-spec`, `generate-tasks`, `risk-gate` | Link the smallest adequate contract from required workflow state. |
| Scope | `scoping`, role manifests | Resolve boundaries, context, decisions, risks, and tests before editing. |
| Build | `implement`, `tdd`, `batch-plan` | Implement small slices with relevant context and preserved user changes. |
| Verify | `check`, `.ai/project.json`, `validation.md` | Run exact configured commands and record gaps explicitly. |
| Review | `review`, review gate | Review the whole diff; High-risk work requires independence. |
| Finish | `finish-work`, `update-spec`, `finish.md` | Close only after validation, review, and learning triage. |
| Archive | `workflow-state.py archive`, `workflow.json` | Enter immutable terminal state with result metadata. |

## Audit Result

The current template covers and machine-checks the reusable parts of the three
source workflows:

- Matt-style one-decision-at-a-time clarification, TDD, diagnosis, handoff, and
  review discipline.
- Trellis-style repository state, role-scoped context, task/session memory,
  validation ledger, and learning promotion.
- Superpowers-style verification-before-completion, review separation, and
  worktree isolation for delegated writers.

The main anti-goals are also represented:

- No stack profiles in the workflow core.
- No domain-specific quality gates.
- No `.trellis/` second source of truth.
- No manual phase advancement outside the repository-local state machine.
- No mandatory subagent or scratch-ledger layer for ordinary tasks.
- No external dispatcher as the default execution path.

Residual risk: future project adapters may reintroduce stack or domain
assumptions. Keep adapters in `.ai/project.json`, project-local specs, and
project-local skills; do not promote adapter rules back into this core template
unless they are true for ordinary coding projects.
