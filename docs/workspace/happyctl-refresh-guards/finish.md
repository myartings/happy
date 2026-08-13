# Finish Review: `happyctl-refresh-guards`

## Summary

Fixed two Happy Desktop refresh guards: allowlisted devtools commits on personal
`main` no longer block refresh, and missing public GitHub Issues build
identifiers now stop `build_desktop` before dependency installation.

## Verification

Focused RED/GREEN shell coverage passes for valid and invalid branch deltas and
for each missing configuration value. Shell syntax, the neighboring iOS smoke
suite, workflow validation, workflow core tests, and workflow CI tests pass.

## Whole-diff review

The implementation reuses the existing official-product equivalence validator
instead of weakening the allowlist. Both macOS and Linux refresh paths use the
same guard. Configuration remains public machine-local input; no identifier,
credential, authentication flow, product code, or Windows behavior changed.

## Rollback or mitigation

Revert the happyctl and focused smoke-test changes. Until corrected, refresh can
still be run from the prior release only when personal `main` exactly equals the
official ref and both public identifiers are explicitly present.

## Lessons promoted

- No broader documentation change is required; the durable branch and
  configuration contracts already existed in `AGENTS.md` and `devtools/AGENTS.md`.

## Follow-up

Integrate the devtools-only fix into personal `main`, merge it into `dev`, run
the main-only layout smoke test, and retry the forced macOS Desktop refresh.
