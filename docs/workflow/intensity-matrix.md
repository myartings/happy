# Workflow Intensity Matrix

Use this only after the user accepts a Trellis task. Every column then includes
the same ordered Plan/Execute/Finish lifecycle; depth and controls vary. A
normal bounded single-session Matt delivery is outside this matrix and creates
no lifecycle evidence. Task intensity is independent from decision uncertainty
and execution topology; classify those separately.

| Gate | Low-risk | Feature | High-risk |
| --- | --- | --- | --- |
| Acceptance contract | Concise stable source or spec slice | Stable ticket/local source plus spec when applicable | PRD/spec and resolved decisions plus a stable delivery slice |
| Right-sizing | Durable tracked Slices use a concise assessment; direct work remains receipt-free | Source assessment plus structured acceptance receipt | Source assessment plus structured acceptance receipt; consequence overrides small diff size |
| Task checklist | Optional for a self-contained slice | Required only for multiple steps, criteria, dependencies, or audit needs | Required when decomposition or auditability needs it |
| Execution state | Accepted-task Workspace required | Accepted-task Workspace required | Accepted-task Workspace required |
| `scoping` | Required before implementation | Required before implementation | Required before implementation |
| Decision assessment | Required; evidenced `not_required` allowed | Required; map unresolved material decisions | Required decision map |
| Risk assessment | Required; evidenced `not_required` allowed | Required; controls when a trigger appears | Required controls and rollback |
| Tests | Closest signal | Targeted check, then complete applicable family | Full applicable deterministic gate |
| Review | Concise Matt Spec/Standards review in parallel read-only contexts | Full Matt Spec/Standards review in parallel read-only contexts | Full Matt Spec/Standards review in parallel read-only contexts plus explicit responsible-owner risk assessment |
| Rollback/mitigation | Usually unnecessary | When operational risk exists | Required |
| Worktree | Optional | Optional for a single clear slice; use for queues, long-running isolation, or writer subagents | Required for writer subagents and isolation-heavy execution |
| Batch plan | No | Required for broad ready queues, multiple deliverables, or delegated writing | Required when batching, queue planning, or delegated writing is used |
| Tracker boundary | Only when actual queue/coordination needs it | Required for a tracked multi-session slice; otherwise local accepted source | Required when external coordination or queue ownership applies; otherwise explicit local accepted source |
| Finish and archive | Required | Required | Required |
| Evidence location | `validation.md` plus `finish.md` | `validation.md` plus `finish.md` | `validation.md` plus `finish.md` |
| Machine receipts | Acceptance, scoping, implementation, check, review, finish; evidenced decision/risk assessment | Same core receipts plus applicable decision/risk evidence | All receipts, including decisions and risk controls |

`workflow.json` is authoritative for every accepted Trellis task. A prose claim or a
phase name in chat does not satisfy a gate: the receipt must name durable
evidence, and guarded transitions must succeed.

An accepted lightweight task uses the current Workspace schema with concise
contract and planning evidence. The caller still supplies acceptance, scope,
validation, decision assessment, and risk assessment; the remaining lifecycle
and Matt review topology are unchanged.

## Execution Boundary

Parallel planning is conditional on actual topology. When an accepted task has
two or more independent ready units, record ownership/dependencies and use
`batch-plan`. Serial tasks and no-task work do not create a parallel receipt.
Shared contracts, overlapping ownership, unresolved dependencies, or higher
coordination cost remain serial.

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
