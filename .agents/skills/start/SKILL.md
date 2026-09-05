---
name: start
description: Start or resume repository work from a current request or full GitHub Issue URL, routing intake or loading a linked Task when present.
---

# Start Work

1. Read `AGENTS.md`, `.ai/project.json`, and the applicable context, ADR, and
   architecture guidance. Inspect `git status --short` and preserve unrelated
   changes.
2. For a Bug reported directly in the current Session, use
   `diagnosing-bugs` without creating an Issue. Diagnosis alone stops before
   implementation edits; when the user also requests a fix, continue through
   the implementation route below. For other immediate bounded requests,
   ensure the checkout uses an ordinary feature branch; create or switch to one
   before implementation edits when currently on the repository's default
   branch. No worktree is needed. Recommend the explicit pinned `implement`
   entry and wait when the user has not invoked it; after invocation, use it
   without creating a Task or Issue.
3. For a full GitHub Issue URL, read the live Issue, labels, comments, native
   relationships, and configured Project item using
   `docs/agents/issue-tracker.md`. Do not scan `docs/tasks/` for a match.
4. If the Issue is a Task-less aggregate with native sub-issues, report its
   aggregate progress and executable frontier; do not claim or implement it.
5. If the Issue has no Task link, this Session is coordinating: recommend the
   explicit pinned `triage` entry and wait. After triage, implement in this
   Session without a Task only when the work is singular, needs no PRD or
   Feature Spec, needs no resumable multi-step plan, carries no material
   cross-module, risk, or architecture decision, fits the current model, and
   can be implemented and verified here. Otherwise use `generate-tasks` then
   `publish-tasks`, perform the launch-time model judgment, prepare the
   dedicated branch/worktree, start a new execution Session, wait for it to be
   ready, and send the full Issue URL returned by `publish-tasks` for that Task
   as its first user request. This is the incoming Issue only when one bounded
   slice reused it; a split uses the corresponding sub-issue URL.
6. If the Issue links a Task, read that unique Task and its optional Feature
   Spec and Research links. Verify the Task is self-contained and the link
   resolves inside the repository.
7. Before implementing an executable Issue enrolled in a configured Project,
   correct stale blocker state on touch and establish its cooperative claim:
   Inbox returns to triage; Ready moves to In Progress; Blocked moves through
   Ready only after its blockers clear; Review returns to In Progress only for
   an explicit change request; Done requires explicit reopening. Existing In
   Progress work requires takeover confirmation. A failed initial claim stops
   the implementation start; later Project update failures are reported and
   corrected on the next touch.
8. For Task-bound work, inspect the supplied current directory, branch, and
   `git worktree list`; confirm the caller-prepared pair is dedicated to the
   Task. The coordinating launch must prepare Git, start the fresh Session with
   only directory/model/effort, wait until it is ready and waiting for
   messages, and then send the full Issue URL
   (`https://github.com/<owner>/<repository>/issues/<number>`) as the first user
   request. The launcher does not receive or interpret Issue data, and `start`
   is execution-side rather than the initial launch coordinator.
9. Report the goal, loaded sources, Git and Project state, blockers, and next
   action. An ordinary resume repeats none of the launch or Issue routing. A
   replacement Session reuses the same Issue, Task, branch, and worktree and
   repeats only the ready-Session then first-request sequence.

## Model escalation request

During execution after a Luna Max launch, stop further implementation when
there is clear evidence that the model cannot reliably understand or reason
about the accepted work. Misunderstanding acceptance, failing to form a
credible approach, disregarding established root-cause evidence, or being
unable to follow critical repository constraints can indicate a Model
capability failure. Ordinary test failures, syntax errors, and normal debugging
are not.

Tell the user the evidence, modified files, and verification state, and
recommend Sol Medium. Preserve partial work without automatically committing,
reverting, or stashing it. The Agent cannot change its own model. Wait for an
in-place client switch or a requested replacement; a real replacement uses
`handoff` and reuses the same Issue, Task, branch, and worktree.

An Issue, label, Task, Project item, worktree, or Session locates work but never
authorizes implementation. An explicit request to implement the current request
or selected Task authorizes its scoped local commit, not push, PR, merge,
release, Issue mutation, or destructive Git actions.
