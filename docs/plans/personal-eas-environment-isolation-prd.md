# Personal EAS Environment Isolation

Status: Accepted for implementation
Owner: personal Happy `dev` branch

## Problem

The personal iOS profiles load the shared `production` EAS environment. Account-wide
variables in that environment can point at another EAS project and override the
Personal project identity, preventing builds or risking cross-project configuration.

## Outcome

Use the default `preview` EAS environment for both Personal binary profiles, with
variables scoped to the Personal EAS project. This isolates the Personal project
from account-wide production configuration without requiring a paid custom
environment.

## Acceptance

- `build.personal` and `build.personal-store` select environment `preview`.
- Official development, preview, and production profiles remain unchanged.
- The resolved Personal identity remains `@myartings/happy-personal` with bundle ID
  `com.myartings.happy`.
- Configuration and release validation pass without credentials in tracked files.

## Risk controls

- Change only the two Personal profiles.
- Use a default EAS environment supported by the current Expo plan; custom
  environments require a Production or Enterprise plan.
- Keep environment values in EAS or untracked local configuration.
- Build only from clean `dev` after review and merge.
