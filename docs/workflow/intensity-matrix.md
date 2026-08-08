# Workflow Intensity Matrix

Use this to choose evidence depth after creating the required structured
workflow. Every column includes the same lifecycle; only depth and controls vary.

| Gate | Low-risk | Feature | High-risk |
| --- | --- | --- | --- |
| Acceptance contract | Concise durable task contract | Spec/task link | PRD/spec/tasks plus resolved decisions |
| Execution state | Workflow folder required | Workflow folder required | Workflow folder required |
| `scoping` | Required before implementation | Required before implementation | Required before implementation |
| Decision assessment | Required; evidenced `not_required` allowed | Required; map unresolved material decisions | Required decision map |
| Risk assessment | Required; evidenced `not_required` allowed | Required; controls when a trigger appears | Required controls and rollback |
| Tests | Closest signal | Targeted check, then complete applicable family | Full applicable deterministic gate |
| Review | Concise whole-diff review | Whole-diff review/check | Independent review required |
| Rollback/mitigation | Usually unnecessary | When operational risk exists | Required |
| Worktree | Optional | Optional for a single clear slice; use for queues, long-running isolation, or writer subagents | Required for writer subagents and isolation-heavy execution |
| Batch plan | No | Required for broad ready queues, multiple deliverables, or delegated writing | Required when batching, queue planning, or delegated writing is used |
| Tracker boundary | No | Recommended by default; use a tracker item or record a local-only reason | Required for queues, delayed pickup, PR delivery, multi-agent work, or explicit external coordination; otherwise record an approved local-only exception |
| Finish and archive | Required | Required | Required |
| Evidence location | `validation.md` plus `finish.md` | `validation.md` plus `finish.md` | `validation.md` plus `finish.md` |
| Machine receipts | Acceptance, scoping, implementation, check, review, finish; evidenced decision/risk assessment | Same core receipts plus applicable decision/risk evidence | All receipts, including decisions and risk controls |

`workflow.json` is authoritative for every formal task. A prose claim or a
phase name in chat does not satisfy a gate: the receipt must name durable
evidence, and guarded transitions must succeed.

## Execution Boundary

The main session is the default implementation owner for Low-risk work and
ordinary single-slice Feature work. Use `batch-plan` before code edits when
multiple ready candidates are in scope, a writer subagent will edit files, a
worktree boundary is useful, or isolation materially improves speed, context
quality, or safety.

A writer subagent must use an isolated worktree with allowed files, blocked
files, stop conditions, and a validation gate. Keep shared contracts serial
until ownership is stable.

Escalate when a trigger in `.ai/project.json` appears, when changes cross module
boundaries, when failure could lose data or money, or after repeated failed fixes.
