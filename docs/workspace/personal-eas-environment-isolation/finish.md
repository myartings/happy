# Finish Review: `personal-eas-environment-isolation`

## Summary

Both Personal EAS build profiles now select an isolated `personal` environment.
Official profiles and shared account-level production variables are unchanged.

## Verification

- Personal/official profile boundary assertions passed.
- Resolved Personal Expo identity assertions passed.
- Happy app and server typechecks passed.
- Workflow validator and 28 workflow-core/CI tests passed.

## Whole-diff review

The product seam is two environment-name replacements in `eas.json`; remaining
files are the accepted contract and required workflow evidence. No credentials
or EAS variable values are tracked.

## Rollback or mitigation

Revert the profile environment names to `production`. This restores prior
behavior but also restores the known cross-project variable collision.

## Lessons promoted

- `CONTEXT.md`: no change needed.
- `docs/ARCHITECTURE.md` or ADR: feature spec records the boundary.
- Skill/workflow rule: Personal release profiles require a dedicated EAS environment.

## Follow-up

Merge to `dev`, configure project-scoped values in EAS environment `personal`,
and retry the authorized internal iOS build.
