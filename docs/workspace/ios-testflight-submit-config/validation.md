# Validation: `ios-testflight-submit-config`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| 2026-08-29 | EAS submit-profile resolver assertion | passed | All five `personal-store` fields resolved to configured personal values. |
| 2026-08-29 | `bash devtools/tests/ios-release-smoke.sh` | passed | Personal iOS release dry-runs and input guards passed. |
| 2026-08-29 | `devtools/happyctl ios-doctor` | passed | Personal identity, EAS profiles/login, TestFlight config, and `dev` passed; dirty state is expected until commit. |
| 2026-08-29 | `git diff --check` | passed | No whitespace errors. |
| 2026-08-29 | `python3 scripts/workflow-ci.py --staged` | failed as expected | Proved workflow evidence was required; no commit was created. |
| 2026-08-29 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-29 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-29 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-29 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Personal profile resolves numeric ASC app and valid team IDs | verified | EAS resolver assertion and iOS release smoke. |
| API private key remains outside tracked source | verified | Whole-diff inspection; key fields remain environment placeholders. |
| Official profiles and implicit latest builds remain unreachable | verified | `happyctl` validates `personal-store` and requires explicit `--build-id`. |
| Existing store build remains reusable | verified | Build `796d2451-defb-4ecb-80e0-90040af8fa10` finished as `1.7.0 (10)`. |

## Remaining gaps

- Apple processing can only be verified after the committed fix passes the
  clean-worktree gate and the exact build is submitted.
