# Execution Isolation Policy

This template lets the agent choose the lightest execution route that improves
speed, context quality, or safety. The main session is the default
implementation owner for Low-risk work and ordinary single-slice Feature work.
Use subagents and worktrees for research, review, batch work, long-running
isolation, high-risk experiments, and clearly scoped writer delegation.
Execution topology is independent from change intensity and decision
uncertainty; changing session, branch, worktree, or agent ownership does not
change the accepted delivery slice or its evidence depth.

When subagents or worktrees are selected, the main session remains the
orchestrator. It decomposes the work into focused roles, gives each role the
minimum context it needs, and owns integration and final verification.

## Context and Coordination Policy

Model guidance does not create a child context. Scoping selects implementation
topology first as `current-root` or `isolated-writer`; a branch alone is not
isolated-writer evidence. Capability is considered only inside that selected
owner. If a Luna Root crosses a Sol boundary, visible operator `/model` plus
`/status` confirmation or a fresh suitable Root is required. Model guidance
never creates a child, batch, branch, or worktree. After the workflow
independently selects a context, these context policies apply:

- `current-session`: root work continues in the existing conversation.
- `runtime-default`: the runtime keeps its current child-context behavior. This
  is the first-phase policy for Explorer, Researcher, Writer, Mechanical,
  Architect, Diagnose, Reviewer, and fallback roles.
- `clean-review-package`: independent Spec and Standards reviewers start with no
  conversation history and receive only the complete pinned review package.
- `clean-task-capsule`: reserved for a later evidenced rollout to another role;
  no role uses it by default.

All child coordination is depth one. Wait only for work on the current critical
path, do not alternate reflexively between listing and waiting, send at most one
follow-up for an unchanged evidence revision, and stop once the output is
accepted. This policy does not impose a fixed thread cap; concurrency remains a
scoping and ownership decision.

Dispatch observation and token correlation belong to AgentsView or an explicit
agent-usage audit, not to the core workflow or its lifecycle state.

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

The primary Git checkout normally stays on the repository default branch so it
remains a predictable foreground and integration point. When a new independent
Agent task benefits from isolation, prefer the client's native worktree flow.
This preference does not prohibit a deliberate branch switch and does not
create an Issue, Trellis Workspace, branch, worktree, session, handoff, script,
gate, receipt, or other lifecycle evidence. Single-foreground, single-session,
normal-risk work may remain in the current checkout.

## Human-facing Session Boundary

A fresh human-facing session is an operator workspace in Codex, Claude Code,
OTTY, or another client. It is not a subagent: a subagent is a bounded child of
the current task whose result returns to the current orchestrator. A handoff is
only durable recovery input and does not create or authorize either one.

Create that recovery input only for an actual pause, an actual transfer, or an
explicit user request. Planning, Issue inspection, and worktree preparation alone do not create a handoff.
Ordinary lifecycle progress does not independently generate it.
Before readiness, observe the exact repository root.
Before readiness, observe the exact HEAD.
An active-code handoff records these exact identity dimensions:

- Repository identity
- Issue and accepted local slice
- Branch and registered worktree
- Explicit Git status, including modified and untracked files

Ambiguity or mismatch in any identity dimension fails closed as `not cross-device-ready`.
The handoff also records completed and remaining work, checks, decisions,
blockers, and the smallest next action. It references durable authorities by
exact path, revision, or URL instead of copying them.

Cross-device active code is ready only when a verified commit on an accessible
remote ref, an accessible PR/source ref, a target-accessible Git bundle/patch,
or another explicitly recorded recoverable Git artifact covers the in-flight
code and the target can use its recorded recovery path. A local-only commit,
branch, existing HEAD, launch capsule, or handoff prose does not cover that
boundary or later uncommitted changes.
An active-code handoff is `not cross-device-ready` when Issue/slice identity is ambiguous, the artifact does not cover in-flight work, or the target cannot access its recovery path.
Uncommitted files remain on the source device and the work stays local. The
handoff creates no Git artifact.
The handoff never authorizes client launch, commit, push, PR, tracker mutation, or destructive Git actions.

Create the temporary file at a non-predictable path, verify mode `0600`, and include cleanup instructions.
Do not delete it before the receiving session consumes it.

The agent may recommend a fresh session for a new independent delivery slice,
materially noisy or near-limit context, long-running isolation, or an intended
client or machine switch. The recommendation is advisory and inert. Continue
the accepted slice in the current session when context and ownership remain
coherent; use the existing subagent rules for bounded child roles.

A fresh Slice session loads only its accepted Slice contract, binding global
constraints, exact dependency interfaces, and relevant repository context. A
coordination parent's complete plan and accumulated conversation remain outside
that context unless a specific dependency requires them.

Create or prepare a human-facing session, branch, worktree, tab, window, or
client launch only after the user explicitly requests that action. A direct
affirmative response is sufficient only when it answers the immediately
preceding bounded proposal and that proposal names the task, branch/worktree
effects, and selected client or manual handoff. Generic execution prompts such
as `继续`, `做吧`, or `continue` do not independently grant session-launch
authority.

After authorization, record a client-neutral launch capsule: task or Workspace,
Issue and repository identity, branch, worktree path, durable resume source,
observed Git state, manual-start/native-handoff instruction, and initial prompt.
The capsule explicitly records that launch has not occurred and contains no
credentials. It is inert output: it cannot create a session, choose a client,
authorize launch, or claim that launch occurred. A user-selected platform
adapter may consume it. Installed applications and available skills do not
establish user intent, so the core workflow has no default launcher and does
not prefer OTTY, Codex, Claude Code, or any other client. Session-launch
authorization is an interaction boundary, not a lifecycle gate.

