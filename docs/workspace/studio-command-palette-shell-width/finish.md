# Finish Review: `studio-command-palette-shell-width`

## Summary

Corrected the failed packaged Palette-width wiring by making the actual outer
Animated wrapper emit a live responsive numeric width: 640 at the reference
1470 viewport and 90% below the cap.

## Verification

- RED actual-wrapper render test failed at `90%` for both large and small Studio viewports.
- GREEN focused Palette tests: 3 files, 12 tests passed.
- Happy App typecheck passed.
- Happy workflow validation and both 14-test workflow suites passed.
- Strict audit and `git diff --check` passed.

## Whole-diff review

No blocking findings. `useWindowDimensions` updates on resizing; only the Studio
conditional style emits a numeric width. Default/non-Studio retains `90%` and
the 800 cap. Commands, dismissal, animation timing, state, and navigation are
unchanged.

## Rollback or mitigation

Remove `useWindowDimensions` and the Studio conditional `width` property to
return to the prior maxWidth-only attempt.

## Lessons promoted

- `CONTEXT.md`: none; component-specific visual wiring failure.
- `docs/ARCHITECTURE.md` or ADR: none; no architecture change.
- Skill/workflow rule: none.

## Follow-up

Parent cherry-picks, rebuilds the packaged dev client, captures the same Palette
state at the same window size, and asks the user to accept or reject the result.
