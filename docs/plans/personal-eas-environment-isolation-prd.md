# Personal EAS Environment Isolation

Status: Accepted for implementation
Owner: personal Happy `dev` branch

## Problem

The personal iOS profiles load the shared `production` EAS environment. Account-wide
variables in that environment can point at another EAS project and override the
Personal project identity, preventing builds or risking cross-project configuration.

## Outcome

Use a dedicated `personal` EAS environment for both Personal binary profiles so
personal project variables never collide with official or account-wide production
configuration.

## Acceptance

- `build.personal` and `build.personal-store` select environment `personal`.
- Official development, preview, and production profiles remain unchanged.
- The resolved Personal identity remains `@myartings/happy-personal` with bundle ID
  `com.myartings.happy`.
- Configuration and release validation pass without credentials in tracked files.

## Risk controls

- Change only the two Personal profiles.
- Keep environment values in EAS or untracked local configuration.
- Build only from clean `dev` after review and merge.
