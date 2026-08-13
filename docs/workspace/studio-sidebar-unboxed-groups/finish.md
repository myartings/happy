# Finish Review: `studio-sidebar-unboxed-groups`

## Summary

- Added one pure presentation decision that maps the already Studio-gated
  session-row style to `card` or `unboxed`.
- Active-session groups and project/workspace groups now consume that decision.
  Studio directly selects transparent list containers instead of composing the
  default white card and attempting to override it.
- Project headers no longer add a white rounded Studio surface. Existing group
  spacing, selected-row fill, controls, callbacks, and ordering remain intact.

## Verification

- Focused Studio policy/style suite: 2 files, 17 tests passed.
- Complete Happy App test family after the final edit: 113 files, 1116 tests
  passed.
- `pnpm --filter happy-app typecheck`: passed.
- `git diff --check`: passed.
- Happy workflow validation plus workflow core/CI tests: passed (14 + 14 tests).
- Strict active workflow audit: passed with only the explicitly delegated visual
  acceptance gap.

## Whole-diff review

- No blocking findings.
- Default and non-Tauri styles still resolve to `card`; only packaged-desktop
  Studio resolves to `unboxed`.
- Both component diffs preserve JSX hierarchy, event handlers, row props,
  navigation, collapse/favorite controls, and mobile swipe behavior.
- The shared helper depends on the existing `showCardSurface` regional token,
  so it does not introduce a second runtime source of truth.

## Rollback or mitigation

- Revert the single child commit to restore the prior card-composition path.
- No data, settings, migrations, protocol, or persistent state are involved.
- If the integrated visual result is too flat or dense, adjust only the
  unboxed container/header styles in a user-approved follow-up slice.

## Lessons promoted

- `CONTEXT.md`: none; the finding is local to this visual revision.
- `docs/ARCHITECTURE.md` or ADR: none; component boundaries are unchanged.
- Skill/workflow rule: none; existing explicit user screenshot acceptance loop
  remains authoritative.

## Follow-up

- Parent cherry-picks this commit into `feature/studio-ui-integration`, resolves
  only expected workflow archive-row overlap if present, runs integrated checks,
  builds and installs the packaged desktop client, captures the same sidebar
  state, and asks the user to accept or revise it.
