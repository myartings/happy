---
name: scoping
description: Route implementation work to the right context, tests, risk gates, and execution mode before editing. Use for Feature or High-risk work, non-trivial bugs, queued issues, cross-module changes, or whenever scope, tests, risks, context, and ownership must be confirmed before edits.
---

# Scoping

## Gate

1. Inspect dirty state and confirm the target repository, branch, and worktree.
2. Determine whether a Trellis task is already active. Use
   `docs/workflow/intensity-matrix.md` only for an accepted task.
3. For an active task, confirm the Workspace contract maps one stable delivery
   source and acceptance slice. Add `task-links.md` only when the accepted task
   needs a detailed execution checklist or external linkage.
4. For a tracker-backed task, revalidate the source's right-sizing assessment
   against current code after `acceptance=passed` and record the complete
   acceptance receipt through `workflow-state.py right-sizing` immediately
   before scoping passes. The receipt fingerprints the current contract and
   stale or post-scoping snapshots fail closed. Return `blocked` for
   `split-required`;
   parent/child links never replace exact dependency artifacts or interfaces.
5. Confirm open decisions are resolved or explicitly accepted.
   Freeze the accepted contract at scoping and make
   `docs/workflow/discovered-work-scope-containment.md` the shared runtime
   boundary for implementation, checking, initial/remediation review, and
   continuation. Name the accepted test authority and material-growth routes;
   do not pre-authorize adjacent outcomes, Issue #19 finding persistence, or
   automatic tracker mutations.
6. Check `.ai/project.json` for commands, protected paths, generated paths, and
   risk triggers.
7. Use a tracker only when an accepted task needs an external queue or
   coordination boundary. Use `tracker-workflow` to resolve external sources.
8. Select the smallest implementation context and relevant specialist skill.
   Explicitly select implementation topology as `current-root` or
   `isolated-writer`. A branch alone is not isolated-writer evidence, and model
   guidance cannot create a child, batch, branch, or worktree.
9. Define the test seam, incremental validation, and final applicable commands.
10. Record decision and risk assessments. Use evidenced `not_required` only when
   no material trigger applies; otherwise run the owning gate skill.
11. When an accepted task has two or more independent ready units, classify
    them before `batch-plan`: separate Delivery Slices each require their own
    accepted right-sizing boundary, while implementation-plan tasks inside one
    Slice inherit that Slice's contract and require only stable ownership,
    conflict, dependency-output, and test seams. Route the resulting graph
    through `batch-plan` and record the topology. Serial and no-task work need
    no parallel receipt.
12. At a natural boundary, scoping may recommend a fresh human-facing session.
    Any recommendation is advisory and inert until the user grants the explicit
    authorization defined in `docs/workflow/execution-isolation.md`; scoping
    never launches a client or prepares its branch/worktree on the strength of
    the recommendation. When sustained Root ownership may transfer to a
    different linked worktree, classify Root execution as `current-session`,
    `native-handoff`, or `fresh-session-required`. A different linked worktree
    selected for sustained Root implementation requires a proven native session
    rebind or a fresh user-authorized session; a pending boundary blocks
    implementation. Tool-level working-directory selection is not evidence of
    a rebind.
    When a named Issue uses the public Issue route, require its implementation
    classification to be `current-root`: exact registered Issue worktree plus
    matching confirmed native-handoff/fresh-session binding evidence, or the
    explicit isolation opt-out for that named Issue. A path, branch, process
    working directory, or caller assertion alone cannot prove binding. Treat
    `manual-start-required` as blocked for sustained implementation; its inert
    launch capsule does not authorize or claim a session launch.
    Also require the active Workspace to have been created or explicitly
    accepted by this owning Root—confirmed Issue session or explicitly
    opted-out current Root—after its live-source re-read and user-acceptance
    boundary. A coordinator-created Workspace or
    pre-launch lifecycle receipt is a contract-reconciliation blocker, not
    bootstrap evidence. Keep bounded writers and reviewers subordinate to this
    single Root lifecycle owner.
13. Route two or more independent ready units to `batch-plan`. Also require
    `batch-plan` for queued, delegated, or isolated writing. Keep shared
    contracts and overlapping ownership serial. A writer subagent must use an
    isolated worktree.

Return `ready`, `ready-with-recorded-gaps`, or `blocked`, with evidence and the
next action. Do not edit code while the result is `blocked`.

Persist the result only for an active Trellis task:

1. Record accepted contract evidence with the `acceptance` gate.
2. Record required decision and risk receipts through their owning skills.
3. When batching, run `python3 scripts/workflow-state.py parallel-assessment
   <slug> batch-plan --ready-units <count> --reason <reason>`.
4. Apply the simple starting recommendation after topology is fixed: Luna High
   suits bounded deterministic work, while Root judgment, architecture,
   diagnosis, independent review, and High-risk boundaries use Sol Medium or a
   higher explicitly justified effort. If a Luna current Root crosses a Sol
   boundary, name the reason and recommended `gpt-5.6-sol` effort, then pause
   for operator `/model` plus `/status` confirmation. If the client cannot
   verify the change, require a fresh suitable Root. A Sol subagent is not Root
   escalation evidence, and model choice creates no lifecycle receipt.
5. Record `scoping=passed` only for `ready`; its evidence must name the selected
   implementation owner, topology, and capability assessment. Use
   `blocked` when unresolved.
6. Run `python3 scripts/workflow-state.py ready <slug> implementation`.

Chat text is not a gate receipt. Every non-pending gate requires concise durable
evidence. No-task scoping returns its result in the current session without
creating a receipt.
