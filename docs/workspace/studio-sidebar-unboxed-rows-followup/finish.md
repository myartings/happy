# Finish Review: `studio-sidebar-unboxed-rows-followup`

## Summary

- Recorded the revision-2 packaged screenshot as a failed visual verification,
  not an accepted result.
- Fixed the style-source split: the resolved sidebar frame style now flows
  through `SidebarView → MainView → SessionsList`.
- Added a pure row-chrome policy shared by compact active/project rows and
  historical rows. Ordinary Studio rows cannot apply default container surface,
  group-position shape, clipping, divider, or corner radius.
- Selected Studio rows retain only the existing bounded selected fill and
  9-point local radius.

## Verification

- Failed screenshot evidence record validates with 3 claims, 4 evidence items,
  and high overall quality.
- TDD RED: five tests failed because style propagation and row-chrome policy did
  not exist.
- Focused policy/wiring/style tests: 3 files, 24 tests passed.
- Complete Happy App tests: 114 files, 1123 tests passed.
- Happy App typecheck and `git diff --check`: passed.
- Happy workflow validation, 14 workflow-core tests, 14 workflow-CI tests, and
  strict audit: passed.

## Whole-diff review

- No blocking findings.
- The authoritative style override is supplied only by runtime-gated
  `SidebarView`; phone and standalone callers omit it and use the prior resolver.
- Default container, positional shape, clipping, selected fill, and divider
  behavior remain represented by the Default policy result.
- Row ordering, geometry, metadata, navigation, callbacks, context menus,
  project controls, and native swipe behavior are unchanged.

## Rollback or mitigation

- Revert this follow-up commit to restore the first unboxed implementation.
- No persisted data, settings schema, migrations, protocol, or release state are
  changed.
- If the rebuilt result is too flat, adjust only selected/hover/focus local
  affordances in a separately user-approved visual slice; do not restore group
  chrome implicitly.

## Lessons promoted

- `CONTEXT.md`: none; the learning is specific to this regional sidebar path.
- `docs/ARCHITECTURE.md` or ADR: none; no durable system boundary changed.
- Skill/workflow rule: none; the existing human screenshot gate correctly
  detected the false positive and forced evidence-backed correction.

## Follow-up

- Parent cherry-picks this follow-up after the first unboxed commit, rebuilds and
  installs the packaged desktop client, reproduces the same selected-session
  state at 1470×875 points, captures it, and asks the user to accept or revise.
