# Delivery Slice and Workspace Contract

Use this contract when planning or resuming an explicitly accepted Trellis task.
Use an external tracker Issue only when the task needs a durable queue,
coordination boundary, or pull-request ownership; otherwise use its accepted
local source.

## One slice, two views

One accepted delivery slice maps to exactly one
`docs/workspace/<slug>/`. The two views have different ownership:

| View | Owns |
| --- | --- |
| Tracker Issue or accepted local source | User value, acceptance boundary, and any real blocking/queue/PR edges |
| Workspace | Source links, role context, phase and gate evidence, validation, finish review, sessions, and journal |

## Right-sizing assessment

The delivery hierarchy has five distinct levels:

| Level | Owns | Does not imply |
| --- | --- | --- |
| Product outcome / parent Issue | Broad outcome, child coordination, cross-child requirements, final integration acceptance | A direct implementation Workspace |
| Delivery Slice / child Issue | One independently verifiable behavioral outcome or tightly coupled invariant cluster | Automatic acceptance or dependency order |
| Accepted Trellis task / Workspace | Lifecycle and evidence for exactly one accepted Slice | Tracker mutation, Issue acceptance, or another Workspace |
| Implementation-plan task | Ordered work inside one Slice | An independently publishable delivery |
| Execution step | A transient, approximately 2–5 minute action | Tracker or durable task state |

Before publishing or triaging a durable implementation Issue as agent-ready,
record these assessment fields in its durable source:

1. behavioral outcome or invariant cluster;
2. acceptance/test seam;
3. exact dependency inputs and outputs;
4. coherent review/rejection boundary;
5. merge and rollback boundary;
6. expected Agent-context/session boundary;
7. consequence plus size/complexity warning signals; and
8. evidenced disposition.

Split a candidate when two or more outcomes can be planned, implemented,
verified, reviewed, merged, rejected, or rolled back independently. Prefer
vertical Slices: keep implementation, focused tests, required configuration,
and directly required documentation together when none has independent value.
Batch tiny independent same-shape edits only when one precise brief,
deterministic check, review surface, and rollback boundary cover all members.
Line count, file count, duration, and token estimates are warning signals; they
never override consequence, coupling, testability, or review judgment. Exact
prerequisite artifacts, interfaces, accepted outcomes, or commits define
dependency edges; Issue hierarchy does not.

After tracker-backed task acceptance, revalidate the source against the current
repository and append the structured acceptance receipt before implementation:

```bash
python3 scripts/workflow-state.py right-sizing <slug> acceptance \
  --route <accept-slice|split-required|batch-mechanical> \
  --outcome "..." --acceptance-seam "..." --dependencies "..." \
  --review-boundary "..." --rollback-boundary "..." \
  --context-boundary "..." --consequence "..." --evidence "..."
```

`split-required` blocks implementation. Immediate bounded normal-risk work
retains the no-Issue/no-Workspace path and therefore creates no receipt.

After two consecutive blocked implementation-attempt receipts or two blocked
review boundaries without an intervening accepted boundary, append a
`continuation` receipt before another broad attempt. The command rejects a
premature receipt. Select exactly one route: `continue`, `diagnose`,
`reconcile-contract`, or `split-remainder`. Only `continue` resolves the trigger
and permits another bounded implementation attempt; every other route keeps
broad implementation paused. Turn count triggers reassessment but proves no
route. Record the matching trigger explicitly: `no-progress` for continue,
`same-root-failure` for diagnose, `contract-conflict` or
`reviewer-scope-expansion` for reconciliation, and `independent-remainders` for
splitting. A `split-remainder` receipt additionally records `--remainder-slices`,
`--dependency-interfaces`, and `--safe-stop`. Every route preserves completed
evidence and the accepted contract; it creates no remainder Workspace and
performs no tracker write.

The acceptance receipt is available only in planning/design after
`acceptance=passed` and before scoping passes. It fingerprints the current
context, decisions, links, and linked contract files; scoping fails closed if
those bytes change before the snapshot is consumed. Legacy Workspaces cannot
acquire this prospective receipt after scoping. New tracker sources and new
receipts carry a contract-policy version plus the receipt-list start index;
validation requires fingerprints, planning/design acceptance phase, and
route-compatible continuation triggers from that index forward while leaving
an earlier marker-free historical prefix readable. A tracker Workspace may use
that legacy exemption only when Git contains an actual committed marker-free
tracker baseline; deleting all prospective fields from a new uncommitted
Workspace fails closed.

A mutable chat title or conversation alone is not a stable source. Record the
structured source with `workflow-state.py source`; the command synchronizes its
human-readable projection in `task-links.md`. An accepted task cannot enter
implementation while its selected source is pending. Keep exact verification
in `validation.md`.

## Conditional task checklist

Create `docs/tasks/<slug>-tasks.md` only when at least one condition applies:

- implementation has multiple meaningful steps
- several acceptance criteria need explicit coverage
- internal dependencies need coordination
- high-risk work needs an auditable execution trail

A self-contained delivery slice may link its source directly and record that no
separate checklist is required. The checklist supports execution; it does not
become a second ticket or Workspace.

Implementation-plan tasks and execution steps remain inside the accepted Slice.
If task generation discovers an independently deliverable outcome, return to
right-sizing and reconcile a parent/child Slice proposal instead of encoding a
second delivery queue in the checklist.

## Separate boundaries

Ticket, Workspace, session, branch, and worktree boundaries are separate. A
session or isolation change does not create a new delivery slice. This contract
uses repository-local state and does not require a Trellis runtime. When the
configured provider is `none`, use the accepted local task source rather than a
fabricated tracker link.
