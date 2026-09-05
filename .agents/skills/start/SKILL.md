---
name: start
description: Start or resume repository work from a current request or a full GitHub Issue URL, loading a linked Task and its required documents when one exists.
---

# Start Work

1. Read `AGENTS.md`, `.ai/project.json`, and `CONTEXT-MAP.md` or the applicable `CONTEXT.md`. Read relevant ADRs and architecture guidance.
2. Inspect `git status --short` and preserve unrelated changes.
3. For an immediate bounded current-Session request, inspect the current branch as needed and use Matt `implement` without creating a Task or Issue.
4. For a full GitHub Issue URL, read the live Issue, labels, and relevant comments using `docs/agents/issue-tracker.md`. Do not scan `docs/tasks/` or infer a Task from a diff.
5. Inspect the live Issue for its Task link before any Task-specific read or execution-environment check.
6. If the Issue has no Task link, perform intake with `triage` and let the user choose. Immediate current-Session implementation uses the bounded Issue without a Task. Fresh-Session handoff uses `generate-tasks` to attach one Task to that same bounded Issue without creating a duplicate. Only when an incoming Issue is a broad coordination parent and the user accepts a split does `generate-tasks` create child Issue + Task pairs; the parent remains Task-less. Needs-info, duplicates, already-implemented, and wontfix items do not create Tasks.
7. If the Issue has a Task link, follow that unique link. Read the Task, its optional Feature Spec and Research links, and any guidance those documents name. Verify the Task's Issue URL matches the live Issue. Then inspect the supplied current directory, branch, and `git worktree list`; confirm that the caller-prepared pair is dedicated to this launched Task and keep one writer in the worktree. The coordinating launch must start the fresh Happy Session in that directory with only its bounded launch inputs, wait until it is ready and waiting for messages, and then send the full Issue URL (`https://github.com/<owner>/<repository>/issues/<number>`) as the first user request. `start` consumes that request and is execution-side: it does not perform the initial model judgment, create or reuse the branch/worktree, or ask the launcher to do so. A replacement Session reuses the same Issue, Task, branch, and worktree and repeats only this native two-step sequence: it becomes ready and waiting for messages, then the coordinator sends the full Issue URL as its first user request. Ordinary resume does not repeat the launch or routing. Neither path introduces a second Issue-routing mechanism.
8. Report the goal, loaded sources, Git state, blockers, and next action.

## Model escalation request

During execution after a Luna Max launch, stop further implementation when
there is clear evidence that the model cannot reliably understand or reason
about the accepted work. Misunderstanding acceptance, failing to form a
credible approach, disregarding established root-cause evidence, or being
unable to follow critical repository constraints can indicate a Model
capability failure. Ordinary test failures, syntax errors, and normal debugging
are not.

Send the user a Model escalation request that states the evidence, modified files,
verification state, and recommends the repository's accepted stronger choice,
Sol Medium, with its reasoning effort. Preserve partial work without
automatically committing, reverting, or stashing it. The Agent must not claim to
change its own model or launch a replacement automatically. Wait for the user to
switch the current Session through client controls or request a replacement
Session. An in-place switch needs no handoff; a real replacement uses `handoff`
and reuses the same Issue, Task, branch, and worktree.

An Issue, label, Task, worktree, or Session locates work but never authorizes implementation. A user's explicit request to implement the current request or selected Task authorizes the scoped local commit on the current or dedicated Task branch. It does not authorize push, PR, merge, release, Issue mutation, or destructive Git actions.
