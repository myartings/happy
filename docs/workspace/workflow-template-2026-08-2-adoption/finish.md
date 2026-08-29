# Finish Review: `workflow-template-2026-08-2-adoption`

## Summary

Rebuilt the accepted selective adoption of `ai-coding-template` release
`workflow-2026.08.2` on exact remote integration base
`f23b9d756d3e3c20b9c41392102c4728b4ab8e15`. The isolated candidate adopts
the allowlisted workflow runtime, documentation, standard skills, Codex
support, and issue template while retaining Happy-owned repository, branch,
product, tracker, devtools, release, custom-skill, and Paper MCP authority.
Tasks T1-T6 are complete for this delivery base.

## Verification

- The clean pinned source pre-apply dry-run classified 72 required updates; the
  release synchronizer applied them transactionally, with three retirements
  accepted only after exact fingerprint checks.
- All 82 nonterminal migration paths match the previously reviewed
  `5ee0818e...` migration bytes exactly, while all old base-bound Workspace and
  archive evidence was intentionally regenerated.
- A clean synthetic candidate reports every allowlisted entry unchanged, all
  retirements absent, and `dry-run: 0 change(s) require update`.
- Final engineering candidate
  `6a3a95a19590453789917a42589782dbb31512886888c1e52f197356e2dd6876`
  passed all four workflow checks: 2/2 state-upgrade tests, selective
  validation, 9/9 validator/integration tests, and strict repository audit.
- Independent capable Spec and Standards reviewers accepted that same
  candidate with zero findings and zero follow-up candidates.

## Whole-diff review

The reviewed candidate contains 94 engineering and durable-contract paths, all
within the accepted workflow-adoption scope. It introduces the pinned selective
adoption contract, canonical workflow surfaces, and the fail-closed schema-1 to
schema-3 Happy bridge, and removes only the three fingerprinted legacy tests.
Negative inspection against `origin/dev` confirms no changes under application
or server code, dependencies, product CI, `devtools/`, `.claude/`, generated
paths, or Happy custom skills. The previously published `origin/sharp-harbor`
backup remains unchanged.

## Rollback or mitigation

Before commit, rollback is the complete staged migration candidate. After the
authorized single delivery commit, rollback is one revert; there is no data
migration, deployment, credential change, or product runtime state to unwind.
The old `origin/sharp-harbor@5ee0818e...` remains a recoverable reference and
must not be rewritten or force-pushed. PR creation is authorized, but merge and
branch cleanup remain separate actions.

## Lessons promoted

- `CONTEXT.md`: records the immutable selective source and frozen Claude
  boundary while preserving Happy product authority.
- ADR: `docs/adr/0004-commit-bound-workflow-enforcement.md` distinguishes
  engineering-candidate review from completion evidence and terminal staged-CI
  binding; D10 records why stale terminal evidence cannot be copied to a new
  PR base.
- Skill/workflow rule: `AGENTS.md`, `docs/workflow.md`, the validator, and the
  adopted skills consistently require dry-run-first selective synchronization,
  candidate-bound checks/review, and deterministic finish/archive evidence.
- No additional `update-spec` promotion is needed; the reusable behavior is
  already captured in those authority documents.

## Follow-up

No non-blocking code or workflow follow-up candidate was identified. After
terminal staged CI, create the one authorized delivery commit, push the new
branch normally, and open one PR targeting `dev`. Do not merge the PR or delete
either branch without separate authorization.
