# Finish Review: `macos-stable-signing`

## Summary

Replaced Happy Desktop's post-install ad-hoc signing with eligible stable Apple
identity selection and pre-install signing. The flow prefers Apple Development,
allows Developer ID Application as a fallback or exact override, rejects iPhone
Distribution and missing identities, preserves the source entitlements, and
requires a strict team-bearing signature.

## Verification

- Focused RED/GREEN smoke covers identity priority, invalid/no identity,
  non-ad-hoc arguments, sign-before-replace ordering, explicit signing and
  backup failure propagation, and installed ad-hoc/teamless rejection.
- Neighboring refresh and iOS release smokes pass.
- Four repository workflow check commands pass, including both 14-test suites.
- A real generated app signs successfully with the local Apple Development
  identity, Apple chain, Team Identifier, hardened runtime, expected bundle ID,
  source entitlements, and a certificate-backed designated requirement.
- `shellcheck` is unavailable; Bash syntax checks and behavior smokes pass.

## Whole-diff review

No blocking finding remains. The diff is limited to macOS devtools signing,
install failure propagation, an optional documented local override, focused
smoke coverage, and workflow evidence. No credential value is read, logged, or
changed by product code. Linux and iOS signing paths are unchanged. The install
path signs before quitting and refuses to continue after signing or backup
failure.

## Rollback or mitigation

Revert the devtools commit to restore the former behavior, or restore the most
recent Happy Devtools application backup if installation fails. The one stale
GitHub Issues credential removed during operational follow-up is recoverable by
fresh GitHub device authorization; no other keychain item is in scope.

## Lessons promoted

- `CONTEXT.md`: no repository-wide product rule needed.
- `docs/ARCHITECTURE.md` or ADR: no architecture change; behavior is local to
  the personal release adapter.
- Skill/workflow rule: focused happyctl smoke permanently guards against
  ad-hoc fallback and hidden shell failures.

## Follow-up

Integrate the devtools-only commit into personal `main` and the complete commit
into `dev`; revalidate and delete the exact stale GitHub Issues credential,
force-refresh the macOS client from `dev`, verify the installed signature, and
launch for clean reauthorization.
