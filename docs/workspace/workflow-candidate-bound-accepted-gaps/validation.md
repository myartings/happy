# Validation: `workflow-candidate-bound-accepted-gaps`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | `python scripts/workflow-state.py check-receipt --help` | reproduced | Public receipt choices are only `passed` and `blocked`; no structured accepted-gaps path exists. |
| `2026-08-30` | inspect preserved run `f956b565-030a-4f9c-a55d-83aacfc816bc` from named Windows stash | reproduced | Complete 9-command staged run: indexes 2 and 3 failed with exit 1; indexes 0, 1, and 4-8 passed. |
| `2026-08-30` | inspect `formal_run_errors`, `record_check_receipt`, `check_binding_errors`, and both workflow-CI terminal paths | reproduced | All-success validation rejects the run; generic accepted-gaps clears bindings; review/archive require those bindings. |
| `2026-08-30` | three focused public-CLI RED tests | failed as expected | 3/3 failed: generic gate unexpectedly accepted the outcome, while structured accepted-gaps receipts were rejected by the parser. |
| `2026-08-30` | four focused accepted-gaps public-CLI tests | passed | 4/4 passed in 66.330 s: generic bypass, exact two-failure receipt, worktree rejection, tamper/clear behavior, and terminal CI. |
| `2026-08-30` | `python scripts/test-happy-workflow-runtime.py` | passed | 10/10 public-CLI tests passed in 157.470 s, including existing successful delivery, candidate drift, archive rollback, and staged/committed CI behavior. |
| `2026-08-30` | `python scripts/validate-happy-workflow.py` | passed | Selective workflow authority remains valid at `workflow-2026.08.2@8d07a74931f8`. |
| `2026-08-30` | `python scripts/test-validate-happy-workflow.py` | passed | 9/9 validator tests passed. |
| `2026-08-30` | `python scripts/test-happy-workflow-state-upgrade.py` | passed | 2/2 state-upgrade compatibility tests passed. |
| `2026-08-30` | Python compile plus `git diff --check` | passed | Modified workflow runtime and test files compile; no whitespace error. |
| `2026-08-30` | `python scripts/workflow-check.py --applicable --record workflow-candidate-bound-accepted-gaps --staged --base dev` | passed | Candidate-bound run `37145aa5-4c41-48c8-ad13-ee7379ef24e5` passed 5/5 commands for staged candidate `e4ee2185d430...` on base `f97b5d73800b...`; runtime portion passed 10/10 in 171.199 s. |
| `2026-08-30` | independent Spec and Standards review of candidate `e4ee2185d430...` | blocked | Both axes found an accepted-contract gap: approval-only drift was not fingerprint-bound. Spec also found the frozen non-zero wording broader than the existing non-negative evidence schema; remediation uses positive exit codes. |
| `2026-08-30` | focused approval-fingerprint receipt and terminal lifecycle tests | passed | Receipt test passed in 18.063 s; terminal test passed while proving approval-only drift is rejected by active audit, review conclusion, finish, pre-archive CI, archived staged CI, and committed CI. |
| `2026-08-30` | `python scripts/test-happy-workflow-runtime.py` after review remediation | passed | 10/10 public-CLI scenarios passed in 178.242 s; existing successful behavior and candidate-drift diagnostics remain compatible. |
| `2026-08-30` | remediated `python scripts/workflow-check.py --applicable --record workflow-candidate-bound-accepted-gaps --staged --base dev` | passed | Candidate-bound run `b29088bb-8476-4097-82c9-10eaff0c3bee` passed 5/5 for candidate `95d2bdf5f2a4...`; runtime passed 10/10 in 175.527 s, followed by selective validation, validator 9/9, and strict audit. |
| `2026-08-30` | independent remediation Spec and Standards review of candidate `95d2bdf5f2a4...` | passed | Both axes independently verified candidate and diff fingerprints, approval-policy binding, positive-exit semantics, six-boundary tamper coverage, rollback, and complete scope; no findings or follow-up candidates. |
| `2026-08-30` | first `python scripts/workflow-ci.py --staged` pre-archive attempt | rejected as designed | The required multi-agent session summary had been added after candidate `95d2bdf5...` was checked/reviewed. CI detected both stale final-review and stale structured-check identities; receipts were explicitly reset for a fresh binding. |
| `2026-08-30` | final `python scripts/workflow-check.py --applicable --record workflow-candidate-bound-accepted-gaps --staged --base dev` | passed | Candidate-bound run `4520b728-c791-47a3-8355-f0fb7e86098e` passed 5/5 for finalized candidate `2c633f15176b...` on base `f97b5d73800b...`; runtime passed 10/10 in 169.951 s, validator passed 9/9, state-upgrade passed 2/2, and strict repository audit passed. |
| `2026-08-30` | fresh independent Spec and Standards review of candidate `2c633f15176b...` | blocked | Spec found that a receipt could bind a non-final run and that terminal review completion did not revalidate policy drift. Standards found that repeating a valid receipt after review cleared `finalReview` without resetting `gates.review`. |
| `2026-08-30` | three focused public-CLI second-remediation tests before implementation | failed as expected | 3/3 reproduced the review findings: the old run, repeated receipt, and tampered terminal review gate were all incorrectly accepted. |
| `2026-08-30` | three focused public-CLI second-remediation tests after implementation | passed | 3/3 passed in 103.694 s; each rejection occurs before workflow-state mutation. |
| `2026-08-30` | `python scripts/test-happy-workflow-runtime.py` after second review remediation | passed | Expanded public-CLI suite passed 12/12 in 218.644 s. |
| `2026-08-30` | selective validator, validator tests, state-upgrade tests, Python compile, and `git diff --check` | passed | Selective authority valid; validator 9/9; state upgrade 2/2; modified Python compiled; no whitespace errors. |
| `2026-08-30` | second-remediation `python scripts/workflow-check.py --applicable --record workflow-candidate-bound-accepted-gaps --staged --base dev` | passed | Candidate-bound run `a3b37f87-c47f-4e23-9a5e-f484a5031e97` passed 5/5 for frozen candidate `2588349a7fbd...` on base `f97b5d73800b...`; runtime passed 12/12 in 230.340 s, validator passed 9/9, state-upgrade passed 2/2, and strict repository audit passed. |
| `2026-08-30` | fresh independent Spec and Standards review of candidate `2588349a7fbd...` | passed | Both axes independently reconstructed the candidate and packaged diff `e5158b1618c1...`, verified the three lifecycle remediations plus all-success compatibility and terminal CI, and returned no actionable findings or follow-up candidates. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-30T08:45:50+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | f97b5d73800b; working tree `ec6ec2b93ed6` | 141 ms |
| 2026-08-30T08:48:42+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | f97b5d73800b; working tree `2b5438c618ec` | 171359 ms |
| 2026-08-30T08:48:43+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | f97b5d73800b; working tree `331b619ada69` | 110 ms |
| 2026-08-30T08:48:44+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | f97b5d73800b; working tree `d1b2cfa50acc` | 297 ms |
| 2026-08-30T08:48:45+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | f97b5d73800b; working tree `0e1844167bf4` | 297 ms |
| 2026-08-30T09:03:09+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | f97b5d73800b; working tree `7a6426afb31b` | 156 ms |
| 2026-08-30T09:06:06+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | f97b5d73800b; working tree `082d804bac9a` | 175687 ms |
| 2026-08-30T09:06:07+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | f97b5d73800b; working tree `97c4abe0ed8a` | 93 ms |
| 2026-08-30T09:06:08+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | f97b5d73800b; working tree `b03272b8ac52` | 265 ms |
| 2026-08-30T09:06:08+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | f97b5d73800b; working tree `91926931064e` | 187 ms |
| 2026-08-30T09:15:59+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | f97b5d73800b; working tree `1627fa9c86d6` | 125 ms |
| 2026-08-30T09:18:50+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | f97b5d73800b; working tree `0f35591d4350` | 170094 ms |
| 2026-08-30T09:18:51+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | f97b5d73800b; working tree `cd203925214e` | 109 ms |
| 2026-08-30T09:18:52+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | f97b5d73800b; working tree `0ff2363c7206` | 266 ms |
| 2026-08-30T09:18:52+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | f97b5d73800b; working tree `7b07818799f8` | 188 ms |
| 2026-08-30T09:38:56+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | f97b5d73800b; working tree `797f9ce4e6ea` | 172 ms |
| 2026-08-30T09:42:48+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | f97b5d73800b; working tree `ffd404a7cbb4` | 230500 ms |
| 2026-08-30T09:42:49+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | f97b5d73800b; working tree `a8342427b40b` | 94 ms |
| 2026-08-30T09:42:49+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | f97b5d73800b; working tree `5bd14641a548` | 250 ms |
| 2026-08-30T09:42:50+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | f97b5d73800b; working tree `9e7d288f28ee` | 203 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1-AC4 | verified | Public-CLI fixture binds exactly failed indexes 1 and 2 from a complete staged run and persists the versioned policy, approval, run, and candidate identity. |
| AC2-AC3, AC6 | verified | Runtime tests reject no indexes, no approval, duplicates, missing/extra/success indexes, worktree identity, tampered state, and generic gate bypass. |
| AC5, AC8 | verified | Existing fully successful receipt, review, rollback, staged CI, and committed CI scenarios remain green. |
| AC7 | verified | Accepted-gap fixture passes review, finish, pre-archive CI, archived staged CI, and committed CI; index-only and approval-only tamper fail across active and terminal consumers. |
| AC9 | verified | `.ai/project.json` and product/devtools paths are unchanged; candidate-bound workflow profile, diff check, strict audit, and independent whole-diff review pass. |

## Remaining gaps

- Pre-archive/archived staged CI, atomic commit, push, and prerequisite dev PR
  remain. No product or runtime implementation gap remains.
