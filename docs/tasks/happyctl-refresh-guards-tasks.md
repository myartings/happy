# Happyctl Refresh Guards

## Acceptance

- A personal `main` that is ahead of `upstream/main` only through the existing
  devtools allowlist may proceed through Desktop refresh.
- A personal `main` with any non-allowlisted product/build-input delta is still
  rejected before synchronization or build.
- Desktop build returns failure before dependency installation when either
  public GitHub Issues App identifier is missing.
- macOS and Linux refresh paths apply the same base-branch validation.

## Scope

- `devtools/happyctl`
- focused shell smoke coverage under `devtools/tests/`
- workflow evidence for this bounded bug fix

## Non-goals

- Changing the branch model or allowlist.
- Changing GitHub App identifiers, permissions, authentication, or product UI.
- Changing Windows behavior.

## Plan

- [x] Add regression coverage for allowed and rejected personal-main deltas.
- [x] Add regression coverage for missing GitHub Issues build identifiers.
- [x] Replace numeric ahead rejection with the existing equivalence validator.
- [x] Make build configuration failure propagate from `build_desktop`.
- [x] Run focused and repository workflow checks.
