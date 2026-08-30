---
name: check
description: Verify implemented work against acceptance criteria, task scope, deterministic commands, and recorded evidence. Use targeted checks during implementation and the complete candidate-bound final check before review, finish, merge, release, or completion claims.
---

# Check Acceptance

## Workflow

1. Read the accepted contract. If a Trellis task is active, read its Workspace;
   otherwise use the current bounded request and repository guidance directly.
2. Inspect the complete changed scope and current dirty state. Load
   `contexts/check.jsonl` only for actual dispatched task verification.
3. Map every acceptance criterion to concrete evidence.
   Classify newly discovered work before expanding the mandatory check set,
   using `docs/workflow/discovered-work-scope-containment.md`. A new check or
   test is mandatory only when it traces to an accepted criterion, a
   candidate-introduced regression, or an explicit applicable binding
   invariant. Optional hardening, new threat models, unrelated quality work,
   reviewer preference, and new outcomes remain non-blocking follow-up
   candidates until explicitly accepted.
4. During implementation, run the narrow reproduction and targeted configured
   profiles as incremental feedback. They never pass an accepted task's final
   check gate.
5. For final no-task verification, run `python3 scripts/workflow-check.py
   --applicable` without `--record` or `--staged`. This selects the applicable
   configured commands from `.ai/project.json` and falls back to the complete
   family when scope is ambiguous. Run fresh rather than using task-bound
   reuse, report the exact command results to the user, and create no Workspace,
   check receipt, candidate package, staging mutation, or other lifecycle
   evidence.
6. For the final accepted-task path, stage only the accepted delivery candidate,
   then run `python3 scripts/workflow-check.py
   --applicable --record <active-slug> --staged --base <ref>`. Selection must
   fall back to the full profile when scope is ambiguous. Use `--reuse` only for
   an exact passed run with identical candidate, configuration, and ordered
   commands; otherwise run fresh.
7. Confirm operational, security, migration, rollback, and integration gates when
   triggered by scope.
8. Record exact results, failures, unavailable tools, and concrete skip reasons.
   Persist them in `validation.md` only when a Trellis task is active.
9. Do not perform semantic review in `check`; that capability belongs to the
   separate Matt-owned `review` gate.
10. Return `pass`, `pass-with-gaps`, or `fail`. Route an accepted task's
   deterministic pass to Matt `review` when semantic review applies, then route a passed unchanged review
   candidate to `finish`; route failures to diagnosis
   or implementation.

`pass-with-gaps` must name each gap and its consequence. A command that was not
run is not a pass. A passed `check` receipt never implies semantic review.

For accepted-task work, `workflow-check.py --applicable --record <slug>` records command rows in
structured `evidence/checks.jsonl`, renders their validation table, and updates
the machine `check` gate for the complete applicable family. If gaps are explicitly
accepted by the user, replace `passed_with_gaps` with `accepted_gaps` and cite
that acceptance before entering finish.

The staged final mode binds the exact Git candidate before semantic review. If a
configured command or later staging changes delivery bytes, the check becomes
stale and a fresh final check must precede a fresh review pair.

When an external dependency needs a fallback, verify that the fallback is
bounded and observable. Missing data required for correctness must fail closed.
