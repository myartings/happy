# External Tracker Workflow

## Purpose

The tracker provides a durable, human-visible queue and acceptance boundary for
work that must survive delayed pickup, coordinate multiple contributors or
agents, or deliver through a pull request. It is not the Agent execution ledger.

```text
Tracker item -> local workflow -> branch/worktree -> pull request -> merge
     queue       evidence          execution          review        closure
```

Local `docs/specs/`, `docs/tasks/`, and `docs/workspace/` remain authoritative
for accepted scope, resumable state, exact validation, review, and finish.

`tracker-workflow` is the single operational tracker surface. Matt owns
external-request intake quality; repository integration separately owns adapter
resolution, label mapping, read-before-write checks, and explicit
external-mutation authorization. A standalone `triage` alias is intentionally
absent because it would duplicate protocol without changing the tracker entry
point.

An accepted task binds one independently deliverable Issue only when it needs an
external queue, coordination boundary, or pull-request ownership. Otherwise it
uses an accepted local source. Record the selected source through `python3
scripts/workflow-state.py source`; prose alone is not a task gate.

Every durable implementation Issue proposed for publication or
`ready-for-agent` carries the right-sizing assessment in
`ticket-task-contract.md`. It records the behavior, acceptance seam, exact
dependency inputs/outputs, review, rollback, context, consequence/signals, and
disposition. Parent/child structure coordinates outcomes but never substitutes
for dependency interfaces.

## Issue-first authority boundary

An **Issue imperative** is an explicit request to handle one named Issue. It
authorizes read-only inspection and a bounded preparation proposal, but it does
not itself accept or create a Trellis Workspace. Workspace activation requires
explicit acceptance of one independently deliverable delivery slice through
the local state owner.

The Issue owns human-visible intent, queue position, dependencies, and
acceptance discussion. Local Specs and Workspace evidence own accepted scope,
execution state, validation, review, and finish truth. A label, assignment,
comment, or closed state never marks a local lifecycle gate passed.

Durable, deferred, cross-session, cross-device, dependency-bearing, multi-slice,
or dedicated-worktree implementation starts from a named Issue. Immediate
bounded normal-risk work may remain Issue-optional. A broad Issue is decomposed
before implementation rather than mapped to multiple active Workspaces.

`workflow-state.py source` rejects a tracker Issue already bound to another
non-archived Workspace before changing local state or task links. Archived
history remains passive; concurrent route authority is outside this policy
slice and retains its separate follow-up boundary.

Tracker mutation, push, PR creation, merge, destructive Git action, and client
launch keep their separate authorization boundaries. If the configured target
or named Issue is ambiguous, stop without external mutation. Creating a later
Issue neither interrupts nor activates the currently accepted slice.

## Project configuration

Declare the adapter in `.ai/project.json`:

```json
{
  "tracker": {
    "provider": "github",
    "target": "OWNER/REPOSITORY",
    "categories": {
      "bug": "bug",
      "enhancement": "enhancement"
    },
    "states": {
      "needsTriage": "needs-triage",
      "needsInfo": "needs-info",
      "readyForAgent": "ready-for-agent",
      "readyForHuman": "ready-for-human",
      "wontfix": "wontfix"
    }
  }
}
```

`target` may be `null` in a fresh scaffold. A GitHub adapter can then infer one
unambiguous `OWNER/REPOSITORY` from Git remotes for read-only discovery. Configure
the target explicitly before writes when remotes disagree, such as fork-based
`origin` and `upstream` workflows. Use `provider: none` with `target: null` for a
deliberately local-only project.

New projects can set the target during creation:

```bash
./scripts/create-project.sh MyProject --profile generic \
  --github-repository OWNER/REPOSITORY
```

## Issue lifecycle

Use exactly one category and one state on each triaged Issue:

```text
needs-triage -> needs-info | ready-for-agent | ready-for-human | wontfix
needs-info   -> needs-triage
```

- `bug` and `enhancement` describe the request.
- `needs-triage` means the maintainer has not accepted an execution contract.
- `needs-info` waits for specific missing evidence or decisions.
- `ready-for-agent` has enough bounded context and verification to delegate.
- `ready-for-human` requires human judgment, access, or manual execution.
- `wontfix` records an evidenced rejection or already-satisfied request.

Triage reads complete tracker context (and the diff for a PR), searches the
codebase by domain concept for redundancy, searches durable Specs, ADRs,
Workspace decisions, and current semantic traceability for prior decisions, and gives
the maintainer a category/state recommendation before any mutation. Bug and PR
claims must be `confirmed`, `failed`, or `insufficient-detail`; only confirmed
claims can reach `ready-for-agent`.

Agent-ready triage also verifies the right-sizing assessment. Independent
deliverables become child Slices under an optional coordination parent;
supporting technical layers remain one vertical Slice when fragments are not
useful alone; tiny same-shape repetitions may batch only behind one brief,
deterministic check, review surface, and rollback boundary. Size metrics are
warnings, while consequence and independent delivery boundaries decide.

