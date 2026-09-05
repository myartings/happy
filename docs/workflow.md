# AI Coding Workflow

## Planning route

The Guide owns three optional local documents:

- `docs/PRD.md` records durable product commitments.
- `docs/specs/<feature>.md` records a detailed technical contract.
- `docs/tasks/<task>.md` is a self-contained implementation and resume plan for
  one accepted slice moving to a fresh Session.

An idea-to-build request starts with the explicit Matt `grill-with-docs` entry.
After the user confirms shared understanding, the coordinator states whether
PRD, Feature Spec, and Task are needed, gives one short reason for each skip,
and enters the first applicable step. Inapplicable documents are omitted rather
than created empty.

Matt owns research, clarification, triage, implementation, TDD, diagnosis,
architecture improvement, code review, and handoff. Trellis contributes only
Plan before code, Specs injected not remembered, Persist important information,
Incremental development, and Capture learnings. No Trellis runtime, Workspace,
or copied spec tree is used.

## Two GitHub Issue origins

Issues enter the workflow through two intentionally distinct paths:

1. The user creates an Issue on the tracker. Its first workflow Session uses
   `triage`; until shaped, it may remain Task-less in the configured Project's
   Inbox.
2. `publish-tasks` externalizes already accepted local Tasks. It creates or
   reuses one Issue per Task, links the Issue to the Task, mirrors hard Task
   dependencies as native blocked-by relationships, and adds the Issue to the
   configured Project as Ready or Blocked. It does not edit Tasks or launch
   Sessions.

A conversational request to record an idea or create a Task-less Issue receives
routing advice rather than an external write. Work moving toward implementation
starts with `grill-with-docs`; a tracker-only note is created by the user.

An existing broad Issue refined to one slice is reused. If it is refined to
multiple independent slices, it may remain as their native aggregate Issue;
the workflow never manufactures an aggregate merely because several Tasks
share a PRD or Feature Spec. Hierarchy groups work. Dependencies order work.

## Current-Session work

A bounded request that can be finished now needs no Task, Issue, or worktree.
When the user reports a Bug directly in the Session, `diagnosing-bugs` starts
the investigation without creating an Issue. Diagnosis alone stops before
implementation edits; a request to fix supplies that additional authority.
Before implementation edits, create or switch to an ordinary feature branch
when the checkout is on the repository's default branch. Matt `implement`
remains explicit-only: recommend it and wait when it has not been invoked. Once
invoked, use TDD where a stable seam exists, run useful focused feedback during
work, then run the configured applicable full suite once and `code-review` the
complete engineering diff once. The explicit implementation request authorizes
the scoped local commit; external writes remain separately authorized.

An incoming Issue without a Task makes the receiving Session a coordinator and
uses pinned Matt `triage`. It stays in that Session for implementation only
when the shaped work is singular, needs no PRD, Feature Spec, resumable
multi-step plan, material cross-module change, risk decision, or architecture
decision, fits the current model, and can be implemented and verified there.
Otherwise the coordinator must create and publish the Task, judge the model,
and launch a new execution Session.

## Fresh-Session Task work

When an accepted slice should leave its planning context:

1. `generate-tasks` proposes independently deliverable local Tasks, their hard
   dependencies, and the exact Issues that the following step will reuse or
   create. Acceptance authorizes that previewed publication as well as writing
   the self-contained Task files.
2. `publish-tasks` creates or reuses exactly one Issue per accepted Task. A
   changed publication plan requires renewed approval. Publication alone
   creates no execution environment, and no Task launches without its Issue.
3. Planning documents are committed before launch and pushed when cross-device
   access requires it.
4. Under explicit launch authority, the coordinator makes the transient model
   judgment and creates or reuses one dedicated branch/worktree per Task with
   ordinary Git. It invokes the current Session launcher with only the prepared
   absolute directory, selected model, and reasoning effort.
5. Once the Session is ready and waiting for messages, the coordinator sends
   that Task's full Issue URL returned by `publish-tasks`, in GitHub form
   `https://github.com/<owner>/<repository>/issues/<number>` as its first user
   request. A one-slice incoming Issue may reuse its original URL; a split uses
   the corresponding sub-issue URL. The launcher does not receive or interpret
   Issue data.
6. `start` reads the live Issue, follows its unique Task link and optional
   document links, verifies the supplied Git context and configured Project
   claim, then reports the loaded goal and next action.
