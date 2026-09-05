# Issue tracker: GitHub

Resolve this repository's target from `.ai/project.json` and use `gh` for reads
and writes. Personal global guidance may additionally configure one
cross-repository Project; generated projects never embed that personal identity.

## Issue operations

- Read an Issue and relevant comments before acting:
  `gh issue view <number-or-url> --comments --json number,title,body,state,labels,comments,url`.
- Issues enter this workflow when the user creates one on the tracker or when
  `publish-tasks` creates or reuses one for an accepted Task. A conversational
  request to create a Task-less Issue receives routing advice rather than an
  external write.
- Use `publish-tasks` only for selected existing Tasks. A published Issue links
  one stable Task path, projects its Goal and completion conditions, and uses
  native blocked-by relationships for hard Task dependencies. Task files are
  unchanged and carry no Issue backlink.
- Reuse an existing broad Issue when it resolves to one Task. If it resolves to
  several Tasks, it may remain as their native aggregate Issue. Never create an
  aggregate Issue merely to group work from a PRD or Feature Spec.
- Incoming Task-less Issues use explicit pinned `triage`. The receiving Session
  is a coordinator. It may implement a simple shaped Issue in place; all other
  executable Issues require `generate-tasks` and `publish-tasks` before the
  coordinator launches a newly selected execution Session.

## Project status

When the personal Project is configured, use Inbox, Ready, In Progress,
Blocked, Review, and Done. Correct stale state when the Issue is touched.

- A user-created Issue is added to the Project on its first triage touch and
  stays in Inbox while unshaped or waiting for information.
- A simple shaped Issue and a Task-backed unblocked Issue enter Ready. A
  Task-backed blocked Issue enters Blocked. A non-simple Task-less Issue stays
  in Inbox even when triage has applied `ready-for-agent`.
- Before executable Issue work starts, successfully change an eligible item to
  In Progress and set optional Agent and Device values. An existing In Progress
  claim requires explicit takeover; claim failure blocks a new start.
- Keep `ready-for-agent` after claim. It classifies suitability, not progress.
- Later update failures are reported without undoing local work and are
  corrected on the next touch.
- An Issue-backed PR moves the Issue to Review and uses `Closes #<number>`.
  Merge closes the Issue; native Project automation moves it to Done and
  archives it.
- An aggregate Issue may be In Progress while its children are delivered. It
  has no Task, claim, Agent, or Device.

Project fields do not store Session IDs, resume locators, concrete models,
branches, or worktrees. Use native sub-issues for aggregation and native
blocked-by links for execution order. Do not add background synchronization,
heartbeats, leases, or custom locks.

## Task launch

Task publication and launch are separate. Under explicit launch authority, the
coordinator chooses the model, prepares the dedicated branch/worktree with
ordinary Git, starts the Session in that directory, waits until it is ready and
waiting for messages, then sends the full Issue URL
`https://github.com/<owner>/<repository>/issues/<number>` as its first user
request. The launcher does not receive or interpret Issue data.

An ordinary resume reuses the existing Session. A replacement Session reuses
the same Issue, Task, branch, and worktree, becomes ready and waiting for
messages, and receives the same full Issue URL as its first user request.
Neither route republishes the Task.

## Authorization

Create, edit, comment, label, close, reopen, assign, add to Project, or otherwise
mutate an Issue only within the concrete external write the user requested or
approved. Issue publication does not authorize launch, implementation, push,
PR, merge, or release. PR operations remain separately scoped.
