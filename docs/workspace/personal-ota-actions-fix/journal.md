# Journal: `personal-ota-actions-fix`

## `2026-08-10`

- Confirmed `workflow_dispatch` cannot register because the personal workflow
  is absent from default `main`; selected tag push from `dev`.
- Added Android tag trigger, `origin/dev` ancestry guard, derived tag inputs,
  Android-only fingerprint preflight, and scoped publish skip flag.
- Verified YAML, both ancestry paths, Expo config, Android fingerprint,
  typechecks, workflow tooling, and reviewed full-suite baseline gaps. No OTA
  was published during implementation.
