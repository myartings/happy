# Validation: `workflow-template-2026-08-2-adoption`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | branch/remotes/status inspection | passed | Clean isolated branch `feature/workflow-template-2026-08-2-adoption` created without tracking from exact `origin/dev@f23b9d756d3e3c20b9c41392102c4728b4ab8e15`; published backup `origin/sharp-harbor@5ee0818e...` remains unchanged. |
| `2026-08-30` | direct `sharp-harbor -> origin/dev` PR simulation | rejected as designed | Branch was 2 ahead/2 behind, included the independent TestFlight delivery, conflicted in `docs/workspace/archive.md`, and `workflow-ci.py --base origin/dev` rejected two new archive rows. D10 therefore requires an isolated rebuild. |
| `2026-08-30` | pinned source identity inspection | passed | Clean detached source checkout resolves tag `workflow-2026.08.2` to `8d07a74931f8dcf6a668c2a6a4dcaf9c490a2842`. |
| `2026-08-30` | pinned source `sync-template.py` pre-apply dry-run | passed | 36 changed, 32 missing, 3 fingerprint-approved retirements, 35 unchanged, and one required-check merge; 72 updates stay inside the selective manifest. |
| `2026-08-30` | pinned source `sync-template.py --apply` | passed | Transactionally applied all 72 classified updates; no project, product, devtools, CI, dependency, or frozen `.claude/` path entered the synchronization scope. |
| `2026-08-30` | `happy-workflow-state-upgrade.py workflow-template-2026-08-2-adoption ...` | passed | Fresh schema-1 task upgraded to schema 3 while preserving all planning gates/history and recording the user-approved local-only PR rebuild source. |
| `2026-08-30` | `python3 scripts/test-happy-workflow-state-upgrade.py` | passed | 2/2 tests pass. |
| `2026-08-30` | `python3 scripts/validate-happy-workflow.py` | passed | Happy selective authority validates at `workflow-2026.08.2@8d07a74931f8`. |
| `2026-08-30` | `python3 scripts/test-validate-happy-workflow.py` | passed | 9/9 validator and integration tests pass, including seven isolated preserved-authority mutations. |
| `2026-08-30` | `python3 scripts/workflow-audit.py --all --strict`; `git diff --check` | passed | Repository authority and the active schema-3 Workspace validate; no whitespace error exists. |
| `2026-08-30` | staged nonterminal migration surface versus reviewed `5ee0818e...` | passed | All 82 nonterminal migration paths match the previously accepted migration bytes exactly; old ACTIVE/archive/Workspace terminal evidence is explicitly excluded and regenerated. |
| `2026-08-30` | protected/product path diff against `origin/dev` | passed | `.claude/`, product code, dependencies, product CI, devtools, generated paths, and Happy custom skills have an empty diff. |
| `2026-08-30` | pinned source dry-run against clean synthetic candidate `deb8e003...` | passed | Every allowlisted entry is unchanged, all three retirements are absent, and the summary is `dry-run: 0 change(s) require update`; no ref contains the synthetic commit and its temporary worktree was removed. |
| `2026-08-30` | final candidate-bound applicable check, candidate `6a3a95a19590...` | passed | Workflow profile selected against immutable base `f23b9d75...`; all 4 configured commands passed. |
| `2026-08-30` | independent capable Spec review, candidate `6a3a95a19590...` | accepted | No missing or incorrect accepted requirement, regression, binding-authority violation, out-of-contract addition, or follow-up candidate found. |
| `2026-08-30` | independent capable Standards review, candidate `6a3a95a19590...` | accepted | No correctness, architecture, maintainability, security, operations, rollback, behavior-test, or follow-up finding found. |
| `2026-08-30` | detached exact staged finish projection from `origin/dev@f23b9d75...` | passed | Finish gate and `python3 scripts/workflow-ci.py --staged` both pass against the complete staged candidate; the temporary detached worktree was removed and no reference remains. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-29T19:52:57+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | f23b9d756d3e; working tree `3b72b6369e87` | 78 ms |
| 2026-08-29T19:52:57+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | f23b9d756d3e; working tree `a6d8c942d47a` | 49 ms |
| 2026-08-29T19:52:57+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | f23b9d756d3e; working tree `d094fa422535` | 112 ms |
| 2026-08-29T19:52:57+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | f23b9d756d3e; working tree `93d77268299c` | 111 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Exact source release/commit and clean detached checkout captured. |
| AC2 | verified | Schema-2 manifest, explicit allowlist/preserves, required checks, and fingerprinted retirements pass. |
| AC3 | verified | Pre-apply classification, transactional apply, and clean-candidate post-reconciliation zero-drift proof pass. |
| AC4-AC5 | verified | Reviewed nonterminal migration bytes match exactly and preserved/blocked path inspection is empty. |
| AC6-AC8 | verified | Portable profiles and exact preserved authority validate; 9 validator/integration tests and 2 state-upgrade tests pass; legacy tests are fingerprint-retired. |
| AC9 | verified | Fresh active Workspace upgrades to schema 3 and strict repository audit passes without historical rewrites. |
| AC10 | verified | Candidate-bound 4/4 checks, selective validation, strict audit, diff checks, and independent Spec/Standards review pass for candidate `6a3a95a19590...`; the exact detached pre-archive staged projection passes workflow CI. |
| AC11 | verified | Bounded diff inspection finds no application, server, dependency, product CI, devtools, protocol, release, or generated changes. |

## Remaining gaps

- No acceptance gap remains. Terminal finish/archive evidence, the delivery
  commit, normal push, and authorized PR creation are the remaining delivery
  operations.
