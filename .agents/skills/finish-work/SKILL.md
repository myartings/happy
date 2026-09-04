---
name: finish-work
description: Close validated work through the appropriate Matt or accepted-Trellis finish boundary. Use after checks and applicable review pass, before an authorized commit, or when explicitly finishing an active task.
---

# Finish Work

## Research disposition at finish

When research materially changed a project decision, produced a durable
follow-up Slice, crossed a real session boundary, or was explicitly requested
for preservation, require the `decision-map` completion contract and end with
one truthful disposition: an exact durable repository path, recoverable
revision, Issue URL, or approved knowledge-base destination, or an explicit
statement that the result is not yet durable with the reason and narrowest
proposed destination or authorization. Ordinary factual lookup, transient
browsing, and inspection with no material finding add no finish ceremony.

Respect the active authority boundary. A read-only request performs no
repository, tracker, or knowledge-base write, and chat text, temporary handoff
files, untracked files, or uncovered local-only artifacts are not durable
archives. A disposition never by itself authorizes report creation, external
writes, knowledge-base ingest, commit, or push.

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
5. When completed workflow, Skill, routing, or support-runtime work produced
   evidenced reusable learning, classify it in `finish.md` and route it through
   `update-spec` to the narrowest Happy-owned destination. Cross-repository
   promotion is outside this repository's adopted workflow surface and requires
   a separately authorized upstream-maintenance workflow.
6. Keep task-scoped decision evidence in
   `docs/workspace/<slug>/decisions.md` when that is its complete audience. Move
   an independently maintained project research or audit report to the
   appropriate repository document root before Workspace archive. If scope or
   write authority does not permit that move, record the pending disposition
   and smallest required authorization instead of claiming the report is
   durable. Use `update-spec` only for reusable, evidenced learning and route it
   to the narrowest authoritative destination; do not promote noise or copy
   one-off detail across the report, Issue, Workspace, and project rules.
7. For multi-session, multi-agent, worktree, or handoff-worthy accepted tasks, update the
   latest structured summary under `sessions/` and its `session-index.md` row.
8. Update completed tasks. Record `finish=passed` only after every required
   Finish section and acceptance row is complete.
9. Reconcile linked tracker items and PRs through `tracker-workflow`. External
   mutation still requires an explicit request; otherwise record and report the
   recommended label, comment, linkage, or closure transition.
   For a dedicated Issue session, the owning Root prepares the Issue-specific
   completion recommendation. Coordinator reconciliation and worktree/branch
   cleanup remain later, separately authorized actions after this session is no
   longer using the worktree and has reached a safe terminal boundary.
10. Stage the complete pre-archive work candidate and run
    `python3 scripts/workflow-ci.py --staged`; a failure blocks archive
    generation. Then run `python3 scripts/workflow-state.py archive <slug>
    --summary "..."`. The command requires that exact staged checked/reviewed
    candidate and generates only the canonical terminal projection.
11. Stage the complete combined archived delivery candidate and run
    `python3 scripts/workflow-ci.py --staged`; a failure blocks delivery.
    In a normal pending two-parent merge, staged CI may admit exactly one
    integration Workspace absent from both parents. Its active/terminal
    projections must preserve the exact parent lifecycle union, and subsequent
    base-range CI uses the exact target merge parent.
12. Create the one archived delivery commit only when explicitly authorized.
    Result identity is the submitted-branch commit that first introduces the
    archive row; terminal content does not embed the future commit SHA.
13. After that commit exists, reconcile post-push, PR, hosted-check, merge, and
    Issue-closure state through `tracker-workflow`. Happy does not adopt the
    template repository's delivery-audit runtime; observed external state never
    changes local gate truth or authorizes a recommended mutation.
14. Ordinary push authorization never authorizes force-push. Before any
    force-push, require explicit authorization for the exact remote and ref,
    inspect divergence, and create or identify a recoverable reference.
15. Report outcome, evidence, files, tracker reconciliation, and follow-up.

Do not archive failed work as completed. Use `handoff` for incomplete or blocked
work that another session must continue.
