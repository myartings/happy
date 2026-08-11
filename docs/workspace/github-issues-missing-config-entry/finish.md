# Finish Review: `github-issues-missing-config-entry`

## Summary

The Session GitHub Issues entry now checks the Issues connection before resolving
a repository. Disconnected, unconfigured, and reauthorization-required states
open the existing connection-management screen; genuine repository ambiguity or
lookup failure still opens the repository picker. Happy Manager now refuses a
personal macOS/Linux Desktop build that omits the public GitHub App identifiers.

## Verification

- 70 focused GitHub Issues tests passed.
- Happy app typecheck passed.
- Manager syntax, iOS smoke, build guard, and whitespace checks passed.

## Whole-diff review

- No credential material, permissions, GitHub mutations, server routes, Issue
  CRUD, or official GitHub profile behavior changed.
- Host integration remains narrow: one Session-entry connection check and one
  Manager preflight helper.

## Rollback or mitigation

- Revert the feature-branch component/test/workflow changes and the two uncommitted
  Happy Manager files. The installed client was not replaced.

## Lessons promoted

- `CONTEXT.md`: none; behavior is already specified by the GitHub Issues v2 spec.
- `docs/ARCHITECTURE.md` or ADR: none; ADR 0006 already requires fail-closed config.
- Skill/workflow rule: Manager parity checks should cover every supported Desktop OS.

## Follow-up

- Add the existing public GitHub App client ID and slug to macOS `config.env`,
  then build/install only with explicit user authorization.
