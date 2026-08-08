---
name: finish-work
description: Close validated feature or bug-fix work through final review, learning promotion, workflow archival, and optional commit. Use after `check` passes, when handing off completed work, or when explicitly finishing an active workflow.
---

# Finish Work

## Workflow

1. Require `check` result `pass`, or explicit user acceptance of named gaps, and
   a passed whole-diff review receipt.
2. Recheck the whole diff, dirty state, acceptance coverage, and unrelated files.
3. Enter finish with the guarded `transition` command. Summarize exact validation
   evidence and remaining limitations in the active workflow's `finish.md`.
4. Record rollback/mitigation and operational notes when applicable.
5. Use `update-spec` only for reusable, evidenced learning; do not promote noise.
6. For multi-session, multi-agent, worktree, or handoff-worthy work, update the
   latest structured summary under `sessions/` and its `session-index.md` row.
7. Update completed tasks. Record `finish=passed` only after every required
   Finish section and acceptance row is complete.
8. Reconcile linked tracker items and PRs through `tracker-workflow`. External
   mutation still requires an explicit request; otherwise record and report the
   recommended label, comment, linkage, or closure transition.
9. Archive with `python3 scripts/workflow-state.py archive <slug> --commit pending
   --summary "..."`, then stage implementation and workflow evidence together.
10. Run `python3 scripts/workflow-ci.py --staged`; a failure blocks commit.
11. Commit only when requested or repository instructions make it the default;
    keep the atomic commit narrowly scoped.
12. Report outcome, evidence, files, tracker reconciliation, and follow-up.

Do not archive failed work as completed. Use `handoff` for incomplete or blocked
work that another session must continue.
