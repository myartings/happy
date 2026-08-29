---
name: tracker-workflow
description: Resolve and operate the configured external tracker safely. Use when listing, creating, triaging, linking, or finishing GitHub Issues or other tracker items, or when an accepted task actually needs a human-visible queue or coordination boundary.
---

# Tracker Workflow

## Boundary

This skill is the single operational tracker surface. Matt owns the quality of
external-request intake; repository integration owns tracker resolution and
external-mutation safety. Do not add a second `triage` protocol or imply that
the absence of a tracker blocks ordinary immediate solo work.

The external tracker is the human-visible queue and acceptance boundary.
`docs/specs/`, `docs/tasks/`, and `docs/workspace/` remain authoritative for
implementation scope, execution state, validation, review, and finish evidence.
Never infer a local workflow gate from an Issue label or closed state.

An accepted task binds one Issue per independently deliverable slice only when
it uses an external queue or coordination boundary. Otherwise it may use an
explicit accepted local source. Record the selected source through
`workflow-state.py source`; task-link prose alone is not a task receipt.

## Named Issue intake

An imperative such as `处理 <Issue URL>` or `implement <Issue URL>` authorizes
read-only inspection and a bounded preparation proposal for that named Issue.
It does not itself accept or create a Trellis Workspace. Workspace activation
requires explicit acceptance of one independently deliverable slice through the
existing local state owner.

Keep the authority layers separate:

- The Issue owns human-visible intent, queue position, dependencies, and
  acceptance discussion.
- Local Specs and Workspace evidence own accepted execution scope, lifecycle
  state, validation, review, and finish truth.
- Labels, assignments, comments, or closure never pass a local gate.
- Tracker mutation, push, PR creation, merge, destructive Git action, and client
  launch remain separately authorized actions.

If the target or named Issue cannot be resolved uniquely, stop after read-only
inspection. If an Issue is too broad for one reviewable delivery, decompose it
before local acceptance. Creating an Issue for later work does not interrupt or
activate a currently accepted slice.

Before recommending a durable implementation Issue as agent-ready, require the
right-sizing assessment in `docs/workflow/ticket-task-contract.md`: behavioral
outcome, acceptance seam, dependency inputs/outputs, review boundary, rollback
boundary, context boundary, consequence/signals, and evidenced disposition.
Issue parent/child links coordinate outcomes; exact dependency artifacts or
interfaces still determine execution order.

Before recording a tracker delivery source, the local state owner rejects the
same Issue when it already belongs to another non-archived Workspace. The
rejection happens before either Workspace state or task links are changed.

## Coordinator and owning-session boundary

For a selected dedicated Issue session, the coordinator owns tracker reads and
explicitly authorized tracker mutations plus inert route, worktree,
launch/recovery, and terminal-cleanup preparation. It may create the minimum
resume capsule, but not the Issue Workspace, local acceptance, detailed task
plan, deliverable, implementation checks/review, or delivery commit/PR.

The owning Root—either the exact confirmed Issue session or the current Root
selected by an explicit named-Issue isolation opt-out—re-reads the live Issue
and repository, receives or confirms user acceptance, then owns the complete
local lifecycle from Workspace creation through finish and delivery preparation. Bounded writer
subagents and independent reviewers remain helpers under that one Root owner.
Coordinator intent, tracker fields, comments, handoff prose, and launch output
cannot transfer acceptance or pass a local gate.

## Visible prepared-session claim

For a human-selected named Issue, read the exact live Project item and latest
claim or transfer comment before preparation. Treat an `In Progress`, `Blocked`,
or `Review` projection as occupied: surface its state, Agent, Device, branch,
and worktree, then stop ordinary duplicate preparation until the user explicitly
selects transfer, replacement, or cleanup. `Inbox` and `Ready` may keep Agent
and Device empty; `Done` may retain the last values for traceability.

Run the deterministic Issue router as a separate read-only boundary before
proposing preparation. Repeat its exact Issue, verified base, canonical branch,
absolute device-local worktree, and selected session/client label. Immediately
before local mutation, rerun the router and require the Issue, base, branch, and
worktree to match the authorized tuple. Create and verify the branch, registered
worktree, and minimum recovery state before tracker writes.

A generic named-Issue or continuation instruction does not authorize these
writes. Only an explicit response to the concrete projection authorizes updating
the selected Project item to `In Progress` with non-empty Agent and Device and
adding one structured locator comment. Leave Priority unchanged unless it is
separately selected. The comment contains state, Agent, Device, canonical
branch, absolute worktree, session/client label, and verified base, and states
that it is cooperative and observational.

Re-read the exact Project item and new comment before client launch or sustained
implementation. If preparation, either write, or exact verification fails,
preserve the prepared environment, report `manual-start-required`, and do not
launch or begin implementation. Project/comment metadata never passes a
Workspace gate, proves Git/session ownership, or transports code.
Before launch, the locator must state that local acceptance is pending and no
Workspace exists. The subsequently confirmed session or explicitly opted-out
current Root, not the coordinator role, performs the Issue re-read and
acceptance boundary.

A transfer is separately authorized. Prepare and verify the receiver first,
then update Agent/Device and append a transfer locator without erasing earlier
comments. Add no automatic release, retry, polling, lease, heartbeat, claim
ledger, contention mechanism, or second tracker state machine.

