# Finish Review: `restore-flat-session-list-toggle`

## Summary

Restored the personal Flat Session List switch and reconnected the home list to
the persisted `flatSessionList` device setting after official commit
`acc2289c3` had made the flat layout unconditional.

## Verification

- TDD RED failed both focused assertions for the intended missing behavior.
- Focused GREEN passed 2/2.
- Nearest preference/list test family passed 21/21.
- `pnpm --filter happy-app typecheck` passed.

## Whole-diff review

Passed with no blocking findings. The production diff restores the exact two
pre-merge wiring seams and does not touch persistence, migrations, sorting, or
row presentation.

## Rollback or mitigation

Reverting the feature commit returns to the official always-flat behavior.
Existing stored preference values remain valid either way.

## Lessons promoted

- `CONTEXT.md`: not required; this is a one-off merge regression.
- `docs/ARCHITECTURE.md` or ADR: not required; no boundary changed.
- Skill/workflow rule: no promotion; the repository already requires preserving
  personal features during official merges.

## Follow-up

Publish through a PR targeting `dev`, then use Happy Manager to synchronize,
force-rebuild, install, verify, and relaunch the Windows development client.
