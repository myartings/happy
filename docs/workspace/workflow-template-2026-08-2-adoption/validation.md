# Validation: `workflow-template-2026-08-2-adoption`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | latest `origin/dev`, branch, PR #63, and conflict inspection | passed | Clean isolated branch `feature/workflow-template-2026-08-2-adoption-v2` starts exactly at `origin/dev@a269068ab42316a6e5749882cd81499aeb31fabb`; PR #63 is conflicting because its archived delivery was bound to stale base `f23b9d75...`. |
| `2026-08-30` | pinned source identity and cleanliness | passed | Clean detached checkout resolves `workflow-2026.08.2` to `8d07a74931f8dcf6a668c2a6a4dcaf9c490a2842`. |
| `2026-08-30` | pinned full-manifest dry-run | rejected as designed | Reports 73 updates including forbidden Happy-owned root and template-maintainer surfaces; the repository rule forbids applying it. |
| `2026-08-30` | pinned selective-manifest pre-apply dry-run | passed | Reports 72 classified updates: 36 changed, 32 missing, three fingerprint-approved retirements, and one required-check merge. |
| `2026-08-30` | pinned selective synchronizer `--apply` | passed | Transactionally applied all 72 classified updates; no project, product, devtools, CI, dependency, or frozen `.claude/` path entered synchronization scope. |
| `2026-08-30` | `happy-workflow-state-upgrade.py workflow-template-2026-08-2-adoption ...` | passed | Fresh schema-1 task upgraded to schema 3 while preserving planning gates/history and recording the user-approved local-only replacement-PR source. |
| `2026-08-30` | 82 nonterminal migration paths versus reviewed commit `8395d421...` | passed | Every accepted implementation/durable-contract path matches the previously reviewed migration bytes exactly; all base-bound Workspace and terminal evidence is freshly generated. |
| `2026-08-30` | `python3 scripts/test-happy-workflow-state-upgrade.py` | passed | 2/2 tests pass. |
| `2026-08-30` | `python3 scripts/validate-happy-workflow.py` | passed | Happy selective authority validates at `workflow-2026.08.2@8d07a74931f8`. |
| `2026-08-30` | `python3 scripts/test-validate-happy-workflow.py` | passed | 9/9 validator and integration tests pass. |
| `2026-08-30` | Standards review of candidate `49bec7...` | blocked, remediated | Spec review accepted; Standards review required isolation from all non-evidence worktree/index divergence and bounded behavior-focused public-CLI coverage. |
| `2026-08-30` | `python3 scripts/test-happy-workflow-runtime.py` | passed | TDD remediation reached GREEN with 6/6 public-CLI tests covering state transitions, staged isolation rejection/exception behavior, review binding, archive rollback, and archived staged/committed CI. |
| `2026-08-30` | protected/product path diff against `origin/dev` | passed | Application/server code, dependencies, product CI, `devtools/`, `.claude/`, generated paths, and Happy custom skills have an empty diff. |
| `2026-08-30` | pinned source dry-run against clean synthetic candidate `c61763c...` | passed | The remediated candidate leaves every allowlisted entry unchanged, all three retirements absent, and reports `dry-run: 0 change(s) require update`; no ref contains the synthetic commit and its temporary worktree was removed. |
| `2026-08-30` | candidate-bound `workflow-check.py --applicable --record ... --staged --base origin/dev` | passed | Run `76abe5b1-3648-412a-8015-f596caba735d` passed 5/5 commands for staged candidate `13ac86b1...` on base `a269068a...`. |
| `2026-08-30` | independent frozen-candidate Spec and Standards review | passed | Both axes accepted candidate `13ac86b1...`; Standards explicitly confirmed remediation of all-path staged isolation and six-test public-CLI runtime coverage. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-30T06:43:12+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | a269068ab423; working tree `fdafb3409ead` | 48 ms |
| 2026-08-30T06:43:12+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | a269068ab423; working tree `42e3c713f736` | 28 ms |
| 2026-08-30T06:43:12+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | a269068ab423; working tree `054707c89eb3` | 55 ms |
| 2026-08-30T06:43:12+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | a269068ab423; working tree `09c9c603d5ec` | 55 ms |
| 2026-08-30T07:03:48+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | a269068ab423; working tree `ab68078c8927` | 39 ms |
| 2026-08-30T07:04:12+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | a269068ab423; working tree `9266eeeb9719` | 23953 ms |
| 2026-08-30T07:04:12+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | a269068ab423; working tree `c619125a3569` | 28 ms |
| 2026-08-30T07:04:13+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | a269068ab423; working tree `129c0fe7fe39` | 63 ms |
| 2026-08-30T07:04:13+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | a269068ab423; working tree `ff5a5ff9b74d` | 60 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Exact source release/commit and clean detached checkout captured. |
| AC2 | verified | Schema-2 manifest, explicit allowlist/preserves, required checks, and fingerprinted retirements pass. |
| AC3 | verified | Pre-apply classification, transactional apply, and clean-candidate zero-drift proof pass. |
| AC4-AC5 | verified | All 82 accepted nonterminal bytes match and preserved/blocked path inspection is empty. |
| AC6-AC8 | verified | Portable profiles and preserved authority validate; 9 validator/integration tests, 2 state-upgrade tests, and 6 public-CLI runtime tests pass. |
| AC9 | verified | Fresh active Workspace upgrades to schema 3 and strict active audit passes without historical rewrites. |
| AC10 | verified | Candidate-bound 5/5 checks and independent Spec/Standards review pass; the guarded finish sequence requires pre-archive and combined archived staged CI before delivery. |
| AC11 | verified | No application, server, dependency, product CI, devtools, protocol, release, or generated changes are present. |

## Remaining gaps

- Terminal pre-archive and combined archived staged CI, delivery commit, normal
  push, replacement PR, closure of superseded PR #63, and normal merge of the
  replacement PR.
