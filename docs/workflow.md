# AI Coding Workflow

## Planning documents

The Guide owns three optional layers:

- `docs/PRD.md` records product commitments when needed.
- `docs/specs/<feature>.md` is a detailed technical Feature Spec when needed.
- `docs/tasks/<task>.md` is the stable implementation plan for one slice that
  must move to a fresh Session.

Matt owns research, clarification, slicing, triage, implementation, TDD,
diagnosis, architecture improvement, code review, and handoff. Trellis supplies
only the principles Plan before code, Specs injected not remembered, Persist
important information, Incremental development, and Capture learnings. No
Trellis Task System, Workspace, Plan/Execute/Finish runtime, or copied spec tree
is used.

## Current-Session work

A bounded request that can be finished now goes directly to Matt `implement`.
Use TDD where a stable seam exists, run useful focused feedback during work,
then run the configured applicable full suite once and `code-review` the
complete engineering diff once. The explicit implementation request authorizes
the scoped local commit; external writes remain separately authorized.

## Fresh-Session Task work

When an accepted slice should leave the planning context:

1. `generate-tasks` reuses a bounded incoming implementation Issue, or invokes
   Matt `to-tickets` when new tracer-bullet implementation Issues are needed.
2. One user approval creates the proposed Task linkage: a reused Issue receives
   only its Task, while a real split creates child Issue + Task pairs and leaves
   the broad coordination parent Task-less.
3. Planning documents are committed before launch and pushed when cross-device
   access is required.
4. The proposal may include a distinct `Launch now` list. For each explicitly
   listed Task, the coordinating Session performs the Task-launch sequence:
   it makes the launch-time model judgment, creates or reuses the dedicated
   branch/worktree with ordinary Git, and only then invokes the current Happy
   launcher with only the prepared directory, selected model, and reasoning
   effort. A Session that is ready and waiting for messages is a successful
   launch; implementation has not started. A full Issue URL uses the GitHub
   form `https://github.com/<owner>/<repository>/issues/<number>`. The
   coordinator then sends the full Issue URL as that Session's first user
   request and stops before implementation. Publication alone leaves every
   unlisted Task ready and creates no execution environment.
5. `start` reads the live Issue first. With a unique Task link, it follows
   `Issue -> Task -> optional Feature Spec/Research` inside the caller-prepared
   directory, verifies the supplied Git context, and waits for explicit
   implementation authority. It does not choose the initial model or create
   the worktree. Without a Task link, it enters intake and the current-Session
   versus fresh-Session choice before any Task-specific read or execution-
   environment check.
6. Matt `implement` performs the slice. After the one final suite and one
   complete-diff `code-review`, `finish-work` marks the Task complete and adds
   only genuinely reusable guidance before the same local commit.

The same Task-launch sequence is used when a previously published ready Task is
selected later for its first launch: the coordinator starts the Session, waits
until it is ready and waiting for messages, then sends the full Issue URL as
the first user request. Publication is not repeated. Before every initial
fresh Task Session, the coordinating Session makes one transient model
judgment: Luna Max is used only when every accepted sufficiency condition is
clearly satisfied, otherwise Sol Medium is used. These are the repository's
accepted operational choices, not replaceable examples or a runtime lookup.
During execution, `start` owns the Model escalation request; changing the model
or requesting a replacement remains a user/client action. Current-Session work,
ordinary resume, and replacement Sessions do not repeat the initial judgment.

The Happy launcher is a caller-supplied-directory seam. It receives only the
prepared absolute directory, selected model, and reasoning effort. Once it has
started a ready Session, including one showing `Waiting for messages`, the
coordinator sends the full Issue URL through that Session's user-message
channel as its first user request. The launcher does not receive or interpret
Issue data, create or reuse the Task branch/worktree, choose the model, or own
Task/Issue routing. Happy remains the current default Session mechanism; its
native worktree option stays available for ad hoc Sessions outside this
workflow.

A launched Task has one Git isolation unit, not one fixed Session. An ordinary
resume reuses the existing Session and does not repeat the launch or create a
new Issue-routing request. A replacement Session reuses the Task's Issue, Task
File, branch, and worktree and repeats only the same native two-step sequence:
start the Session, wait until it is ready and waiting for messages, then send
the full Issue URL as the first user request. Neither path introduces a second
Issue-routing mechanism.
Different parallel writers use different launched Task pairs and worktrees;
shared contracts land serially first.

