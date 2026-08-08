# Validation: `workflow-adoption`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| 2026-08-08 | `python3 scripts/workflow-check.py --only check --record workflow-adoption` | failed | First run found the missing repository archive ledger. |
| 2026-08-08 | `python3 scripts/workflow-check.py --only check --record workflow-adoption` | failed | Second run exposed two template-maintenance-only tests that require the intentionally excluded template validator. |
| 2026-08-08 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-08 | `python3 scripts/test-workflow-core.py` | passed | 14 portable workflow-state tests. |
| 2026-08-08 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-08 | `python3 scripts/workflow-audit.py --strict` | passed | Passed with only the expected future review and finish gates pending. |
| 2026-08-08 | `python3 scripts/workflow-check.py --only check --record workflow-adoption` | passed | Four configured checks, zero failures. |
| 2026-08-08 | selective manifest dry-run | passed | Zero files require synchronization. |
| 2026-08-08 | whole-diff and original-main inspection | passed | Only workflow files and the appended root rule changed; original `main` is clean at `upstream/main`. |
| 2026-08-08 | `python3 scripts/workflow-ci.py --staged` from WSL over a Windows-created worktree | unavailable | Git cannot resolve the Windows `.git` worktree pointer from WSL; this mixed-environment invocation is unsupported. |
| 2026-08-08 | `python scripts/workflow-ci.py --staged` on Windows | passed | Staged diff accepted after normalizing Git paths to POSIX form. |
| 2026-08-08 | `python3 scripts/test-workflow-ci.py` in WSL | passed | All 14 CI enforcement tests passed after the Windows portability adaptation. |
| 2026-08-08 | `python3 scripts/workflow-audit.py --strict` in WSL | passed | No active workflow remains after archive. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Original worktree is clean on `main`; `HEAD == upstream/main`. |
| AC2 | verified | Current worktree is on `myartings/workflow-adoption`, based on `origin/dev`. |
| AC3 | verified | Selective sync preserved target-only Happy skills and settings. |
| AC4 | verified | Manifest validator and whole-diff inspection. |
| AC5 | verified | `.ai/project.json` inspection; workflow-core commands executed. Product commands are configured but not applicable to a documentation/tooling-only change. |
| AC6 | verified | Repository-local scripts created and advanced this workflow through planning, implementation, verification, review, and finish; archive is the terminal command after the finish gate. |
| AC7 | verified | Validator, 14 workflow-state tests, 14 workflow-CI tests, strict audit, mirror spot checks, and selective-sync dry-run passed; staged CI is the terminal enforcement run. |

## Remaining gaps

- Product typecheck and test commands were not run because no Happy product or dependency files changed.
- Run staged workflow CI in the same platform environment that owns the Git
  worktree; a normal Linux checkout remains supported.
