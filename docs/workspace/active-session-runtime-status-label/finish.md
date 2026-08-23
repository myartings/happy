# Finish Review: `active-session-runtime-status-label`

## Summary

Added always-visible localized runtime status text to compact active-session
rows. The labels map thinking to Running, waiting to Idle, pending permissions
to Permission required, and disconnected sessions to last seen. Idle uses the
same secondary theme color as the existing waiting indicator.

## Verification

- Focused runtime and wiring tests: 7/7 passed.
- Happy App typecheck: passed.
- Full Happy App tests: 1317/1318 passed; the only failure is the previously
  accepted unrelated Studio sidebar source-wiring baseline assertion.
- Workflow adoption, core, and CI checks: passed (14/14 core and 14/14 CI).
- Installed-client smoke: mandatory post-merge follow-up because Happy Manager
  packages only the merged `dev` branch.

## Whole-diff review

Passed. The patch changes only compact-row status presentation, its regression
test, and formal workflow evidence. Existing status-dot branches, unread
attention, draft indicators, navigation, grouping, and session-state derivation
remain unchanged.

## Rollback or mitigation

Revert the feature commit from `dev` and rerun
`devtools/happyctl.ps1 refresh-desktop`. The change has no data, protocol,
persistence, or migration effect.

## Lessons promoted

- `CONTEXT.md`: not required; this is a narrow presentation seam.
- `docs/ARCHITECTURE.md` or ADR: not required; no architecture changed.
- Skill/workflow rule: not required; no reusable workflow change was found.

## Follow-up

- Merge the feature PR into personal `dev`.
- Run the canonical Happy Manager Windows refresh and confirm the installed
  compact active-session rows show the status label and matching Idle color.
