# Validation: `macos-stable-signing`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-12` | `security find-identity -v -p codesigning` | passed | One valid Apple Development identity and one iPhone Distribution identity found; only the former is eligible. |
| `2026-08-12` | `codesign -dv --verbose=4 /Applications/Happy\ \(dev\).app` | failed acceptance | Reproduced `Signature=adhoc` and `TeamIdentifier=not set`. |
| `2026-08-12` | `bash devtools/tests/happyctl-macos-signing-smoke.sh` before implementation | failed as expected | RED: `resolve_macos_signing_identity` did not exist. |
| `2026-08-12` | `bash -n devtools/happyctl` and `bash -n devtools/tests/happyctl-macos-signing-smoke.sh` | passed | Shell syntax valid. |
| `2026-08-12` | `bash devtools/tests/happyctl-macos-signing-smoke.sh` | passed | Identity priority, no-identity refusal, non-ad-hoc arguments, sign-before-quit ordering, signing-failure stop, and teamless rejection verified. |
| `2026-08-12` | focused smoke after least-privilege refinement, before implementation | failed as expected | RED: automatic selection still preferred Developer ID Application and accepted configured iPhone Distribution. |
| `2026-08-12` | focused smoke after least-privilege refinement | passed | GREEN: automatic selection prefers Apple Development and exact eligible-label validation rejects iPhone Distribution. |
| `2026-08-12` | focused failure-injection smoke before explicit propagation guards | failed as expected | RED: a failed `codesign` command was hidden by a later successful verification call in conditional execution context. |
| `2026-08-12` | focused failure-injection smoke after explicit propagation guards | passed | GREEN: injected signing and backup failures return immediately before replacement; whole-diff inspection confirms the same explicit guards on tool checks, removal, and copy. |
| `2026-08-12` | `bash devtools/tests/happyctl-refresh-guards-smoke.sh` | passed | Existing refresh branch/config guards preserved. |
| `2026-08-12` | `bash devtools/tests/ios-release-smoke.sh` | passed | Existing iOS release behavior preserved. |
| `2026-08-12` | `shellcheck ...` | unavailable | `shellcheck` is not installed; shell syntax and focused behavior tests provide the applicable local signal. |
| `2026-08-12` | `python3 scripts/validate-happy-workflow.py` | passed | Happy workflow adoption valid. |
| `2026-08-12` | `python3 scripts/test-workflow-core.py` | passed | 14 tests. |
| `2026-08-12` | `python3 scripts/test-workflow-ci.py` | passed | 14 tests. |
| `2026-08-12` | `git diff --check` | passed | No whitespace errors. |
| `2026-08-12` | `sign_desktop_app "$BUILD_APP"`; strict signature and entitlement inspection | passed | Real generated app signed with Apple Development identity, Apple chain, Team Identifier `MJS6V7A44A`, hardened runtime, expected bundle identifier, and the source entitlement set. |
| 2026-08-12 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-12 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-12 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-12 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| 2026-08-12 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-12 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-12 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-12 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Select a stable eligible local identity without asking the user for an identifier | verified | Focused smoke and real local identity resolution. |
| Never fall back to ad-hoc signing | verified | No-identity fixture fails; real artifact has Apple certificate chain and Team Identifier. |
| Complete signing before replacing the installed client | verified | Focused event-order assertion and signing-failure stop assertion. |
| Reject an ad-hoc or teamless installed client | verified | Focused installed verification fixture. |
| Preserve stable requester identity across ordinary rebuilds | verified | Real designated requirement is certificate-backed (`anchor apple generic`) and no longer CDHash-based ad-hoc identity. |

## Remaining gaps

- The authorized operational follow-up must still integrate the commit, perform
  exact pre/post credential metadata checks, rebuild/install from `dev`, and
  verify the first launch. This does not block the completed tooling slice.
