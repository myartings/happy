# Finish Review: `happy-ios-release`

## Summary

Implemented a guarded Happy Personal iOS release surface across Happy app
configuration, happy-manager operations, and the reusable native iOS template.
The code is verified locally but intentionally not committed, pushed, merged,
or used for a live EAS/OTA operation without further authorization.

## Verification

- Happy app/server typechecks passed.
- Happy app: 95 files / 987 tests passed.
- Happy server: 15 files / 105 tests passed.
- Happy workflow configured checks passed with zero failures.
- happy-manager shell/static checks and iOS release smoke passed.
- iosTemplate deploy-OTA smoke, skill validation, and Claude/Codex parity passed.

## Whole-diff review

No blocking finding remains. Official Happy submit profiles are unreachable from
the new manager commands, TestFlight submission requires an explicit EAS build
ID, Personal ATS no longer allows arbitrary network loads, credentials remain
environment-only, and native OTA artifacts are isolated by app slug.

## Rollback or mitigation

- Revert Happy's `personal-store` profile and ATS condition to remove the
  product-side integration.
- Remove the manager `ios-*` commands/skill to disable all personal release
  entrypoints.
- The live private OTA server was not modified, so no server rollback is needed.

## Lessons promoted

- `CONTEXT.md`: no change required.
- `docs/ARCHITECTURE.md` or ADR: release boundary is captured in the feature
  PRD/spec; no general architecture change required.
- Skill/workflow rule: native iOS OTA must isolate app directories/manifests;
  Happy Expo releases must use the project-local `happy-ios-release` skill.

## Follow-up

- Commit/push the Happy feature branch and open a PR to `dev` when authorized.
- Commit/push happy-manager changes when authorized.
- Add real Expo/App Store Connect values to untracked `config.env`, log in to
  EAS, run `ios-doctor`, then build the first internal iOS binary.
- Migrate the legacy root OTA server only as a separately backed-up operation.