Visible named-Issue claims follow `tracker-workflow`: local recovery preparation
precedes any explicitly authorized Project/comment publication, and exact
post-read verification precedes launch. A failed write or verification preserves
the prepared worktree and returns `manual-start-required`. The projection cannot
prove Root binding, advance Trellis, or transport code.

## Dedicated Issue-session ownership

Once a dedicated Issue session is selected, one Root owns the complete local
delivery lifecycle. The coordination session may operate the tracker under
explicit mutation authority, run the deterministic router, create or reuse the
exact worktree, write the minimum inert capsule, publish an authorized locator,
and launch or prepare recovery. Those infrastructure actions stop before
Workspace creation, local acceptance, detailed planning, deliverable edits,
implementation checks/review, or delivery preparation.

The owning Root is either the exact confirmed native-handoff/fresh session or
the current Root selected by an explicit named-Issue isolation opt-out. It
re-reads the live Issue and repository. After it receives or confirms user acceptance, that Root
creates or accepts the Workspace and integrates planning, decisions, risk,
right-sizing, scoping, implementation, checks, independent review, finish, and
delivery preparation. Writer subagents and reviewers may assist but remain
inside that Root-owned plan. Tracker projection, coordinator prose, handoff
content, and launch output remain inert and cannot pass a gate.

A material tracker change during execution returns to the owning session for an
explicit contract delta. Pause, crash, transfer, or recovery preserves the same
Issue ownership and requires verified rebinding before lifecycle work resumes.
Coordinator-side tracker reconciliation or local cleanup begins only after the
owning session stops at a safe terminal boundary; existing authorization,
dirty-state, recoverability, and non-force cleanup guards still apply.

## Root Session–Worktree Affinity

Root sustained implementation stays in the checkout selected by the current
human-facing session. When Root selects a different linked worktree as the
continuing implementation environment, one of these boundaries must complete
before implementation resumes:

- A platform-native handoff may rebind the existing human-facing session to
  the target worktree while preserving the task and execution environment.
- When native handoff is unavailable or cannot prove the rebind, the user starts
  or explicitly authorizes a fresh human-facing session in the target worktree.

The original session may inspect worktrees, prepare an explicitly authorized
branch/worktree, and write the neutral launch capsule. It then stops before
sustained implementation in the target. Per-command shell or tool `workdir`
overrides do not rebind the session and are not a substitute for either
boundary.

The primary-checkout preference does not require a new session for a deliberate
branch created in the current checkout or after a successful native handoff.
Bounded writer-child worktrees, read-only inspection, and temporary merge,
integration, or deterministic verification are exempt only while their results
return to the current owner and they do not transfer sustained Root
implementation. If the runtime cannot prove a native rebind, treat the target
worktree as a separate session boundary and fail closed before edits.

For an accepted named-Issue route, a session-root path, branch, process working
directory, or caller assertion alone cannot prove ownership. `current-root`
requires one exact usable registered Issue worktree plus matching, explicitly
confirmed `native-handoff` or `fresh-session` evidence for the Issue,
repository, branch, and worktree. The existing explicit named-Issue isolation
opt-out may select only the current checkout and relaxes no other authority.
Missing or ambiguous evidence returns one `manual-start-required` boundary and
preserves the prepared worktree and inert capsule.

## Queue Planning

Parallel planning activates only when an accepted task has multiple independent
ready units or delegated writer isolation is explicitly selected. Serial and
no-task work create no parallel receipt. When multiple issues, spec slices, or
Workspace tasks are ready, the main session plans the queue before code edits:

1. List candidate issues/slices and their readiness.
2. Map dependencies, related issues, duplicates, and priority.
3. Map likely file ownership and shared resources.
4. Land shared contracts serially when needed.
5. Dispatch only parallel-eligible writer children to subagents in worktrees.
6. Keep serial-only, needs-info, and human-decision work out of the parallel
   batch.
7. Reassess the remaining queue when integration unlocks or invalidates work.

Planning annotations are advisory. For an actual batch, `scoping` records the
initial route. If implementation later changes readiness, dependencies, or ownership,
append `workflow-state.py parallel-reassess`; the latest event becomes current
without erasing prior decisions. Do not record a re-evaluation for an unchanged
execution graph.

This is the route for an accepted queue, not for generic continuation language.
If only one candidate is executable after queue analysis, route it back to
main-session implementation
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
- expected base and expected merge-base
- named integration checks that must pass before cleanup

Before creation, inspect `git worktree list` and repository submodules, verify
the candidate location is outside the repository or safely ignored, and run the
configured child baseline. Resolve and compare the expected base/merge-base with
the actual branch point; a mismatch blocks creation. A writer child may not create or delegate another
writer; the parent retains decomposition and integration ownership.

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

## Owned Worktree Cleanup

Clean up only a linked worktree that this repository workflow created and no
longer needs. Move outside that worktree. Inspect
`git -C <worktree> status --porcelain -uall` before removal. If the result is
non-empty or normal removal is refused, preserve the worktree, show the human
the modified and untracked paths, and wait for an explicit disposition.

Never add `--force` on the agent's initiative. A successful merge, check, or
review proves the committed result; it does not prove that every file in the
worktree is recoverable elsewhere.

Do not remove the branch or worktree merely because a child reports success.
Cleanup eligibility begins only after the parent integrates the expected
base/merge-base result and the child contract's named integration checks pass.