7. Matt `implement` performs the slice. After the one final suite and one
   complete-diff `code-review`, `finish-work` marks the Task complete and adds
   only genuinely reusable guidance before the same local commit.

Use Luna Max for the initial Task Session only when every accepted sufficiency
condition is clearly satisfied; otherwise use Sol Medium. Current-Session work,
ordinary resume, and replacement Sessions do not repeat that judgment. A
replacement Session reuses the same Issue, Task, branch, and worktree, becomes
ready and waiting for messages, then receives the same full Issue URL as its
first user request. Neither route republishes the Task.

## Personal Project coordination

Personal global guidance may configure one cross-repository GitHub Project.
Generated projects carry the behavior but never the personal Project number,
repository inventory, or personal field options.

The active board uses Inbox, Ready, In Progress, Blocked, Review, and Done.
Priority plus optional Agent and Device selects are the only allocation
metadata. Session IDs, resume locators, concrete models, branches, and
worktrees remain outside the Project.

For an executable Issue, changing an eligible item to In Progress is the
cooperative claim. An existing In Progress claim requires explicit takeover;
failure to establish the initial claim blocks a new implementation start.
Later status update failures are reported without undoing local work and are
corrected on the next touch. No heartbeat, lease, lock service, or background
synchronizer is used.

User-created Issues are added on their first triage touch and remain in Inbox
while unshaped or waiting for information. A simple shaped Issue or a
Task-backed unblocked Issue enters Ready; a Task-backed blocked Issue enters
Blocked. A non-simple Task-less Issue may carry `ready-for-agent` after triage,
but remains in Inbox until its Task is linked. Opening an Issue-backed PR moves
its Issue to Review and uses a closing keyword; merging closes the Issue, and
native Project automation moves it to Done and archives it. The
`ready-for-agent` label remains after claim because it describes specification
suitability rather than execution progress or, by itself, execution eligibility.

An aggregate Issue can remain In Progress while its native sub-issues are being
delivered. It has no Task, claim, Agent, Device, branch, worktree, or Session;
its status describes aggregate delivery only.

## Ownership

- PRD: durable product commitments.
- Feature Spec: feature-level behavior and applicable technical design.
- Task: executable local Goal, completion conditions, Steps, Status,
  dependencies, resumable Notes, and document links.
- Issue: an external projection of scope and acceptance plus blockers,
  priority, labels, and queue state.
- Project: shared delivery and cooperative claim state.
- Git: code, local branch/worktree state, and history.
- Task-launch coordinator: model judgment, ordinary Git preparation, bounded
  launcher inputs, and delivery of the first Issue request after readiness.
- Session launcher: starts or resumes an Agent in a caller-supplied directory.

Task publication is a one-way projection, not live Task/Issue synchronization.
A Step is Markdown content and has no independent Issue, owner, or status.

## Verification and review

Project commands live in `.ai/project.json`. `workflow-check.py <group>` runs
only the selected group and expands `{python}` to the current interpreter.

Matt `code-review` pins the pre-implementation fixed point and supplies the
complete committed, staged, unstaged, and accepted-scope untracked diff to
separate parallel Spec and Standards reviewers. Both use Sol Medium. No review
package, ledger, or second review pass is stored.

`workflow-ci.py --staged` and `workflow-ci.py --base <ref>` are submission
safety adapters. They scan submitted paths and content for secrets, protected
paths, repository schema, and retained template structure; they do not rerun
the project suite or semantic review.

This redesign is accepted only after one fresh Codex Session performs a
read-only smoke of Skill discovery and the representative routes for a
conversation Bug, a user-created Task-less Issue, and a Task-linked Issue. The
smoke is reported once; it is not a permanent workflow phase or proof artifact.

## Host and maintenance boundaries

Repository command configuration uses `{python}` for committed Python entry
points. Runtime expansion uses `sys.executable`; Git identities remain
repository-relative POSIX paths while filesystem access uses native `pathlib`.
Linux is the complete hosted source lane; native Windows retains one bounded
hosted scenario.

The retired `docs/workspace/` path remains absent from the upstream template
and generated projects. Happy's two preserved historical indexes are passive
downstream evidence governed by `AGENTS.md`.

The source publishes immutable template versions. Each downstream independently
chooses one exact tag or commit, performs its own dry-run and verification, and
lands its own adoption. The downstream inventory is a non-operational catalog,
not a central propagation mechanism.
