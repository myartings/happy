---
name: implement
description: Implement the smallest accepted task slice while preserving repository boundaries and validating incrementally. Use when planning gates are satisfied and the user asks to build, change, fix, refactor, or complete an approved coding task.
---

# Implement Work

## Workflow

1. Reconfirm allowed scope, protected paths, acceptance criteria, and dirty
   files. A clear, bounded, normal-risk no-task change proceeds in the current
   context with no lifecycle receipt.
2. When a Trellis task is active, require `ready` or
   `ready-with-recorded-gaps` from `scoping`, enter implementation with
   `python3 scripts/workflow-state.py transition <slug> implementation
   "<next>"`, and run strict audit with `--require-active`; a rejected
   transition or audit is a hard stop.
   Before editing, confirm that sustained Root implementation is running in the
   current session root. If another linked worktree owns the accepted slice,
   require a proven platform-native handoff or a user-authorized fresh session
   there and stop this session before edits. A command-level `workdir` override
   is not a session handoff. The read-only, temporary integration, and bounded
   subagent exceptions in `docs/workflow/execution-isolation.md` do not permit
   Root product or workflow edits from the original session.
   For an accepted named-Issue route, reconfirm that the public route returns
   `current-root` from the exact registered Issue worktree plus matching
   confirmed native-handoff/fresh-session binding evidence, or from the explicit
   named-Issue isolation opt-out. Do not treat a path, branch, command working
   directory, caller assertion, recommendation, or launch capsule as proof.
   `manual-start-required` is a hard stop before implementation edits.
   For actual dispatched task work, load repository-relative paths in
   `contexts/implement.jsonl`; inline work uses the accepted scope without a
   manifest. Do not automatically load verification-only context.
   Reconfirm the scoping preflight, and rerun it if accepted risk metadata or
   implementation topology changed. Apply capability guidance only after
   scoping fixes ownership: Luna Max suits bounded deterministic work; Root
   judgment, architecture, diagnosis, independent review, and High-risk
   boundaries use Sol Medium or a higher explicitly justified effort. If a
   Luna Root materially crosses that boundary, state why, recommend the exact
   `gpt-5.6-sol` effort, and pause for operator `/model` plus `/status`
   confirmation. When an in-session change cannot be verified, require a fresh
   suitable Root for the same accepted task, branch, and worktree. A Skill,
   script, or subagent never performs or claims the switch; a Sol subagent does
   not count as a Root-model change. Use `isolated-writer` only after scoping
   and `batch-plan` authorize its isolated-worktree contract. Model guidance
   never creates delegation, batch state, a branch, or a worktree.
3. Use `tdd` when logic has a stable test seam; otherwise identify the closest
   deterministic feedback signal before editing. When root cause is unknown and
   no red-capable signal exists, route to `diagnose` before the first speculative patch.
   A bug already covered by a deterministic failing test can proceed
   without the full diagnosis protocol.
4. Make one coherent slice at a time. Follow
   `docs/workflow/discovered-work-scope-containment.md`: Classify every
   discovered work item before it expands implementation, tests, or mandatory
   acceptance. Correct blocking accepted-contract gaps, candidate-introduced
   regressions, and applicable binding-authority violations. Do not absorb new
   outcomes, optional hardening, reviewer preferences, or unrelated refactors.
   A prerequisite repair continues only with recorded evidence that every
   accepted delivery boundary remains unchanged; otherwise pause at the owning
   contract, risk, decision, diagnosis, or prerequisite-Slice route.
   New tests must trace to an accepted criterion, candidate-introduced
   regression, or applicable binding invariant.
5. Run targeted checks after each meaningful slice using `.ai/project.json`.
6. During an existing batch, when completing or integrating a slice materially changes remaining-task
   readiness, dependencies, or ownership, run `workflow-state.py
   parallel-reassess <slug> <serial|batch-plan> --ready-units <count> --trigger
   <change> --reason <route>`. Do not add a receipt when the graph is unchanged.
7. For an active task, update task state and `validation.md` with exact
   evidence. No-task work reports exact check evidence without creating task
   state.
8. Stop and route to `diagnose` after unexpected failures or repeated fixes.
9. When an active task's implementation slice is complete, record
   `implementation=passed`, transition to `verification`, and hand it to
   `check`. No-task work proceeds directly to applicable checks and Matt review.
   Do not create a final commit from this skill.

Preserve public contracts unless the accepted spec explicitly changes them.
