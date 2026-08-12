# Validation: `happyctl-refresh-guards`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-12` | `bash devtools/tests/happyctl-refresh-guards-smoke.sh` before implementation | failed as expected | RED: `validate_base_branch_for_refresh` did not exist. |
| `2026-08-12` | `bash -n devtools/happyctl` | passed | Shell syntax valid. |
| `2026-08-12` | `bash devtools/tests/happyctl-refresh-guards-smoke.sh` | passed | Allowed devtools-only delta accepted; product delta and both missing-config cases rejected. |
| `2026-08-12` | `bash devtools/tests/ios-release-smoke.sh` | passed | Existing happyctl iOS command behavior preserved. |
| `2026-08-12` | `python3 scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption valid. |
| `2026-08-12` | `python3 scripts/test-workflow-core.py` | passed | 14 tests. |
| `2026-08-12` | `python3 scripts/test-workflow-ci.py` | passed | 14 tests. |
| `2026-08-12` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Allow allowlisted personal-main commits | verified | Focused fixture accepts a devtools-only commit above its official ref. |
| Reject non-allowlisted personal-main commits | verified | Focused fixture rejects a product-file delta. |
| Stop before dependency installation when client ID is missing | verified | Focused build seam returns failure and leaves install marker absent. |
| Stop before dependency installation when app slug is missing | verified | Focused build seam returns failure and leaves install marker absent. |
| Apply the same validation on macOS and Linux | verified | Whole-diff inspection confirms both refresh paths call `validate_base_branch_for_refresh`. |

## Remaining gaps

- `devtools-layout-smoke.sh` is intentionally deferred until the devtools-only
  fix is integrated into personal `main`; running it from `dev` correctly sees
  the personal product stack as outside the main allowlist.