Materially underspecified requests route conditionally through `grilling`,
`decision-map`, `generate-spec`, and domain modeling. An agent-ready tracker
brief remains behavioral and verifiable, but the accepted local contract becomes
implementation authority. The pinned Matt AI-comment disclaimer and
`.out-of-scope/` rejection knowledge base are explicit exclusions: comments are
authorization-bound external writes, and existing repository authority is the
only prior-decision memory searched by this template.

## From plan to Issue

Use `generate-tasks` to create dependency-aware vertical slices. When external
publication is requested, route through `tracker-workflow`, show the proposed
right-sizing assessment and breakdown first, then publish blockers before
dependent Issues. Record exact consumed artifacts/interfaces and the URLs in
local task/workspace links.

## From Issue to execution

When starting accepted tracked work, snapshot the Issue into repository
contracts and create the task Workspace. Link the Issue, PR, and branch/worktree
in `task-links.md`. Later Issue edits are scope changes to reconcile explicitly,
not invisible updates to a running Agent.

```bash
python3 scripts/workflow-state.py source <slug> tracker \
  --url https://github.com/OWNER/REPOSITORY/issues/NUMBER
```

After the accepted Issue context is present in the local spec/task contract and
`acceptance=passed`, revalidate and snapshot the Issue assessment immediately
before scoping passes:

```bash
python3 scripts/workflow-state.py right-sizing <slug> acceptance \
  --route accept-slice \
  --outcome "..." --acceptance-seam "..." --dependencies "..." \
  --review-boundary "..." --rollback-boundary "..." \
  --context-boundary "..." --consequence "..." --evidence "..."
```

## Visible prepared-session claims

The coordination session owns tracker operations and inert session preparation.
After a dedicated Issue session is selected, it may route, prepare the exact
worktree and capsule, publish an explicitly authorized locator, and launch or
prepare recovery, but it stops before creating or advancing the Issue Workspace,
generating the detailed plan, editing the deliverable, running implementation
checks/review, or preparing commit/PR delivery. The owning Root—either the exact
confirmed Issue session or the current Root selected by an explicit named-Issue
isolation opt-out—re-reads the live source, receives or confirms acceptance, and
owns the complete local lifecycle through finish and delivery preparation.

Coordinator intent, Project fields, comments, handoff prose, and launch output
remain infrastructure evidence and cannot transfer acceptance or pass a local
gate. Bounded writers and independent reviewers remain helpers under the owning
Root rather than alternate Issue owners.

Before preparing a human-selected named-Issue session, read the exact live
Project item and latest claim or transfer comment. An occupied `In Progress`,
`Blocked`, or `Review` projection stops ordinary duplicate preparation until the
user selects transfer, replacement, or cleanup. Surface its state, Agent,
Device, branch, and worktree. `Inbox` and `Ready` may leave Agent/Device empty;
`Done` may retain the last values for traceability.

Observe `workflow-issue-route.py` as a separate read-only boundary and use its
exact Issue, verified base, canonical branch, absolute worktree, and selected
client/session label in the authorization proposal. Rerun and match the Issue,
base, branch, and worktree immediately before mutation. Verify the registered
branch/worktree and minimum recovery state before authorized external writes.

The authorized projection updates only the selected item to `In Progress` with
non-empty Agent and Device, leaves Priority unchanged unless separately
authorized, and appends one cooperative, observational locator comment. Re-read
the exact item and comment before launch. A write or verification failure
preserves local preparation, returns `manual-start-required`, and performs no
launch.

Before launch, the locator states that local acceptance is pending and no
Workspace exists. If the coordinator later changes material Issue intent,
dependencies, hierarchy, labels, or acceptance discussion, the owning session
re-reads and explicitly reconciles the delta before continuing.

A transfer requires separate authorization and a prepared receiver. Update the
current Agent/Device and append a new locator while preserving earlier comments.
No automatic release, claim ledger, lease, heartbeat, retry, polling,
contention mechanism, or second tracker state machine is introduced.

Project fields and comments cannot create or pass a Workspace gate, replace
exact Git/session identity, or serve as portable recovery. Generic Issue
handling or continuation never authorizes external mutation.

For an accepted local task without an external queue:

```bash
python3 scripts/workflow-state.py source <slug> local-only \
  --reason "<why no durable external queue is needed>" \
  --approval "<where the exception was explicitly approved>"
```

## Finish and closure

Validation and whole-diff review pass locally before any Issue is considered
complete. Prefer linking the delivery PR with `Closes #<number>` so GitHub closes
the Issue when the PR reaches the default branch. If external mutation was not
explicitly requested, report the recommended label/comment/closure instead of
performing it.

The owning Issue session prepares that completion recommendation. A coordinator
may perform separately authorized tracker reconciliation and safe worktree or
branch cleanup only after the owning session is no longer using the worktree and
has reached a safe terminal boundary.

## Interface boundary

Use GitHub's browser or mobile UI for broad browsing, Projects, complex forms,
notifications, and review. Use Agent skills for structured creation and triage.
Coding clients such as Happy should deep-link or start a Session from an Issue;
they do not need to mirror the complete tracker interface.
