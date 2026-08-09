# Task: `happy-ios-release`

## Plan

### Goal

Make Happy Personal iOS internal builds, TestFlight builds/submission, and EAS
Update operable through explicit, guarded `happy-manager` commands.

### Scope

- Repair the reusable native iOS release skill so Codex and Claude contain the
  same parameterized, project-isolated OTA procedure.
- Add personal store/submit profiles and strict Personal ATS behavior to Happy.
- Add manager commands, documentation, dry-run support, and a project-local
  Happy iOS release skill.

### Out of scope

- Execute a cloud build, submit to TestFlight, publish OTA, or modify the live
  private OTA server.

## Verify

- [x] Personal Expo config resolves to the required identity and strict ATS.
- [x] EAS configuration contains isolated `personal` and `personal-store`
  profiles and never selects an official submit profile.
- [x] Every mutating manager command has a side-effect-free dry-run.
- [x] Manager shell syntax and command routing checks pass.
- [x] The iOS release skill validates and points to manager commands.
- [x] Native template Codex/Claude deploy skills are content-equivalent and OTA
  filenames/paths are isolated by app slug.
- [x] The whole diff contains no credentials, runtime files, or unrelated user
  changes.

## Progress

- 2026-08-10: contract created; status `planned`.
- 2026-08-10: implementation and deterministic verification complete; awaiting commit/PR authorization.

## Finish

Status: `verified; awaiting commit/PR authorization`

### Outcome

- Happy Personal now has isolated internal/store/submit profiles and strict ATS.
- happy-manager provides guarded doctor/build/submit/update/status commands and
  a project-local release skill.
- iosTemplate private OTA tooling isolates apps and blocks unsafe filenames.

### Evidence

| Command or review | Result | Notes |
| --- | --- | --- |
| Happy configured workflow check | passed | 8 commands, 0 failures |
| happy-manager iOS smoke | passed | all dry-runs and input guards |
| iosTemplate OTA/parity checks | passed | app isolation and skill parity |

### Remaining limits

- No live EAS build, TestFlight submission, EAS Update, or OTA-server migration
  was authorized or executed.

### Reusable learning

- Require explicit app/profile/build identity at every release boundary; never
  use a shared global manifest namespace or implicit latest store build.