## Resolve the adapter

1. Read `.ai/project.json.tracker` before querying or mutating a tracker.
2. If `provider` is `none`, do not attempt tracker access. An accepted task then
   uses an explicit local source when no external queue is required.
3. For GitHub, use configured `target` when present. Otherwise inspect Git
   remotes read-only and normalize common HTTPS and SSH GitHub URLs to
   `OWNER/REPOSITORY`.
4. If no target resolves, or different remotes resolve to different repositories,
   stop before external access and ask for one target to be configured.
5. Prefer an installed authenticated tracker connector. For GitHub, `gh` is an
   acceptable fallback. Use the browser for interactions better served by the
   native tracker UI. Do not use public web search for private tracker data.

## Read-before-write rule

Read-only discovery is allowed when it is relevant to the user's request. Before
an external write, confirm all of the following from current state:

- provider and resolved target;
- exact Issue or PR, when editing an existing item;
- current labels, state, body, and relevant recent comments;
- the concrete mutation requested by the user.

Creating, editing, labeling, commenting on, closing, reopening, or assigning an
Issue is an external write. Perform it only when the user explicitly requested
that operation. Drafting content or recommending a transition does not authorize
publication.

## Publish work items

1. Start from an accepted spec or plan and draft independently reviewable vertical
   slices sized for one coherent Agent context. Each slice should be demoable or
   verifiable on its own. A wide refactor may use an explicit
   expand–migrate–contract sequence when no safe vertical cut exists.
2. Record the right-sizing assessment in every proposed Issue. Split independent
   outcomes into a coordination parent plus child Slices; keep implementation,
   tests, required configuration, and directly required docs together when they
   have no independent value. Batch tiny same-shape edits only when one brief,
   deterministic check, review surface, and rollback boundary cover them.
3. Present titles, exact dependency inputs/outputs, and acceptance coverage for approval before
   publishing multiple Issues.
4. Use the repository Issue template vocabulary:
   Problem, Expected outcome, Acceptance criteria, Scope, Verification,
   Dependencies, Right-sizing assessment, and Local contract links.
5. Apply the configured `needsTriage` state and exactly one configured category.
6. Publish blockers first so later Issues can reference real identifiers.
7. Record published URLs in the applicable workflow `task-links.md` or task file.

## Triage

Every triaged item has exactly one configured category and one configured state:

```text
needsTriage -> needsInfo | readyForAgent | readyForHuman | wontfix
needsInfo   -> needsTriage
```

Read the complete body, relevant comments, labels, author, and dates; for a PR,
read the diff too. Parse prior triage notes so resolved questions are not asked
again. Search the repository for an existing implementation by domain concept,
not only the request wording, and search durable prior decisions in applicable
Specs, ADRs, Workspace decisions, and current semantic traceability. Report
where the search looked. Recommend the category and state before applying any mutation,
with reasoning and the relevant codebase evidence. A
`readyForAgent` item must contain an actionable problem, bounded outcome, scope,
acceptance criteria, exact dependencies, verification signal, and complete
right-sizing assessment. Size metrics are warning signals only; independent
delivery boundaries and consequence control the disposition.
For a Bug or PR, it must also record claim status as `confirmed`, `failed`, or
`insufficient-detail`; only `confirmed` may become `readyForAgent`.

When material requirements or domain language remain unresolved, route
unresolved request shaping through `grilling`, `decision-map`, `generate-spec`,
and conditional domain modeling before recommending `readyForAgent`. Keep the
result behavioral and independently verifiable. The tracker brief is durable
intake context; after acceptance, the local Spec/task/Workspace contract becomes
authoritative for implementation and the mutable tracker never substitutes for
validation, review, finish, or archive evidence.

The pinned Matt protocol's mandatory AI disclaimer and `.out-of-scope/`
rejection knowledge base are explicit local exclusions. This repository does
not post automatic triage comments or create a second rejection-memory
subsystem. External comments remain concrete mutations requiring explicit user
authorization, and prior-decision search uses the repository authorities named
above.

## Link execution

When work starts from a tracker item:

1. Create or resume the explicitly accepted local task workflow.
2. Run `workflow-state.py source <slug> tracker --url <issue-url>` so machine
   state and `task-links.md` agree; record PR and branch/worktree separately.
3. Snapshot the accepted Issue context into the local spec/task contract; do
   not rely on mutable remote text as the only execution contract.
4. After the local acceptance contract passes its acceptance gate, revalidate
   the Issue assessment against current repository evidence and
   record `workflow-state.py right-sizing <slug> acceptance ...` after
   `acceptance=passed` and immediately before scoping passes. The immutable
   receipt fingerprints the current contract; stale or post-scoping snapshots
   fail closed. A `split-required` disposition blocks implementation and
   returns to explicit scope reconciliation.
5. If the remote item changes during execution, surface the delta and reconcile
   it explicitly in the owning Issue session instead of silently changing scope.

## Finish

After local validation, review, and finish evidence pass, report the recommended
tracker transition and PR linkage. Update or close the external item only when
that reconciliation was explicitly requested. Prefer a linked PR with
`Closes #<number>` over manually closing an implementation Issue before merge.
The owning Issue session prepares this recommendation. Coordinator-side
reconciliation or local cleanup begins only after that session has stopped at a
safe terminal boundary and still requires its separate authorization.
