---
name: check
description: Verify implemented work against acceptance criteria, task scope, deterministic commands, review gates, and recorded evidence. Use after implementation, before user acceptance, merge, release, or any claim that work is complete.
---

# Check Acceptance

## Workflow

1. Read the active workflow and its accepted contract.
2. Inspect the complete changed scope and current dirty state. Load
   `contexts/check.jsonl` as the verification context; consult implementation
   context only when tracing an evidenced failure requires it.
3. Map every acceptance criterion to concrete evidence.
4. Run the narrow reproduction or targeted test first, then the complete
   applicable test family. Use
   `python3 scripts/workflow-check.py --record <active-slug>` when available.
5. Perform semantic review for behavior not covered by deterministic tools.
6. Confirm operational, security, migration, rollback, and integration gates when
   triggered by scope.
7. Record exact results, failures, unavailable tools, and concrete skip reasons
   in the active workflow's `validation.md`.
8. Return `pass`, `pass-with-gaps`, or `fail`.

`pass-with-gaps` must name each gap and its consequence. A command that was not
run is not a pass. Route `pass` to `finish-work`; route failures to diagnosis or
implementation with the smallest evidenced next action.

For formal work, `workflow-check.py --record <slug>` records command rows in
the validation table and updates the machine `check` gate. If gaps are explicitly
accepted by the user, replace `passed_with_gaps` with `accepted_gaps` and cite
that acceptance before entering finish.

When an external dependency needs a fallback, verify that the fallback is
bounded and observable. Missing data required for correctness must fail closed.
