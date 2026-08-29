# Finish Review: `workflow-template-2026-08-2-adoption`

## Summary

Selectively adopted upstream `ai-coding-template` release
`workflow-2026.08.2` at immutable commit
`8d07a74931f8dcf6a668c2a6a4dcaf9c490a2842`. The migration updates the
allowlisted workflow runtime, documentation, standard skills, Codex support,
and issue template while retaining Happy-owned repository, branch, product,
tracker, and local-tool authority. Tasks T1-T6 are complete.

## Verification

- The Happy adoption manifest is schema 2, pins the exact source release and
  commit, declares explicit includes/preserves, and retires three legacy tests
  only behind accepted file fingerprints.
- A clean synthetic candidate dry-run against the pinned source reports every
  included path unchanged, every retirement absent, and zero required updates.
- The final staged engineering candidate
  `3dd4727cedd7393676124db0adbeb625f05f10d437e25ba0193e484c2765e52a`
  passed all four selected workflow checks: 2/2 state-upgrade tests, selective
  validation, 9/9 validator/integration tests, and strict repository audit.
- Independent Spec and Standards reviewers accepted that same candidate with
  zero findings and no accepted gaps; `git diff --check` also passes.

## Whole-diff review

The reviewed candidate contains 94 workflow-adoption paths, all within the
accepted scope. It introduces the pinned selective-adoption contract and
canonical upstream workflow surfaces, adds a fail-closed schema-1 to schema-3
bridge for the active Workspace, and removes only the three fingerprinted
legacy test copies. Negative inspection confirms there are no changes under
application/server code, dependencies, product CI, `devtools/`, `.claude/`, or
Happy custom-skill paths.

## Rollback or mitigation

Before any authorized commit, rollback is the complete staged migration diff;
there is no data migration, deployment, external tracker mutation, or product
runtime state to unwind. If a later authorized commit must be reverted, revert
that migration commit as one unit, preserving the append-only workflow archive
through the repository's normal review protocol. Commit and push remain outside
the current authorization.

## Lessons promoted

- `CONTEXT.md`: documents the immutable selective source and keeps the frozen
  Claude authority intact.
- ADR: `docs/adr/0004-commit-bound-workflow-enforcement.md` now distinguishes
  candidate-bound engineering review from completion-evidence and terminal
  staged-CI binding.
- Skill/workflow rule: Happy's `AGENTS.md`, workflow guide, validator, and
  adopted skills consistently require dry-run-first selective synchronization,
  candidate-bound checks/review, and deterministic finish/archive evidence.
- No additional `update-spec` promotion is needed; the reusable rules are
  already captured in the authority documents above.

## Follow-up

No non-blocking product or workflow follow-up was identified, and no external
tracker or pull request was changed. The only optional next action is an
explicitly authorized commit (and, separately, push) after terminal staged CI;
otherwise the completed migration may remain uncommitted for user inspection.
