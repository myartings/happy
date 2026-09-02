# Validation: `preserve-launch-pinned-codex-route`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-02` | `pnpm --filter happy-app exec vitest run sources/sync/messageMeta.test.ts` | RED as expected, then pass (30/30) | RED showed Sol/Medium replacing confirmed Luna/Max; GREEN covers the exact launch mirror, complete/partial evidence, and explicit picks |
| `2026-09-02` | `pnpm --filter happy exec vitest run src/codex/__tests__/remoteModeState.test.ts src/codex/codexRuntimeModelMetadata.test.ts src/daemon/controlServer.test.ts` | pass (32/32) | launch retention, independent explicit fields, atomic metadata, and daemon projection |
| `2026-09-02` | `pnpm --filter happy-app typecheck` | pass | TypeScript no-emit |
| `2026-09-02` | `pnpm --filter happy typecheck` | pass | TypeScript no-emit |
| `2026-09-02` | `python3 scripts/workflow-check.py --applicable --record preserve-launch-pinned-codex-route --staged --base refs/remotes/origin/dev` | historical accepted gaps: 7/9 commands passed; invalidated by review remediation | Run `e0d065c4-4780-4c3d-ab99-b3bfcc87f947`; user accepted indexes 2 and 5 on 2026-09-02 |
| `2026-09-02` | `pnpm --filter happy-app exec vitest run sources/encryption/blob.test.ts` | pass (9/9) | Isolated large-blob case passed in 1.8s after timing out only in the full parallel suite |
| `2026-09-02` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_committed_merge_auto_detects_second_parent_as_source` | reproduced candidate-external failure | Unchanged `origin/dev` workflow inputs; `core.autocrlf=true` makes recorded config bytes stale |
| `2026-09-02` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_pending_merge_accepts_lf_active_with_autocrlf_disabled` | pass | LF/autocrlf-disabled control passed in 41.3s |
| `2026-09-02` | `pnpm --filter happy-app exec vitest run sources/sync/messageMeta.test.ts` | remediation RED (7 malformed pairs), then pass (37/37) | Strict consumer validation now matches CLI authority rules |
| `2026-09-02` | `pnpm --filter happy exec vitest run src/codex/codexAppServerClient.test.ts src/codex/__tests__/remoteModeState.test.ts src/codex/codexRuntimeModelMetadata.test.ts src/daemon/controlServer.test.ts` | pass (68/68) | Candidate-bound first-message thread/turn/settings/projection fixture plus focused route suites |
| `2026-09-02` | `pnpm --filter happy-app typecheck` and `pnpm --filter happy typecheck` | pass | Post-remediation TypeScript no-emit |
| `2026-09-02` | `python3 scripts/workflow-check.py --applicable --record preserve-launch-pinned-codex-route --staged --base refs/remotes/origin/dev` | accepted gaps: 7/9 commands passed | Run `417d33d9-b69b-4166-9c92-922a397e31a2`; user acceptance bound to indexes 2 and 5 |
| `2026-09-02` | independent Spec review | pass | No actionable findings; AC1-AC8 and candidate-bound first-message through daemon projection evidence confirmed |
| `2026-09-02` | independent Standards review | pass | No blocking findings; malformed route evidence fails closed and rollback remains direct |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-02T05:43:20+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 03936270022b; working tree `f132b937302f` | 11161 ms |
| 2026-09-02T05:43:26+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 03936270022b; working tree `3293e64e97e2` | 6104 ms |
| 2026-09-02T05:44:25+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 03936270022b; working tree `bc5e77690cc1` | 58456 ms |
| 2026-09-02T05:44:35+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 03936270022b; working tree `a4a2e19fdcf6` | 9412 ms |
| 2026-09-02T05:44:36+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 03936270022b; working tree `f47effd722c6` | 174 ms |
| 2026-09-02T05:49:20+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 03936270022b; working tree `5b82b1b3304c` | 283744 ms |
| 2026-09-02T05:49:21+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `3ea05b2620b0` | 48 ms |
| 2026-09-02T05:49:21+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `435f6355bd6a` | 119 ms |
| 2026-09-02T05:49:22+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 03936270022b; working tree `5b0c889a7f38` | 117 ms |
| 2026-09-02T06:07:54+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 03936270022b; working tree `e6e2f82fe782` | 6215 ms |
| 2026-09-02T06:08:00+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 03936270022b; working tree `919487e81a37` | 5801 ms |
| 2026-09-02T06:08:27+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 03936270022b; working tree `9ab38f3ad312` | 26741 ms |
| 2026-09-02T06:08:34+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 03936270022b; working tree `fd9d0cca9824` | 5502 ms |
| 2026-09-02T06:08:34+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 03936270022b; working tree `6efeb303d880` | 123 ms |
| 2026-09-02T06:14:17+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 03936270022b; working tree `decedfa7049f` | 342064 ms |
| 2026-09-02T06:14:17+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `59dbb2f5c6b5` | 50 ms |
| 2026-09-02T06:14:18+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `b759f19b6a97` | 120 ms |
| 2026-09-02T06:14:18+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 03936270022b; working tree `dcf65c372dae` | 99 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Exact Luna/Max versus Sol/Medium fixture reasserts Session Luna and omits absent effort; empty per-session fixture omits both fields |
| AC2 | verified | Candidate-bound App Server fixture asserts actual `thread/start` and `turn/start` Luna/Max route from absent first-message overrides |
| AC3 | verified | Same fixture asserts start result and settings event both project Luna/Max through the production daemon projection helper |
| AC4 | verified | App explicit-model-only fixture |
| AC5 | verified | App explicit-effort-only fixture |
| AC6 | verified | App explicit-pair fixture with an existing confirmed route |
| AC7 | verified | App missing, partial, empty, sentinel, whitespace, invalid model, and invalid effort fixtures |
| AC8 | verified | fresh staged check completed; seven commands passed and the user explicitly accepted the two named candidate-external gaps for run `417d33d9-b69b-4166-9c92-922a397e31a2` |

## Remaining gaps

- Full App suite: 1938/1939 passed; unchanged large-blob encryption fixture
  timed out only under full parallel load and passed 9/9 in isolation.
- Workflow runtime suite: 35/38 passed; the three `core.autocrlf=true`
  merge/archive fixtures fail because raw checked-out configuration bytes make
  the bound fingerprint stale. Workflow inputs match `origin/dev`; an isolated
  failing case reproduced and the LF/autocrlf-disabled control passed.
- User explicitly accepted both candidate-external gaps on 2026-09-02 for fresh
  staged run `417d33d9-b69b-4166-9c92-922a397e31a2`; independent Spec and
  Standards re-review both passed against the unchanged candidate.
