# Finish Review: `happyctl-local-main-release`

## Summary

Changed the official-baseline source guard to accept an ahead-only local
`main` while retaining rejection of behind/diverged origin history and upstream
product differences.

## Verification

Focused official-baseline, signing, and refresh-guard smoke tests pass, along
with Bash syntax, ShellCheck, and whitespace validation.

## Whole-diff review

Passed. The behavior change is limited to one ancestry comparison and focused
fixture coverage; no push behavior was introduced.

## Rollback or mitigation

Revert the local fix commit to restore exact-equality behavior.

## Lessons promoted

- `CONTEXT.md`: none.
- `docs/ARCHITECTURE.md` or ADR: none.
- Skill/workflow rule: the existing no-push official release invariant remains
  authoritative.

## Follow-up

Rebuild the reviewed dirty baseline worktree and execute the authorized local
official release.
