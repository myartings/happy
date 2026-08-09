# Personal EAS Environment Isolation Specification

Status: Accepted
PRD: `docs/plans/personal-eas-environment-isolation-prd.md`

## Contract

`packages/happy-app/eas.json` must set `environment: personal` on
`build.personal` and `build.personal-store`. Their distribution, channel, and
`APP_ENV=personal` values remain unchanged. No official profile may use the
Personal environment.

The `personal` EAS environment must provide project-scoped `EXPO_OWNER` and
`EXPO_PUBLIC_EAS_PROJECT_ID` values for `@myartings/happy-personal`. These values
are operational configuration and are not committed.

## Verification

- Parse `eas.json` and assert both Personal profiles use `personal`.
- Assert official profiles do not use `personal`.
- Resolve Expo config with the Personal project ID and validate owner, slug, bundle
  identifier, scheme, update URL, and runtime policy.
- Run Happy typecheck and configured workflow validation.
