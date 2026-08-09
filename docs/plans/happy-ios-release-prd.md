# Happy Personal iOS Release

Status: Accepted for implementation
Owner: personal Happy `dev` branch

## Problem

Happy Personal already has an Expo/EAS identity and an internal-distribution
profile, but the personal iOS release path is not safely operable. Existing
commands can fall back to official submit profiles, release checks are not
centralized, and binary releases are not clearly separated from EAS Update.

## Outcome

Provide a personal iOS release path with three explicit channels:

- Ad Hoc/internal binary builds for registered devices.
- Store/TestFlight binary builds and submission using only personal profiles.
- iOS-only EAS Update publication on the `personal` channel.

Every mutating release action must be explicit, support a non-mutating preview,
validate personal app identity, refuse official submit profiles, and leave a
local report without recording credentials.

## Product decisions

- Keep Happy product identity and EAS profiles in `packages/happy-app`.
- Keep operational commands, local configuration, reports, and release safety
  checks in `happy-manager`.
- Use EAS for Happy native builds and submission; do not copy XcodeGen archive
  commands from native Swift projects.
- Treat private IPA hosting as optional artifact mirroring. EAS Internal
  Distribution remains the first installation path.
- Keep binary release and EAS Update as separate commands and reports.
- Require actual releases from clean `dev`; allow dry-run from a feature branch
  so implementation can be verified before merge.

## Risk controls

- Validate `Happy Personal`, `com.myartings.happy`, `happy-personal`, the
  personal EAS project ID, and the `personal` channel before cloud operations.
- Add a dedicated `personal-store` build and submit profile so commands never
  inherit the official `production` submit profile.
- Keep Apple/Expo tokens and IDs out of tracked files; read local overrides from
  `happy-manager/config.env` or EAS-managed credentials.
- Keep Personal ATS strict except for local-network access.
- Require a release message for EAS Update and target iOS explicitly.
- Do not modify the live private OTA server as part of this slice.

## Out of scope

- Public App Store review submission or release.
- Creating the App Store Connect app record.
- Changing official Happy production/development profiles.
- Publishing a build, registering a device, or deploying an EAS Update during
  implementation.
- Replacing EAS with Fastlane or raw `xcodebuild`.
