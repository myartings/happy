# Validation: `fork-upstream-issue-routing`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_issue_route_supports_explicit_fork_and_upstream_remotes` | RED (exit 1) | Intended failure: CLI rejects the new `--issue-remote` and `--publication-remote` arguments before planning |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_issue_route_supports_explicit_fork_and_upstream_remotes` | GREEN (exit 0) | Explicit upstream Issue/base plus origin publication route is ready, auditable, and leaves fixture Git identity unchanged |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_issue_route_detects_divergent_branch_for_slash_named_remote` | RED (exit 1) | Intended safety failure: existing first-component parsing missed a divergent canonical branch beneath slash-named publication remote |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_issue_route_detects_divergent_branch_for_slash_named_remote` | GREEN (exit 0) | Longest configured remote-name attribution now detects the divergent publication branch |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py -k issue_route` | pass (exit 0) | 11 focused route tests passed in 36.297s |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py -k issue_route` | pass (exit 0) | Final focused set: 12 route tests passed in 35.875s after mixed-fetch coverage and docs alignment |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py -k issue_route` | pass (exit 0) | 12 route tests passed in 35.312s after fail-closed Git inspection refinement |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py` | pass (exit 0) | Complete nearest workflow runtime suite: 26 tests passed in 379.976s |
| `2026-08-31` | `python3 scripts/workflow-issue-route.py --repo-root . --session-root . --issue-url 'https://github.com/slopus/happy/issues/1654' --issue-title '[Bug]: Daemon-spawned sessions can falsely replace a healthy daemon after a 2s control health timeout' --base-ref refs/remotes/upstream/main --base-kind target --issue-remote upstream --publication-remote origin --isolation default` | pass (exit 0) | Live local observation returned `ready/create-from-verified-base`, verified `b824cd0a...`, recorded upstream/origin roles, `mutationPerformed=false`, and preserved `manual-start-required` |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record fork-upstream-issue-routing --staged --base 60162822bb3fa24488e6679b2419ee0fac54c634` | fail (exit 1) | Selector fell back to `full`: 6 commands passed; unrelated unchanged product scope failed App typecheck, App tests, and Server tests |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --list --staged --base 60162822bb3fa24488e6679b2419ee0fac54c634` | diagnostic pass (exit 0) | Confirmed the first candidate selected `full` |
| `2026-08-31` | selector ownership report for the staged path set | diagnostic pass (exit 0) | `docs/PRD.md` was the sole unmatched path; every other candidate path was owned and triggered by `workflow-infrastructure` |
| `2026-08-31` | selector probe excluding only `docs/PRD.md` | diagnostic pass (exit 0) | Predicted exact profile `workflow` for the remaining 15 candidate paths |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --list --staged --base 60162822bb3fa24488e6679b2419ee0fac54c634` | pass (exit 0) | Corrected candidate selects exactly `workflow`: five workflow-infrastructure commands and no App/Server product commands |
| `2026-08-31` | two focused repository-path and stale-slash-ref boundary tests | RED (exit 1) | Planner incorrectly returned `ready` for a nested GitHub path and for a stale slash-remote canonical ref hidden by a live prefix remote |
| `2026-08-31` | two focused repository-path and stale-slash-ref boundary tests | GREEN (exit 0) | Exact `owner/repository` parsing and conservative canonical-suffix collision handling block both ambiguous identities |
| `2026-08-31` | `python3 -m py_compile scripts/workflow-issue-route.py scripts/test-happy-workflow-runtime.py` | pass (exit 0) | Updated planner and runtime tests compile |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py -k issue_route` | pass (exit 0) | Final focused set: 14 route tests passed in 48.202s |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record fork-upstream-issue-routing --staged --base 60162822bb3fa24488e6679b2419ee0fac54c634` | pass (exit 0) | Final candidate `043ab4ed…`: exact `workflow` profile, 5 commands, 0 failures; complete runtime suite passed 28 tests in 460.702s |
| `2026-08-31` | independent Spec review of candidate `043ab4ed…` | accepted | AC1–AC8 satisfied; no actionable findings or follow-ups |
| `2026-08-31` | independent Standards review of candidate `043ab4ed…` | blocked | High: overlapping configured names such as `personal` and `personal/fork` make target and publication tracking refs ambiguously attributable |
| `2026-08-31` | two overlapping-remote target/publication tests | fixture correction | `git remote add` rejects prefix overlap, so the fixture uses low-level remote config to reproduce a possible manual/legacy repository state |
| `2026-08-31` | two overlapping-remote target/publication tests | RED (exit 1) | Planner returned `ready` for both ambiguous ref identities before remediation |
| `2026-08-31` | two overlapping-remote target/publication tests | GREEN (exit 0) | Target base and reusable expected publication ref now require exactly one configured remote-prefix attribution matching the selected role |
| `2026-08-31` | `python3 -m py_compile scripts/workflow-issue-route.py scripts/test-happy-workflow-runtime.py` | pass (exit 0) | Remediated planner and tests compile |
| `2026-08-31` | `python3 scripts/test-happy-workflow-runtime.py -k issue_route` | pass (exit 0) | Remediated focused set: 16 route tests passed in 56.802s |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record fork-upstream-issue-routing --staged --base 60162822bb3fa24488e6679b2419ee0fac54c634` | pass (exit 0) | Remediated candidate `cc847aef…`: exact `workflow` profile, 5 commands, 0 failures; complete runtime suite passed 30 tests in 424.624s |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record fork-upstream-issue-routing --staged --base 60162822bb3fa24488e6679b2419ee0fac54c634` | pass (exit 0) | Terminal candidate `422e76f7…` including the required session summary: exact `workflow` profile, 5 commands, 0 failures; complete runtime suite passed 30 tests in 423.917s |
| `2026-08-31` | final independent Spec review of candidate `422e76f7…` / diff `959df70b…` | accepted | AC1–AC8, scope, overlap remediation, and structured session evidence accepted; no findings or follow-ups |
| `2026-08-31` | final independent Standards review of candidate `422e76f7…` / diff `959df70b…` | accepted gaps | No blocking finding or regression; one Low positive slash-remote reuse test-hardening follow-up |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-30T16:30:40+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | failed (2) | 2 | 60162822bb3f; working tree `927b87c719a9` | 24219 ms |
| 2026-08-30T16:30:48+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 60162822bb3f; working tree `60e32a2a6d54` | 6985 ms |
| 2026-08-30T16:31:04+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 60162822bb3f; working tree `b49139e7f855` | 15500 ms |
| 2026-08-30T16:31:09+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 60162822bb3f; working tree `210bd33522a7` | 4375 ms |
| 2026-08-30T16:31:10+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 60162822bb3f; working tree `e9d0bdf8fc9f` | 156 ms |
| 2026-08-30T16:38:01+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 60162822bb3f; working tree `2bfbca8a8601` | 408843 ms |
| 2026-08-30T16:38:02+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `011a02fc1446` | 125 ms |
| 2026-08-30T16:38:03+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `b464393f9819` | 406 ms |
| 2026-08-30T16:38:04+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 60162822bb3f; working tree `a6e0c035fbd0` | 188 ms |
| 2026-08-30T16:43:09+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 60162822bb3f; working tree `b91c41e2a8ad` | 172 ms |
| 2026-08-30T16:50:00+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 60162822bb3f; working tree `ff03b43ea863` | 410109 ms |
| 2026-08-30T16:50:01+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `5a872bbe808f` | 110 ms |
| 2026-08-30T16:50:02+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `dfa781beb842` | 328 ms |
| 2026-08-30T16:50:03+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 60162822bb3f; working tree `351482ad0f02` | 188 ms |
| 2026-08-30T16:56:16+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 60162822bb3f; working tree `63de431ab620` | 141 ms |
| 2026-08-30T17:03:57+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 60162822bb3f; working tree `4669a7f2f465` | 460859 ms |
| 2026-08-30T17:03:59+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `897c4123a163` | 266 ms |
| 2026-08-30T17:04:00+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `6f1b0e4ee11b` | 359 ms |
| 2026-08-30T17:04:01+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 60162822bb3f; working tree `fb9293b85d66` | 203 ms |
| 2026-08-30T17:13:33+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 60162822bb3f; working tree `a142db2632bd` | 218 ms |
| 2026-08-30T17:20:38+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 60162822bb3f; working tree `d53765369c22` | 424828 ms |
| 2026-08-30T17:20:39+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `4dc4514d4d45` | 125 ms |
| 2026-08-30T17:20:41+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `d2edaaf866c1` | 328 ms |
| 2026-08-30T17:20:42+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 60162822bb3f; working tree `708528b2c548` | 188 ms |
| 2026-08-30T17:24:11+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 60162822bb3f; working tree `372604622ae8` | 219 ms |
| 2026-08-30T17:31:16+00:00 | workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 60162822bb3f; working tree `4651253b786e` | 424094 ms |
| 2026-08-30T17:31:17+00:00 | workflow / workflow-targeted | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `b0203c2d86e6` | 109 ms |
| 2026-08-30T17:31:18+00:00 | workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 60162822bb3f; working tree `af6329fca4a1` | 281 ms |
| 2026-08-30T17:31:18+00:00 | workflow / workflow-targeted | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 60162822bb3f; working tree `9ea86dc327dd` | 188 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | `test_issue_route_defaults_both_remote_roles_to_origin` |
| AC2 | verified | `test_issue_route_supports_explicit_fork_and_upstream_remotes`; live #1654 read-only observation |
| AC3 | verified | mismatched, mixed-fetch, missing, and invalid Issue-remote tests |
| AC4 | verified | wrong-remote and overlapping slash-remote target-base tests |
| AC5 | verified | inconsistent, missing, non-GitHub, and nested-path publication-remote tests |
| AC6 | verified | matching publication reuse, cross-remote collision, divergent publication branch, slash-named remote, stale-ref ambiguity, and overlapping-name publication tests |
| AC7 | verified | explicit role and launch-capsule assertions in the fork/upstream route test |
| AC8 | verified | before/after ref, worktree, HEAD, and branch snapshots in every planner route test; only the reuse fixture explicitly consumes `gitAction` inside its temporary repository |

## Remaining gaps

- The planner intentionally cannot prove GitHub fork ancestry without a network
  contract; explicit local identities and external-write authorization remain
  the accepted boundary.
- The accepted Standards gap is a Low positive test-hardening case for
  successful unambiguous slash-publication reuse; it is not a current
  regression or frozen-AC gap.
- The first over-broad `full` run exposed pre-existing failures in unchanged App
  and Server files. They are excluded from this Slice after removing the
  candidate-introduced product PRD scope; no product fix was absorbed.
