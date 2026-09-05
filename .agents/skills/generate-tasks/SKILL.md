---
name: generate-tasks
description: Create the Task linkage for accepted slices moving to fresh Sessions, reusing a bounded incoming Issue or using Matt to-tickets when new implementation Issues are needed.
---

# Generate Tasks

Use this only when accepted work should leave the current planning context. Work that can be implemented immediately in the current Session does not need a Task or Issue.

1. Read the accepted Feature Spec when one exists, plus applicable PRD, research, context, ADRs, architecture, tracker configuration, and any incoming Issue selected by `triage` for fresh-Session handoff.
2. Classify the input. A bounded incoming implementation Issue is reused and receives one Task; do not create a duplicate Issue. If an incoming Issue is a broad coordination parent that must be split, invoke `to-tickets` to propose child implementation Issues and Task pairs. For accepted work without an existing implementation Issue, invoke `to-tickets` for the ordinary tracer-bullet proposal. Do not create a second local ticket format.
3. Propose one independently deliverable behavior per new slice. Shared contracts land before dependent slices; only independent ready slices are parallel candidates. A broad parent receives no Task unless it also contains one bounded direct implementation slice.
4. Before any external write, show the proposed Task paths, whether each Issue is reused or created, Issue titles, acceptance coverage, parent links, blocking edges, and intended `ready-for-agent` label changes. Include a separate `Launch now` list when immediate launch is proposed; omit it or show `None` otherwise. One explicit approval authorizes the shown Task creation and Issue creation/link/label mutations. It authorizes launch only for Tasks explicitly named under `Launch now`; a later launch requires its own explicit launch authority. Publication alone never authorizes launch, implementation, push, PR, merge, or release.
5. For a reused bounded Issue, create only `docs/tasks/<task>.md` from `docs/tasks/template.md`, add the reciprocal Task link to that Issue, and move it to `ready-for-agent`; do not create or triage another Issue. For each approved new slice, create the Task and a GitHub Issue using `.github/ISSUE_TEMPLATE/agent-work-item.md`; a child Issue links its broad parent. Newly created Issues start `ready-for-agent` because this flow already performed shaping.
6. Complete stable links in both directions. The Task links the full Issue URL and optional Feature Spec/Research. The Issue links the Task and optional Feature Spec at repository-stable URLs.
7. Create one ordinary planning commit containing the Feature Spec and Task Files before any launch. Cross-device execution also requires that commit to be pushed; push remains separately authorized.
8. For each Task explicitly approved in `Launch now`, and later when a
   previously published ready Task is selected for its first launch, use the
   same Task-launch sequence below. Do not republish a deferred Task or infer
   launch from its `ready-for-agent` label.
9. The planning or coordinating Session stops before implementation. Publication
   alone creates no execution environment; only an explicitly authorized launch
   may create or reuse the Task's branch/worktree and start a fresh Happy
   Session in the prepared worktree. After the Session is ready and waiting for
   messages, the coordinator sends the full Issue URL
   (`https://github.com/<owner>/<repository>/issues/<number>`) as its first user
   request.

## Task-launch sequence

The coordinating Session uses the same launch sequence for each explicitly
approved `Launch now` entry and each later-selected ready Task:

1. Confirms the Task, its bounded Issue, and explicit launch authorization. A
   later launch uses the already-published Task and Issue linkage rather than
   creating another one.
2. Performs one transient Launch-time model judgment before the initial fresh
   Task Session and states the selected model, reasoning effort, and one short
   reason in the launch response. For the repository's judgment, use Luna Max
   only when all of the sufficiency conditions below are clearly true; otherwise
   use Sol Medium.
3. Uses ordinary Git to create or reuse the Task's one dedicated branch and
   worktree before invoking any Session launcher. The Task File and any linked
   Feature Spec must be reachable from that worktree's Git base.
4. For both an immediate `Launch now` entry and a later-selected ready Task,
   invokes the current Happy launcher only after preparation, passing only the
   prepared absolute directory, selected model, and reasoning effort. A Session
   that is ready and waiting for messages is a successful launch; implementation
   has not started. The coordinator then sends the full Issue URL as that
   Session's first user request. The launcher does not receive or interpret
   Issue data, choose the model, create or reuse the worktree, or own Task/Issue
   routing.

The `start` Skill runs execution-side in that supplied directory. It reads the
live Issue, follows its unique Task and optional Feature Spec/Research links,
and verifies the supplied Git context; it does not perform the initial model
judgment or worktree preparation. A replacement Session reuses the same Task
branch/worktree and repeats only the same native two-step sequence: it becomes
ready and waiting for messages, then the coordinator sends the full Issue URL
(`https://github.com/<owner>/<repository>/issues/<number>`) as its first user
request. An ordinary resume does not repeat the launch or routing. Neither path
introduces a second Issue-routing mechanism.

## Launch-time model judgment

Evaluate each initial Task launch independently, choosing for reliable
acceptance first and cost second. Apply the repository's judgment to the Task's
facts; a requested model does not bypass the sufficiency rule below.

Use `Luna Max`, the repository's accepted Cost-efficient operational choice,
only when all of these are clearly true:

- the slice and acceptance are bounded and explicit;
- consequences are low or ordinary and do not trigger `risk-gate`;
- verification is deterministic;
- no substantial root-cause or architecture uncertainty remains; and
- the stopping condition is clear.

If any condition is false or uncertain, use the repository's accepted Stronger
operational choice, `Sol Medium`. Luna Max and Sol Medium are fixed choices for
this repository's Task-launch judgment, not replaceable examples and not a
runtime availability lookup. Keep the choice transient; do not write it to the
Task, Issue, labels, Git, a state file, or a log.

Task files own only `Status`, implementation `Steps`, resumable `Notes`, and links. Issues own slice scope, acceptance criteria, parent, blockers, priority, and queue/delivery state. Never duplicate those fields or create Step IDs, Step Issues, Session state, claims, receipts, or a Workspace.
