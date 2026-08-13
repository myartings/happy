# Finish Review: `studio-conversation-layout`

## Summary

Implemented the first bounded Studio conversation-layout batch. Packaged Studio
desktop now uses the accepted v2 54 pt header, 20 pt header inset, centered
832 pt message viewport (800 pt after existing message insets), 28 pt top gap,
and 16 pt bottom gap. Default, standalone web, and native layout values are
unchanged.

## Verification

- Focused Studio layout/style tests: 15 passed.
- `pnpm --filter happy-app typecheck`: passed.
- Happy workflow validation, core tests, and CI tests: passed (14 + 14 tests).
- `git diff --check`: passed.
- Packaged screenshot: deliberately deferred to the integration owner.

## Whole-diff review

Passed with no actionable findings. The only product host seams are
`ChatHeaderView.tsx` and `ChatList.tsx`; the geometry logic lives in the new
Studio-owned feature module. Scroll callbacks, target navigation,
virtualization, message rendering, composer, mobile branches, data, and
protocols are unchanged.

## Rollback or mitigation

Revert the local feature commit. The resolver's Default path is a no-op and the
feature introduces no persistence, migration, protocol, or external mutation.

## Lessons promoted

- `CONTEXT.md`: none; no durable repository-wide learning.
- `docs/ARCHITECTURE.md` or ADR: none; leaf presentation change only.
- Skill/workflow rule: none.

## Follow-up

The integration owner should merge this branch with the other Studio regions,
build the packaged desktop, capture the populated main conversation at exactly
1470×870, and ask the user to accept or reject the visible header/column
geometry. This branch does not claim visual acceptance.
