# Finish Review: `flat-session-runtime-status-label`

## Summary

The upstream flat session list became the default during integration and bypassed the compact-row status fix. The flat row now always renders the same localized runtime states and keeps Idle text secondary while retaining the existing connection dot.

## Verification

- Focused runtime-status tests: 8/8 passed.
- Happy App typecheck: passed.
- Installed-client smoke: required after merge and rebuild.

## Whole-diff review

Two product files changed: one minimal presentation seam and its source-wiring regression. Unread attention remains represented by the existing dot/title styling; the third line now always answers the runtime-state question.

## Rollback or mitigation

Revert the follow-up commit to restore upstream flat-row behavior.

## Lessons promoted

- `CONTEXT.md`: None.
- `docs/ARCHITECTURE.md` or ADR: None.
- Skill/workflow rule: None.

## Follow-up

Merge into `dev`, force-refresh Happy Desktop, and visually confirm the installed flat list.
