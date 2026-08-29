# Validation: `workflow-template-2026-08-2-adoption`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | `git status --short --branch`; `workflow-state.py active`; branch/base inspection | passed | Clean `sharp-harbor`, no prior active workflow, `HEAD == dev == df1362e3e7bab34e3ff56ad1613eba22584137d4`. |
| `2026-08-30` | remote source/tag identity inspection | passed | `workflow-2026.08.2` resolves to `8d07a74931f8dcf6a668c2a6a4dcaf9c490a2842`; remote `main` is `53f280fa03c24874f639c64c2b881340016e3cd4`. |
| `2026-08-30` | upstream full-manifest dry-run against Happy | rejected as designed | 37 changed, 35 missing, 35 unchanged, 1 preserved; 73 updates include changed `AGENTS.md` and `.codex/config.toml`, proving full sync crosses Happy authority. |
| `2026-08-30` | candidate downstream validator compatibility probe | incompatible as expected | 31 errors include missing standardized surfaces and false failures on Happy custom skill metadata; use Happy-specific validation. |
| `2026-08-30` | `python3 scripts/validate-happy-workflow.py` | passed | Pre-migration selective baseline valid. |
| `2026-08-30` | `python3 scripts/test-workflow-core.py` | passed | Pre-migration portable baseline: 14/14. |
| `2026-08-30` | `python3 scripts/test-workflow-ci.py` | passed | Pre-migration workflow-CI baseline: 14/14. |
| `2026-08-30` | `python3 scripts/workflow-audit.py --strict` | passed | Pre-migration repository had no active workflow. |
| `2026-08-30` | `python3 scripts/test-validate-happy-workflow.py` (RED) | failed as expected | Four tests failed because the old validator exposed neither `adoption_errors` nor `project_config_errors`; this established the missing schema-2 and portable-config behavior. |
| `2026-08-30` | `python3 scripts/test-validate-happy-workflow.py` (GREEN) | passed | 4/4 focused manifest and project-configuration behaviors pass after the schema-2 validator/config slice. |
| `2026-08-30` | pinned source `sync-template.py` with Happy manifest (pre-apply dry-run) | passed | 71 updates: 36 changed, 32 missing, 3 fingerprint-approved retirements; 36 unchanged. Full classification recorded in `adoption-plan.md`. |
| `2026-08-30` | pinned source `sync-template.py ... --apply` | passed | Transactionally applied all 71 classified updates; the three legacy tests retired only after their exact fingerprints matched. |
| `2026-08-30` | immediate post-apply sync dry-run | blocked without mutation | Retirement preflight correctly rejected the three uncommitted Git deletions as not clean. Final zero-drift proof will use a clean synthetic candidate worktree without updating the branch ref. |
| `2026-08-30` | adopted strict active audit (diagnostic RED) | failed as expected | Old active schema contained retired `legacyImport` and lacked the newly required delivery-source metadata. |
| `2026-08-30` | adopted `workflow-state.py source ... local-only` probe | failed as expected | Official command requires planning/design and therefore cannot upgrade a task whose acceptance already passed under the old runtime. |
| `2026-08-30` | `python3 scripts/test-happy-workflow-state-upgrade.py` (RED) | failed as expected | Test could not load the not-yet-implemented Happy active-state upgrader. |
| `2026-08-30` | `python3 scripts/test-happy-workflow-state-upgrade.py` (GREEN/refinement) | passed | 1/1 transformation test proves source input immutability, preserved gates/history, retired-field removal, schema/layout metadata, and local-only source addition. |
| `2026-08-30` | `happy-workflow-state-upgrade.py workflow-template-2026-08-2-adoption ...` | passed | Active Workspace upgraded schema 1 -> 3; adopted runtime validation passed inside the transactional command. |
| `2026-08-30` | adopted strict active audit; `workflow-state.py validate`; `workflow-audit.py --all --strict` | passed | Active task is valid with only implementation/check/review/finish pending; repository workflow authority passes and archived history was not rewritten. |
| `2026-08-30` | malformed project command-group validator test (RED) | failed as expected | The new fixture exposed a `TypeError` instead of a bounded invalid-configuration result. |
| `2026-08-30` | `python3 scripts/test-validate-happy-workflow.py` (refined GREEN) | passed | 7/7 tests now cover accepted configuration, immutable-source mismatch, broad/relative adoption, malformed and non-portable commands, and missing workflow authority. |
| `2026-08-30` | malformed active-state history test (RED) | failed as expected | The upgrader rejected the input only through an incidental `AttributeError`, establishing the missing fail-closed diagnostic. |
| `2026-08-30` | `python3 scripts/test-happy-workflow-state-upgrade.py` (refined GREEN) | passed | 2/2 tests prove exact evidence preservation for valid input and non-mutating rejection of malformed history. |
| `2026-08-30` | preserved and blocked path diff/status inspection | passed | `.claude/`, Happy custom skills, product code, dependencies, product CI, devtools, and `docs/workspace/archive.md` remain unchanged. |
| `2026-08-30` | pinned source dry-run against a clean synthetic candidate worktree | passed | Every allowlisted entry was `unchanged`, all three retired tests were `retired-absent`, and the summary was `dry-run: 0 change(s) require update`; no branch ref was updated and the temporary worktree was removed. |
| `2026-08-30` | immutable candidate-base inspection | passed | The shared `dev` ref moved during the session; final candidate binding therefore uses the recorded starting commit `df1362e3e7bab34e3ff56ad1613eba22584137d4`, preventing unrelated baseline drift from entering check or review scope. |
| `2026-08-30` | `workflow-check.py --applicable --list --staged ...` (selection RED) | failed acceptance as expected | The selector fell back to `full` because retired workflow-test paths were uncovered and `.codex/README.md` plus `docs/workflow.md` conflicted with the ordinary-documentation rule. |
| `2026-08-30` | workflow-profile selection fixture (RED then GREEN) | passed | The focused test failed with `('full',)` before the path-rule correction; 8/8 validator/integration tests now pass and the complete staged candidate selects only the `workflow` profile. |
| `2026-08-30` | final pinned-source dry-run after project-config reconciliation | passed | A fresh unreferenced clean snapshot again reported all three retirements absent and `dry-run: 0 change(s) require update`; `git for-each-ref --contains` found no reference to the synthetic commit. |
| `2026-08-30` | independent Spec review, candidate `6d3d9b4812d5...` | accepted | No missing or incorrect accepted requirement, out-of-contract scope, candidate regression, or binding-authority violation found. |
| `2026-08-30` | independent Standards review plus one unchanged-candidate ADR 0004 follow-up | accepted | The initial lifecycle-evidence concern was withdrawn: review/check bind engineering bytes, while `completionEvidence` and staged CI bind the complete pre-archive Workspace and reject noncanonical post-review drift. No actionable finding remains. |
| `2026-08-30` | required structured review-coordination session summary | recorded | Because the new session file and index row are delivery bytes, the accepted `6d3d9b4812d5...` review is retained as historical evidence and a fresh staged check/review pair is required. |
| `2026-08-30` | final `workflow-check.py --applicable --record ... --staged --base df1362e3...` | passed | Fresh candidate `e72a8653de1f...` selects the workflow profile; 4/4 commands passed with 2 state-upgrade tests, selective validation, 8 validator/integration tests, and strict all audit. |
| `2026-08-30` | final independent Spec review, candidate `e72a8653de1f...` | accepted | No frozen-contract gap, regression, binding-authority violation, or out-of-contract addition found. |
| `2026-08-30` | final independent Standards review, candidate `e72a8653de1f...` | blocked | One AC7 gap: the Happy validator did not reject drift in tracker provider/categories/states, generated paths, risk triggers, or the exact protected-path contract. |
| `2026-08-30` | preserved-authority mutation fixture (RED) | failed as expected | Drifted tracker provider/categories/states, an extra protected path, empty generated paths, and empty risk triggers produced no validator errors. |
| `2026-08-30` | `python3 scripts/test-validate-happy-workflow.py` (remediation GREEN) | passed | 9/9; exact tracker, protected path, generated path, and risk-trigger preservation is now enforced and covered by a focused negative fixture. |
| `2026-08-30` | post-remediation pinned-source dry-run on clean synthetic candidate | passed | All allowlisted upstream entries remain unchanged, all three retirements remain absent, the summary is `dry-run: 0 change(s) require update`, and no ref points to the temporary snapshot. |
| `2026-08-30` | remediated independent Spec review, candidate `4ee15224da80...` | accepted | Exact preserved-authority comparisons satisfy AC7; no missing requirement or out-of-contract addition found. |
| `2026-08-30` | remediated independent Standards review, candidate `4ee15224da80...` | blocked | Exact tracker comparison is correct, but focused negative coverage did not independently mutate `tracker.target`; split preserved-authority mutations into isolated subtests. |
| `2026-08-30` | isolated preserved-authority mutation coverage | passed | Seven independent subtests now mutate tracker provider, target, categories, and states plus protected paths, generated paths, and risk triggers; the suite remains 9/9. |
| `2026-08-30` | final fresh staged check, candidate `3dd4727cedd7...` | passed | Workflow profile selected; 4/4 configured commands passed and no forbidden product/devtools/product-CI path entered the 94-path candidate. |
| `2026-08-30` | final independent Spec review, candidate `3dd4727cedd7...` | accepted | No missing/incorrect requirement, regression, binding-authority violation, out-of-contract addition, or follow-up candidate found. |
| `2026-08-30` | final independent Standards review, candidate `3dd4727cedd7...` | accepted | AC7 exact comparisons and seven isolated mutations are complete; Python parses cleanly; no correctness, maintainability, rollback, test-quality, or ADR 0004 finding remains. |
| `2026-08-30` | first clean detached finish projection staged-CI probe | rejected safely | The detached worktree rewrote the ACTIVE branch field after completion binding, so staged CI rejected the mismatch; the real worktree was untouched. |
| `2026-08-30` | normalized clean detached finish projection; `python3 scripts/workflow-ci.py --staged` | passed | The exact base `df1362e3...` and engineering candidate `3dd4727cedd7...` passed pre-archive staged CI after the detached ACTIVE projection was made stable across the finish gate. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-29T18:42:13+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | df1362e3e7ba; working tree `be5859ae4481` | 123 ms |
| 2026-08-29T18:42:14+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | df1362e3e7ba; working tree `5837ade684d7` | 76 ms |
| 2026-08-29T18:42:14+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | df1362e3e7ba; working tree `7ef68d660955` | 234 ms |
| 2026-08-29T18:42:15+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | df1362e3e7ba; working tree `16b5f723ba1c` | 161 ms |
| 2026-08-29T18:50:34+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | df1362e3e7ba; working tree `93792492500f` | 62 ms |
| 2026-08-29T18:50:34+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | df1362e3e7ba; working tree `0aa153698383` | 40 ms |
| 2026-08-29T18:50:34+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | df1362e3e7ba; working tree `d4ecd852de01` | 83 ms |
| 2026-08-29T18:50:35+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | df1362e3e7ba; working tree `b04ca2b929d3` | 88 ms |
| 2026-08-29T18:56:11+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | df1362e3e7ba; working tree `7b4464cfe34c` | 37 ms |
| 2026-08-29T18:56:12+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | df1362e3e7ba; working tree `108c29b7d381` | 21 ms |
| 2026-08-29T18:56:12+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | df1362e3e7ba; working tree `50656f44b562` | 49 ms |
| 2026-08-29T18:56:12+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | df1362e3e7ba; working tree `070ce93dc33d` | 49 ms |
| 2026-08-29T19:00:11+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | df1362e3e7ba; working tree `24228f7c358b` | 40 ms |
| 2026-08-29T19:00:11+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | df1362e3e7ba; working tree `f02b1ff975ff` | 23 ms |
| 2026-08-29T19:00:11+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | df1362e3e7ba; working tree `dff73e6b6619` | 51 ms |
| 2026-08-29T19:00:12+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | df1362e3e7ba; working tree `bc606ec77063` | 50 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Release tag, immutable commit, detached applying checkout, and source cleanliness captured. |
| AC2 | verified | Schema-2 manifest validation, explicit allowlist, preserves, required checks, and fingerprinted retirements pass. |
| AC3 | verified | Pre-apply classification, transactional apply, and clean-candidate pinned-source zero-drift dry-run are captured. |
| AC4-AC5 | verified | Happy authority translations are present; preserved and blocked path inspection is empty. |
| AC6-AC8 | verified | Portable profiles and review selection validate; 9 validator/integration tests and 2 state-upgrade tests pass; fingerprinted legacy tests are retired. |
| AC9 | verified | Active schema-3 bridge, strict active audit, and strict repository audit pass without historical rewrites. |
| AC10 | verified | Final candidate-bound 4/4 checks, strict audit, diff checks, independent Spec/Standards review, and a clean detached exact-candidate pre-archive staged workflow CI proof pass for candidate `3dd4727cedd7...`. |
| AC11 | verified | Negative diff/status inspection finds no application, dependency, product CI, devtools, protocol, release, or generated changes; terminal Workspace/archive projection is reserved for the finish protocol. |

## Remaining gaps

- The real finish/archive projection and its mandatory pre-archive plus combined
  staged-CI guards remain as terminal protocol operations.
