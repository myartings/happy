# Finish Review: `ios-testflight-submit-config`

## Summary

Corrected the personal TestFlight submit profile so EAS receives the fixed,
non-secret App Store Connect app and Apple team identifiers. API-key material
remains environment-sourced and untracked.

## Verification

- EAS submit-profile resolver assertion passed for all five personal values.
- `devtools/tests/ios-release-smoke.sh` passed.
- Four configured repository workflow checks passed with zero failures.
- `git diff --check` and the whole-diff secret-pattern scan passed.

## Whole-diff review

The runtime diff is limited to `packages/happy-app/eas.json` and the matching
validator in `devtools/happyctl`. It does not expose a private key, Apple login,
or official Happy identifiers. Submission still requires `personal-store`, a
clean `dev`, authenticated EAS, configured credentials, and an explicit build
ID.

## Rollback or mitigation

Revert the commit to restore the prior placeholders. If Apple submission fails,
retain the successful EAS build and diagnose the submission record; do not
rebuild or select a different artifact implicitly.

## Lessons promoted

- `CONTEXT.md`: no change required.
- `docs/ARCHITECTURE.md` or ADR: no change required.
- Skill/workflow rule: existing `happy-ios-release` exact-build and credential
  controls remain authoritative.

## Follow-up

- Submit EAS build `796d2451-defb-4ecb-80e0-90040af8fa10` through
  `devtools/happyctl ios-submit-testflight` after this commit makes `dev` clean.
- Verify EAS submission completion and remaining App Store Connect processing.
