---
name: start
description: Resume or begin repository work from durable project state. Use when starting a coding session, returning after a pause, switching agents or worktrees, or when the active task and next workflow gate are unclear.
---

# Start Work

## Workflow

1. Read `AGENTS.md` and `.ai/project.json`. If `CONTEXT-MAP.md` exists, resolve
   and read the applicable bounded-context file; otherwise read root
   `CONTEXT.md`. Do not load root context before consulting an existing map.
2. Inspect `git status --short`; preserve unrelated or user-owned changes.
3. Run `python3 scripts/workflow-state.py active` when the helper exists.
   Treat `start` as recovery in the current user-facing session. Without the
   explicit authorization defined in `docs/workflow/execution-isolation.md`,
   continue here and never prepare a branch/worktree or invoke a client launcher.
   Before preparing a named-Issue session, follow `tracker-workflow`'s visible
   claim boundary. Generic continuation authorizes neither its external writes
   nor client launch.
   Confirm the current human-facing session root before sustained Root
   implementation. If the accepted work selects a different linked worktree,
   resume only after a platform-native handoff visibly rebinds this session or
   a user-authorized fresh session starts in that worktree. Do not treat a tool
   or shell `workdir` override as a session rebind; before the boundary completes,
   this session may only perform the bounded preparation, handoff, read-only,
   or temporary integration actions allowed by the isolation policy.
   For an accepted named-Issue route, treat `workflow-issue-route.py` output as
   implementation-ready only when it returns `current-root` from the exact
   registered Issue worktree plus matching confirmed native-handoff or
   fresh-session binding evidence, or from the explicit named-Issue isolation
   opt-out. A session-root path, branch, working-directory override, or caller
   assertion alone is not binding evidence. Preserve an inert launch capsule
   and stop at `manual-start-required` when proof or native capability is absent.
   In a coordinator session, stop after authorized inert preparation,
   projection, and launch/recovery: do not create the Issue Workspace, pass a
   local gate, generate its detailed plan, edit its deliverable, run its
   checks/review, or prepare delivery. The owning Root is either the exact
   confirmed Issue session or the current Root selected by an explicit
   named-Issue isolation opt-out. It re-reads the live Issue and repository,
   then receives or confirms user acceptance before creating or accepting the
   Workspace, and retains ownership through finish and delivery preparation.
4. If a Trellis task is active, read `workflow.json`, generated `state.md`, and
   `validation.md`, then read the linked context, decisions, task/spec links,
   and latest indexed session evidence. If no indexed session exists, read only
   the latest journal section; do not load the whole journal as a substitute.
5. Confirm the selected task contract maps one accepted delivery slice to the
   Workspace and still matches the codebase. For a tracker-backed task, require
   the structured acceptance right-sizing receipt before implementation. Require
   a tracker source only when the accepted task uses an external queue or
   coordination boundary.
6. If `task-links.md` names an external tracker item and fresh remote context is
   required, route read-only discovery through `tracker-workflow`. Snapshot any
   accepted remote change into local contracts; tracker state never substitutes
   for local workflow gates. If the live Issue materially changed since the
   owning session froze its contract, reconcile the delta explicitly before
   continuing.
7. If no task is active, do not create one from the diff. Continue a clear,
   bounded, normal-risk single-session request through the matching Matt skill.
   Ask before task creation only for complex, high-risk, cross-session,
   durable-recovery, or coordination work.
8. For an active task, classify the next action as planning, implementation,
   verification, or finish. When repeated no-progress review evidence makes a
   continuation reassessment due, route through `continue` before another broad
   implementation attempt.
9. For an accepted task, load only a role manifest that corresponds to actual
   dispatch:
   `contexts/implement.jsonl` for implementation or `contexts/check.jsonl` for
   verification.
   A manifest proves only declared structure and paths; relevance and actual
   loading remain execution/review obligations.
10. Report a short resume brief: goal, current phase when applicable, evidence,
   blockers, and one
   concrete next action.

Run `python3 scripts/workflow-audit.py --strict --require-active <slug>` before
resuming implementation or finish for an active Trellis task. No-task work has
no Workspace or delivery classifier. Historical workflow artifacts remain
passive; never infer current state or success from them or from chat alone.
