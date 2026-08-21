# Validation: `main-push-guard`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-21` | `bash devtools/tests/main-push-guard-smoke.sh` before implementation | failed as expected | RED: tracked `devtools/git-hooks/pre-push` did not exist. |
| `2026-08-21` | `bash devtools/tests/main-push-guard-smoke.sh` | passed | Real temporary-remote pushes reject direct, feature/URL-to-main, and product-delta main updates; authorized main and non-main pushes pass; install/config/content drift checks pass. |
| `2026-08-21` | `bash devtools/tests/happyctl-refresh-guards-smoke.sh` | passed | Existing allowlisted-main and product-delta validation remains green; fixture now pins its branch name to `main`. |
| `2026-08-21` | `bash devtools/tests/ios-release-smoke.sh` | passed | Neighboring happyctl iOS command behavior remains green. |
| `2026-08-21` | `bash -n devtools/happyctl && bash -n devtools/git-hooks/pre-push` | passed | Bash entrypoints parse successfully. |
| `2026-08-21` | PowerShell parser check | unavailable | `pwsh` is not installed on this Linux machine; PowerShell changes receive whole-diff review only. |
| `2026-08-21` | Windows PowerShell 5.1 AST parser on `devtools/happyctl.ps1` | passed | Parsed on Windows PowerShell `5.1.26100.9022` with zero syntax errors. |
| `2026-08-21` | Windows Git Bash `bash devtools/tests/main-push-guard-smoke.sh` | passed | The complete real temporary-remote push matrix passed on Windows Git for Windows. |
| `2026-08-21` | isolated Windows PowerShell guarded-sync fixture | passed | Installed the stable hook, guarded and pushed the allowlisted personal `main`, fast-forwarded `dev`, and pushed both to local bare remotes; final main/dev commit was `67582960cadb72e0f00225f898ccf607133d1cee`. |
| `2026-08-21` | Windows real-workspace status and `core.hooksPath` check | passed | `C:\Users\myartings\workspace\happy` remained clean on `dev...origin/dev`; `core.hooksPath` remained unset. Candidate code was exercised only in the isolated Shared Directory fixture. |
| `2026-08-21` | `devtools/happyctl install-git-guards` | passed | Current clone uses `/home/myartings/workspace/happy/.git/happy-hooks/pre-push`; repeated fixture installation is idempotent. |
| `2026-08-21` | controlled installed-hook feature-to-main input | passed | Installed stable hook rejected `refs/heads/feature/main-push-guard -> refs/heads/main` before any network push. |
| `2026-08-21` | `git push --dry-run origin HEAD:main` | rejected as expected | The current clone's installed hook rejected the real remote dry-run with source ref `HEAD`; no remote update occurred. |
| `2026-08-21` | `python3 scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption remains valid. |
| `2026-08-21` | `python3 scripts/test-workflow-core.py` | passed | 14 tests. |
| `2026-08-21` | `python3 scripts/test-workflow-ci.py` | passed | 14 tests. |
| `2026-08-21` | `python3 scripts/workflow-audit.py --strict --require-active` | passed with expected future-gate gaps | Implementation, check, review, and finish were pending at execution time. |
| `2026-08-21` | `git diff --check` | passed | No whitespace errors. |
| 2026-08-21 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-21 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-21 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-21 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Temporary-remote and real-origin dry runs reject `HEAD:main` from a feature branch; URL-addressed remote main is also rejected. |
| AC2 | verified | Focused real-push fixture rejects unmarked `main:main`. |
| AC3 | verified | Focused real-push fixture accepts marked allowlisted `main:main`. |
| AC4 | verified | Focused real-push fixture rejects marked product-delta `main:main`. |
| AC5 | verified | Focused real-push fixture accepts unmarked `feature/test`. |
| AC6 | verified | Fixture installs twice, validates the stable Git-common-dir path, and rejects configuration or installed-content drift. |
| AC7 | verified | Root/Bash/PowerShell diff inspected; Bash syntax passed; Windows PowerShell 5.1 parsing, Git Bash real-push smoke, and isolated PowerShell guarded-sync execution passed. |

## Remaining gaps

- None for the accepted AC1-AC7 scope.