## Ownership

- Feature Spec: feature-level behavior and applicable technical design.
- Issue: independently deliverable behavior, acceptance, parent, blockers,
  priority, and external queue/delivery state.
- Task File: local Steps, Status, resumable Notes, and document links.
- Git: code, branch/worktree live state, and history.
- Task-launch coordinator: the initial model judgment, ordinary Git
  preparation/reuse, the bounded inputs passed to the Session launcher, and
  delivery of the first user request after Session readiness.
- Session launcher: starts or resumes a Session in the supplied directory; it
  does not receive or interpret Issue data and does not own Task, Issue, model,
  branch, or worktree state.

Links bridge owners but do not create mirrored state. A Step is ordinary
Markdown content and has no ID, Issue, Session, owner, or independent status.

## Incoming Issues

Pinned Matt `triage` reads the complete request, comments, labels, prior
decisions, and relevant code. It keeps the upstream AI disclaimer, Agent Brief,
bug/enhancement categories, five state roles, and lazy `.out-of-scope/` behavior.
After an Issue becomes a bounded slice, the user chooses either current-Session
implementation without a Task or fresh-Session handoff through
`generate-tasks`. The latter reuses the Issue and adds one Task, not a duplicate
Issue. When a broad coordination parent is actually split, accepted child
implementation Issues receive Tasks and the parent remains Task-less. Intake
Issues and unsplit coordination parents may remain Task-less.

## Verification and review

Project commands live in `.ai/project.json`. `workflow-check.py <group>` runs
only the selected group, expands `{python}` to the current interpreter, and
does not classify paths or persist evidence.

Matt `code-review` pins the pre-implementation fixed point and assembles an
ephemeral complete diff from committed, staged, unstaged, and accepted-scope
untracked files. Separate parallel Spec and Standards reviewers inspect that
same input. Both are explicitly spawned as Sol Medium rather than inheriting
the execution Session; `code-review` owns the exact spawn settings and stops if
they are unavailable. No review package, hash, tier, ledger, or second review
pass is stored.

`workflow-ci.py --staged` and `workflow-ci.py --base <ref>` are submission
safety adapters only. They scan the submitted paths/content for secrets,
protected paths, repository schema, and retained template structure. They do
not run the project test suite, review, historical records, or lifecycle proof.

## Host boundary

Repository command configuration uses `{python}` wherever a committed Python
entry point is needed. Runtime expansion uses `sys.executable`; nested Python
calls do the same. Git identities stay repository-relative POSIX paths, while
filesystem access uses native `pathlib` paths. Retained executable shell files
use LF.

Linux is the complete hosted source lane. Native Windows has one bounded hosted
scenario using the documented PowerShell project-creation entry and a real
configured command inside the generated project. It adds no second workflow,
full matrix, fixed test count, command allowlist, or per-delivery rehearsal.

## Historical and source-only material

Historical schema-v1 through schema-v3 files under `docs/workspace/` remain
byte-unchanged and passive. Current Skills, scripts, CI, validators, and
generated projects do not read, execute, copy, or append them.

The template source may retain `sync-template.py`, Change Memory, and four
source-maintenance Skills. They are explicit opt-in maintenance tools, not part
of generated projects, ordinary routing, default checks, Linux CI, or the
Windows lane.

## Downstream template adoption

The upstream publishes immutable template versions. Each adoption selects one
exact tag or commit and one downstream repository. That downstream owns its
upgrade timing, compatibility decisions, verification, and delivery. When the
downstream has `.ai/template-adoption.json`, it owns the local mapping and
exceptions; otherwise the selected upstream version's `.ai/template-sync.json`
applies. The source-side tool provides dry-run and apply for that single target.
No central operational downstream registry, batch apply, recursive propagation,
release planner, or cross-repository adoption state participates.

The [downstream project inventory](workflow/downstream-projects.md) is a
non-operational catalog for counting known direct downstreams. It supplies
neither sync targets nor adoption state.
