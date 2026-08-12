# Finish Review: `github-issues-inaccessible-repository`

## Summary

Changed the Session GitHub Issues `inaccessible` path from a generic repository
picker to repository-specific connection management. The resolver now retains
the detected repository identity, the Session entry passes it through local
navigation state, and the management page names the repository and offers the
existing explicit GitHub App access-management action.

## Verification

- RED/GREEN coverage spans resolver, Session entry, and management screen.
- Focused tests pass: 3 files, 28 tests.
- Complete GitHub Issues family passes: 12 files, 73 tests.
- Complete Happy App suite passes: 111 files, 1099 tests.
- Happy App TypeScript check passes.
- Four repository workflow checks pass, including both 14-test suites.
- `git diff --check` passes.

## Whole-diff review

No blocking finding remains. The diff preserves detected `owner/repo` only in
local state, never reads credentials or installation metadata, and does not
open GitHub during render or routing. External navigation remains behind the
existing explicit user action. Only `inaccessible` changes behavior;
`ambiguous`, `no-remote`, and `lookup-failed` remain picker paths, while
disconnected and reauthorization paths remain connection-management paths.

## Rollback or mitigation

Revert the product commit and rebuild the personal client, or restore the
latest Happy Devtools application backup. No data migration or GitHub
permission mutation occurs, so rollback requires no credential cleanup.

## Lessons promoted

- `CONTEXT.md`: no repository-wide promotion; this is feature-specific UX.
- `docs/ARCHITECTURE.md` or ADR: no architecture change.
- Skill/workflow rule: focused tests now preserve the distinction between
  ambiguity and an authoritative-but-inaccessible repository.

## Follow-up

Archive and commit the feature branch, merge it into personal `dev`, force
refresh the macOS client, and use the Session UI to verify that `iOSTemplate`
shows repository-specific access management without a substitute picker.
