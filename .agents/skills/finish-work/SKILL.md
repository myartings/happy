---
name: finish-work
description: Close validated work through the appropriate Matt or accepted-Trellis finish boundary. Use after checks and applicable review pass, before an authorized commit, or when explicitly finishing an active task.
---

# Finish Work

## No-task work

1. Require applicable checks to pass or explicit acceptance of named gaps, plus
   Matt review when the diff contains engineering behavior or workflow policy.
2. Recheck the complete diff, dirty state, acceptance, and unrelated files.
3. Stage only the atomic change and run `python3 scripts/workflow-ci.py --staged`.
4. Commit only when requested or repository instructions make it the default.
5. Report exact evidence, limitations, and any non-blocking follow-up candidates
   with classification and rationale. Do not create finish, archive,
   session, tracker, or parallel-report receipts.

## Accepted-task workflow

The owned sequence is final check, independent review, finish, deterministic
terminal archive projection, combined staged CI, and one authorized delivery
commit.

1. Require a candidate-bound final `check` result `pass` (or explicit acceptance
   of named gaps) followed by a passed whole-diff review receipt for the same
   unchanged candidate.
2. Recheck the whole diff, dirty state, acceptance coverage, and unrelated files.
3. Enter finish with the guarded `transition` command. Summarize exact validation
   evidence and remaining limitations in the active workflow's `finish.md`.
   Report non-blocking follow-up candidates with classification and rationale
   under `docs/workflow/discovered-work-scope-containment.md`, or explicitly
   state that none were found. This report never authorizes tracker mutation.
4. Record rollback/mitigation and operational notes when applicable.
5. Use `update-spec` only for reusable, evidenced learning; do not promote noise.
6. For multi-session, multi-agent, worktree, or handoff-worthy accepted tasks, update the
   latest structured summary under `sessions/` and its `session-index.md` row.
7. Update completed tasks. Record `finish=passed` only after every required
   Finish section and acceptance row is complete.
8. Reconcile linked tracker items and PRs through `tracker-workflow`. External
   mutation still requires an explicit request; otherwise record and report the
   recommended label, comment, linkage, or closure transition.
   For a dedicated Issue session, the owning Root prepares the Issue-specific
   completion recommendation. Coordinator reconciliation and worktree/branch
   cleanup remain later, separately authorized actions after this session is no
   longer using the worktree and has reached a safe terminal boundary.
9. Stage the complete pre-archive work candidate and run
    `python3 scripts/workflow-ci.py --staged`; a failure blocks archive
    generation. Then run `python3 scripts/workflow-state.py archive <slug>
    --summary "..."`. The command requires that exact staged checked/reviewed
    candidate and generates only the canonical terminal projection.
10. Stage the complete combined archived delivery candidate and run
    `python3 scripts/workflow-ci.py --staged`; a failure blocks delivery.
11. Create the one archived delivery commit only when explicitly authorized.
    Result identity is the submitted-branch commit that first introduces the
    archive row; terminal content does not embed the future commit SHA.
12. Ordinary push authorization never authorizes force-push. Before any
    force-push, require explicit authorization for the exact remote and ref,
    inspect divergence, and create or identify a recoverable reference.
13. Report outcome, evidence, files, tracker reconciliation, and follow-up.

Do not archive failed work as completed. Use `handoff` for incomplete or blocked
work that another session must continue.
