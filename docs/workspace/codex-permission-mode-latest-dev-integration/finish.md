# Finish Review: `codex-permission-mode-latest-dev-integration`

## Summary

Integrated `origin/dev@03936270` into the Issue #87 branch without adding new
product behavior. The archive is the target-first exact parent union; the
shared `Metadata` block is exact dev-parent content and retains the Issue #87
permission fields alongside the runtime-confirmed route pair.

## Verification

- App focused integration tests: 38/38 passed.
- CLI focused integration tests: 87/87 passed.
- App and CLI typechecks passed.
- Fresh staged full-profile check: 7/9 commands passed. The only failures are
  the explicitly accepted unchanged Studio source-string assertion and two
  native-Windows Server local-storage fixture assertions; App otherwise passed
  1944 tests and Server passed 110 tests.
- Workflow runtime 38/38, upgrade 2/2, validator 9/9, selective validation, and
  strict repository audit passed.

## Whole-diff review

Independent capable Spec and Standards reviewers accepted frozen candidate
`cb4c31019ed244e2194d69b03b15225d3ae9bb91646bb9973a3e272c1ec5dbcf`
and diff `3c74a53e149333fff98f4b0dfe72998dfa74c22451fdd483c0b8d3c8c169e80f`
with no blocking findings. Both confirmed the sole novel product blob is the
clean union of the two parent behaviors.

## Rollback or mitigation

No migration or irreversible state change exists. Before GitHub merge, discard
the branch merge commit; afterward, use an ordinary revert of the PR merge
commit. Never rewrite history or force-push. GitHub merge remains gated on
current checks.

## Lessons promoted

- `CONTEXT.md`: none; no reusable architecture change.
- `docs/ARCHITECTURE.md` or ADR: none.
- Skill/workflow rule: none; existing novel-byte and exact-parent-union rules
  correctly caught the initial incomplete merge evidence.

## Follow-up

- `unrelated-refactor-or-quality-suggestion`, non-blocking: define transient
  failure-cache invalidation for `SavedProjectRegistryLoader` and add an
  unavailable-to-recovery test. This is exact dev-parent behavior and is not
  part of this preservation integration.
- Existing accepted App Studio and Windows Server fixture gaps remain separate;
  no tracker mutation is authorized or performed for them here.
