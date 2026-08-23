# Finish Review: `restore-grouped-session-list-default`

## Summary

Restore the established grouped compact session list as the default for new and existing clients. A one-time device-local marker repairs the short-lived persisted flat-list default without removing the optional setting.

## Verification

- TDD RED reproduced the persisted-layout regression.
- Related App tests: 41/41 passed.
- App typecheck: passed.
- Diff check: passed.
- Installed-client visual smoke: mandatory after merge and Manager rebuild.

## Whole-diff review

The production diff is limited to one local-settings schema/default/migration seam. The public parser test proves both one-time restoration and later explicit opt-in. No remote settings or session data are changed.

## Rollback or mitigation

Revert the feature commit to restore the upstream flat-list default. The migration affects only a device-local presentation boolean.

## Lessons promoted

- `CONTEXT.md`: None.
- `docs/ARCHITECTURE.md` or ADR: None.
- Skill/workflow rule: None.

## Follow-up

Merge to `dev`, run the Manager refresh, and capture the installed grouped compact layout before claiming completion.
