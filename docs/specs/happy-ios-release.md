# Happy Personal iOS Release Specification

Status: Accepted
PRD: `docs/plans/happy-ios-release-prd.md`

## Happy app configuration

`packages/happy-app/eas.json` must define:

- `build.personal`: internal iOS distribution on channel `personal`.
- `build.personal-store`: store distribution on channel `personal`.
- `submit.personal-store`: an isolated personal submit profile with no official
  Bulkacorp identifiers.

For `APP_ENV=personal`, Expo config must resolve to:

| Field | Required value |
| --- | --- |
| Name | `Happy Personal` |
| Bundle identifier | `com.myartings.happy` |
| Scheme | `happy-personal` |
| Update channel | `personal` |
| Runtime policy | `appVersion` |
| ATS | local networking allowed; arbitrary loads disabled |

## Manager commands

The macOS manager must expose:

- `ios-doctor`: read-only tool, identity, configuration, branch, EAS login, and
  credential-presence checks.
- `ios-build-internal [--dry-run]`: build profile `personal`, platform iOS.
- `ios-build-testflight [--dry-run]`: build profile `personal-store`, platform
  iOS, without auto-submitting.
- `ios-submit-testflight --build-id ID [--dry-run]`: submit an explicitly
  selected iOS store build through submit profile `personal-store`.
- `ios-publish-update --message TEXT [--dry-run]`: publish an iOS-only update
  to channel `personal` and environment `production`.
- `ios-release-status`: read-only recent build and submit status.

Mutating commands must require macOS, a clean Happy checkout on `dev`, personal
identity validation, and an authenticated EAS session. Dry-run must print the
resolved command without invoking EAS or requiring a clean `dev` checkout.

## Local configuration

Tracked configuration may document but must not contain real credentials.
Supported overrides:

- `HAPPY_IOS_EAS_CLI_VERSION`
- `EXPO_OWNER`
- `EXPO_PUBLIC_EAS_PROJECT_ID`
- `APP_STORE_CONNECT_API_KEY_PATH`
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_APP_ID`
- `APPLE_DEVELOPMENT_TEAM`

The implementation may use EAS-managed Apple credentials. App Store Connect
key paths and token values must never appear in reports or manager-generated
command output.

## Reporting

After a successful build, submission, or update, write a compact report under
`happy-manager/reports/` containing command kind, Happy commit, profile,
channel, and completion status. Reports remain untracked local artifacts.
