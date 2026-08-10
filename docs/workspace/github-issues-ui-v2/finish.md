# Finish Review: `github-issues-ui-v2`

## Summary

Implemented the approved Session-first GitHub Issues UI v2 behind the existing
default-off device-local feature flag. Returning use is task-focused; account
management lives in Settings; create and Agent dispatch remain explicit steps.

## Verification

- 70 focused GitHub Issues/local-settings tests passed.
- 106 Happy App test files / 1052 tests passed; app and server typechecks passed.
- Workflow validation, 14 core tests, and 14 CI tests passed.
- Windows NSIS build, install hash verification, launch verification, and live
  Issues-entry rendering passed.
- Android targets were available, but native live acceptance is an accepted gap
  because CMake/Ninja rejected generated paths longer than 260 characters.
- One unrelated Happy Server attachment-download test remains red on Windows;
  the feature changes no server files.

## Whole-diff review

Feature logic remains under `features/github-issues`; host seams are limited to
the Session entry button, three routes, local settings, Settings navigation,
route title, and translation catalogs. No official GitHub profile API, backend,
browser credential storage, permissions, Project Todos behavior, or protected
native source was changed.

## Rollback or mitigation

Disable `devGithubIssuesEnabled` to remove every Issue entry and retain local
draft/preferences. Revert this feature branch to remove the implementation. The
desktop installer retained manager-controlled backups during replacement.

## Lessons promoted

- Feature design lesson: keep developer decision surfaces in Happy and keep
  Agent workflow state inside repository skills and generated task prompts.
- Architecture lesson: repository resolution and dispatch construction belong
  behind a feature Module, leaving host navigation seams narrow.
- Verification lesson: Windows Android native builds require a short checkout
  path while generated CMake object paths remain subject to the 260-character
  Ninja limit.

## Follow-up

- Re-run Android live acceptance from a shorter checkout path or after native
  dependency path handling is fixed.
- Investigate the independent Happy Server local attachment-download 404 in a
  separate task if server CI requires a clean Windows run.
