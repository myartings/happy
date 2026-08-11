---
name: happy-ios-release
description: Safely inspect, build, submit, and update the personal Happy iOS client through happyctl and Expo EAS. Use when the user asks to release Happy on iPhone, create an internal iOS build, prepare or submit TestFlight, inspect iOS release readiness/status, or publish a personal-channel EAS Update.
---

# Happy iOS Release

Operate from `/Users/myartings/workspace/happy`. Product configuration
lives in `/Users/myartings/workspace/happy`; do not substitute the native
XcodeGen `deploy-ota` workflow for this Expo app.

## Safety contract

- Start with `devtools/happyctl ios-doctor` for readiness questions.
- Preview every requested mutation with its `--dry-run` form first.
- Run a real build, submission, or update only when the user explicitly asks.
- Real releases require a clean Happy `main` checkout and authenticated personal
  EAS account.
- Never select `production`, `development-store`, or `preview-store`; those are
  official Happy profiles.
- Require the Personal build profiles and EAS Update command to use the
  project-isolated `preview` EAS environment supported by the current plan;
  never reuse shared `production` values.
- Never print or commit Expo/Apple credentials or `config.env`.
- Do not modify the private OTA server unless separately requested.

## Route the request

| Intent | Command |
| --- | --- |
| Readiness | `devtools/happyctl ios-doctor` |
| Internal iPhone build | `devtools/happyctl ios-build-internal [--dry-run]` |
| Store/TestFlight build | `devtools/happyctl ios-build-testflight [--dry-run]` |
| Submit an exact store build | `devtools/happyctl ios-submit-testflight --build-id ID [--dry-run]` |
| Publish JS/resources | `devtools/happyctl ios-publish-update --message "..." [--dry-run]` |
| Build/submission status | `devtools/happyctl ios-release-status` |

Internal/TestFlight commands publish native binaries. `ios-publish-update`
uses EAS Update and cannot deliver native dependency, entitlement, permission,
or Info.plist changes.

## First release

1. Confirm `EXPO_OWNER` and `EXPO_PUBLIC_EAS_PROJECT_ID` exist only in untracked
   `config.env` or the environment.
2. Run `ios-doctor` and resolve every missing item.
3. Register the target device through EAS when internal distribution requests
   it.
4. Run the internal-build dry-run, then the real command after authorization.
5. Install from the EAS link and test login, session restore/connect, push,
   camera, microphone, background/resume, and EAS Update.
6. Prepare TestFlight only after internal-device smoke passes.

Use `ios-release-status` to obtain the finished `personal-store` build ID and
pass that exact ID to `ios-submit-testflight`. Never submit an implicit latest
build.

Non-interactive TestFlight submission additionally requires local
`APP_STORE_CONNECT_API_KEY_PATH`, `APP_STORE_CONNECT_API_KEY_ID`,
`APP_STORE_CONNECT_API_ISSUER_ID`, `APP_STORE_CONNECT_APP_ID`, and
`APPLE_DEVELOPMENT_TEAM`. Keep these out of git.

After a real command, report the Happy commit, EAS profile/channel, outcome,
report path, and any remaining App Store Connect processing step.
