# Issue tracker: GitHub

Issues for this repository live on GitHub. Resolve the target from
`.ai/project.json` and use `gh` for reads and writes.

## Conventions

- Read an Issue and relevant comments before acting:
  `gh issue view <number-or-url> --comments --json number,title,body,state,labels,comments,url`.
- Create, edit, comment, label, close, reopen, assign, or otherwise mutate an
  Issue only when the user explicitly authorizes that concrete external write.
- A full Issue URL is the first user request for Task-bound work, sent after
  the coordinator starts a fresh Happy Session in the prepared worktree and
  that Session is ready and waiting for messages. Use the GitHub form
  `https://github.com/<owner>/<repository>/issues/<number>`.
- A Task-created implementation Issue contains stable Task and optional Feature
  Spec links. `start` follows that unique Task link; it never scans for a match.
- Issues created by `generate-tasks` are already shaped and start
  `ready-for-agent`; do not triage them again. A bounded incoming Issue selected
  for fresh-Session handoff is reused: `generate-tasks` creates its Task and
  reciprocal link but no duplicate Issue. A broad coordination parent gets
  child Issue + Task pairs only when the accepted proposal actually splits it.
- Task/Issue publication does not imply launch and creates no branch, worktree,
  or Happy Session. A proposal may include a separate explicit `Launch now`
  list; under that publication approval, only listed Tasks may have their
  dedicated branch/worktree created or reused and their Happy Sessions started.
  A previously published ready Task selected later requires separate explicit
  launch authority.
- Immediate `Launch now` entries and previously published ready Tasks selected
  later use the same coordinator-owned launch sequence: make the transient
  model judgment, create or reuse the dedicated branch/worktree with ordinary
  Git, then invoke the Session launcher with only the prepared absolute
  directory, selected model, and reasoning effort. A Session that is ready and
  waiting for messages is a successful launch; implementation has not started.
  The coordinator then sends the full Issue URL as that Session's first user
  request. The launcher does not receive or interpret Issue data or own Task,
  Issue, or worktree behavior; a later selection still requires explicit launch
  authority.
- An ordinary resume reuses the existing Session and does not repeat the launch
  or create a new Issue-routing request. A replacement Session reuses the same
  Issue, Task, branch, and worktree and repeats only this native two-step
  sequence: it becomes ready and waiting for messages, then the coordinator
  sends the full Issue URL as its first user request. Neither path introduces a
  second Issue-routing mechanism.
- A `generate-tasks` proposal must show intended `ready-for-agent` label
  changes; approval of Task/Issue creation or links alone does not authorize an
  unlisted label mutation.
- Incoming Issues use `triage` and then a user-selected current-Session or
  fresh-Session route.

## Pull requests

PRs are not an external request surface. Read or mutate them only when the user
explicitly puts the PR in scope. Push, PR creation, merge, release, and Issue
closure are distinct external actions.
