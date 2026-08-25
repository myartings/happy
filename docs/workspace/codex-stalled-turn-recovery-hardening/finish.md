# Finish Review: `codex-stalled-turn-recovery-hardening`

## Summary

Closed every blocking finding from the originating final review. Unknown steer
or start acknowledgements are preserved for authoritative reconciliation;
confirmed absence is the only automatic retry path; old runtimes without client
ID correlation fail closed; inactivity recovery owns failures and serializes
the main loop behind reconnect/resume completion.

## Verification

- Focused Codex/router/queue suite: 62/64 passed. The only failures are the two
  pre-existing Windows sandbox expectations; all 28 non-sandbox client, 11
  router, and 23 queue tests passed.
- `pnpm --filter happy typecheck`: passed.
- `pnpm --filter happy build`: passed.
- `git diff --check`: passed.
- Configured workflow check family: 4/4 passed.

## Whole-diff review

Passed after one P1 race was found and repaired: turn completion now waits for
an actual in-flight automatic recovery Promise, while ordinary inactivity
checks remain detached and cannot hang fake-timer completion.

## Rollback or mitigation

No migration or external state change exists. Rollback is the staged product
diff. Unknown delivery intentionally fails closed and remains visible instead
of risking duplicate execution.

## Lessons promoted

- `CONTEXT.md`: none; behavior is Codex-adapter specific.
- `docs/ARCHITECTURE.md` or ADR: none; no durable architecture boundary changed.
- Skill/workflow rule: none; existing high-risk, TDD, check, and review rules
  caught the recovery race.

## Follow-up

- Rebuild/install the desktop test client before the next live acceptance run.
- The two Windows-only sandbox test failures remain unrelated baseline debt.
- Commit remains pending until explicitly requested.
