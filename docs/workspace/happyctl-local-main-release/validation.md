# Validation: `happyctl-local-main-release`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-22` | `bash devtools/tests/happyctl-official-baseline-smoke.sh` | passed | Ahead-only local main accepted; origin/upstream behind guards rejected. |
| `2026-08-22` | Bash syntax, ShellCheck, signing/refresh smoke tests, `git diff --check` | passed | No regressions or static diagnostics. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Local main ahead of origin is accepted | verified | official-baseline fixture |
| Main behind origin is rejected | verified | official-baseline fixture |
| Upstream product equivalence remains required | verified | official-baseline and refresh-guard fixtures |

## Remaining gaps

- Real release evidence is recorded by the subsequent authorized runtime step,
  not by this source-guard fix.
