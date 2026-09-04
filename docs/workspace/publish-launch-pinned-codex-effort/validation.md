# Validation: `publish-launch-pinned-codex-effort`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-02` | `pnpm --filter happy exec vitest run src/codex/codexAppServerClient.test.ts -t "pins launch effort in thread configuration without starting a turn"` | RED then pass (1/1) | RED proved `thread/start.config` omitted `model_reasoning_effort`; GREEN also proves no `turn/start` |
| `2026-09-02` | `pnpm --filter happy exec vitest run src/codex/startFreshThread.test.ts` | RED then pass (3/3) | Fresh orchestration publishes only a complete confirmed pair to Session and daemon, awaits projection, and rejects incomplete evidence |
| `2026-09-02` | `pnpm --filter happy exec vitest run src/codex/codexRuntimeModelMetadata.test.ts` | RED then pass (20/20) | Pending launch state is non-authoritative and clears atomically on complete App Server evidence |
| `2026-09-02` | `pnpm --filter happy-app exec vitest run sources/sync/codexEffectiveRoute.test.ts sources/sync/messageMeta.test.ts` | RED then pass (42/42) | Pre-message UI resolves Luna/Max after confirmation; pending state neither displays nor sends global Medium |
| `2026-09-02` | `pnpm --filter happy exec vitest run src/codex/startFreshThread.test.ts src/codex/codexAppServerClient.test.ts src/codex/codexRuntimeModelMetadata.test.ts src/codex/__tests__/remoteModeState.test.ts src/daemon/controlServer.test.ts` | pass (73/73) | Candidate-bound App Server configuration, no-turn thread, Session/daemon projection, sticky route, and fail-closed coverage |
| `2026-09-02` | `pnpm --filter happy typecheck` | pass | CLI TypeScript no-emit |
| `2026-09-02` | `pnpm --filter happy-app typecheck` | pass | App TypeScript no-emit |
| `2026-09-02` | `pnpm --filter happy test` | pass (1011/1011) | Complete Happy CLI unit suite |
| `2026-09-02` | `git diff --check` | pass | No whitespace errors |
| `2026-09-02` | `python3 scripts/workflow-check.py --applicable --record publish-launch-pinned-codex-effort --staged --base refs/remotes/origin/dev` | accepted gap: 8/9 commands passed | Run `134189d0-012e-4629-b2c1-d9eb02e66e55`; index 5 has only the three unchanged `core.autocrlf=true` workflow fixtures |
| `2026-09-02` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_committed_merge_auto_detects_second_parent_as_source` | reproduced candidate-external failure | Workflow inputs match `origin/dev`; fixture sets `core.autocrlf=true` and reports stale bound configuration |
| `2026-09-02` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_pending_merge_accepts_lf_active_with_autocrlf_disabled` | pass | LF / `core.autocrlf=false` control passed |
| `2026-09-02` | first independent Spec/Standards review of candidate `4af94b90…` | blocked, remediated | Review found a pending-display fallback leak, insufficient cold-path composition evidence, fire-and-forget Session metadata, a pre-message route race, and swallowed daemon rejection |
| `2026-09-02` | `pnpm --filter happy exec vitest run --project unit src/codex/startFreshThread.test.ts src/codex/codexLaunchInitialization.test.ts src/api/apiSession.test.ts` | RED then pass (64/64) | Production cold-start seam creates at most one fresh thread, holds pre-arriving messages through durable Session/daemon publication, preserves the first explicit override, and propagates metadata/daemon rejection |
| `2026-09-02` | `pnpm --filter happy-app exec vitest run sources/sync/codexEffectiveRoute.test.ts sources/sync/messageMeta.test.ts` | RED then pass (42/42) | SessionView's production candidate selector preserves explicit pending `null` instead of falling through to global Medium |
| `2026-09-02` | `pnpm --filter happy typecheck && pnpm --filter happy-app typecheck` | pass | Review-remediated CLI and App TypeScript no-emit |
| `2026-09-02` | `pnpm --filter happy test` | pass (1021/1021) | Complete CLI suite after review remediation |
| `2026-09-02` | `pnpm --filter happy-app test` | pass (1951/1951) | Complete App suite after pending-display remediation |
| `2026-09-02` | `python3 scripts/workflow-check.py --applicable --record publish-launch-pinned-codex-effort --staged --base refs/remotes/origin/dev` | accepted gap: 8/9 commands passed | Fresh run `bb53ef8f-7edd-4a0c-9327-b9af5511f620`, candidate `c82e6190…`; index 5 reproduced only the same three accepted baseline failures |
| `2026-09-02` | second independent Spec/Standards review of candidate `c82e6190…` | blocked, remediation in progress | Spec required actual exported `runCodex()` cold-path evidence; Standards found permanent metadata refusal trapped inside unbounded retry |
| `2026-09-02` | `pnpm --filter happy exec vitest run --project unit src/codex/runCodex.launch.test.ts src/api/apiSession.test.ts` | RED then pass (55/55) | Actual `runCodex()` harness proves Luna/Max launch input, zero pre-publication turns, awaited Session then daemon publication, one-thread Terra/High first-turn reuse; terminal metadata refusal exits after one attempt |
| `2026-09-02` | `pnpm --filter happy test` | pass (1022/1022) | Complete CLI suite after second-review remediation, including the actual `runCodex()` harness |
| `2026-09-02` | `python3 scripts/workflow-check.py --applicable --record publish-launch-pinned-codex-effort --staged --base refs/remotes/origin/dev` | accepted gap: 8/9 commands passed | Run `557f1dca-49c1-49b6-b336-7f9a10ee35a8`, candidate `e3277565…`; only the same three accepted index-5 baseline failures recurred |
| `2026-09-02` | third independent Spec/Standards review of candidate `e3277565…` | Spec accepted; Standards blocked, remediated | Standards found the offline Session stub lacked the awaited metadata API and would cancel hot reconnection through a TypeError |
| `2026-09-02` | `pnpm --filter happy exec vitest run --project unit src/codex/runCodex.launch.test.ts src/utils/setupOfflineReconnection.test.ts src/api/apiSession.test.ts` | RED then pass (57/57) | Offline startup keeps hot reconnection alive, withholds Codex thread/message work, resumes with the real Session response, then completes durable Session/daemon publication and the first turn |
| `2026-09-02` | `pnpm --filter happy test && git diff --check` | pass (1024/1024) | Complete CLI build/unit suite after third-review offline remediation; no whitespace errors |
| `2026-09-02` | `python3 scripts/workflow-check.py --applicable --record publish-launch-pinned-codex-effort --staged --base refs/remotes/origin/dev` | accepted gap: 8/9 commands passed | Run `0a7cd37f-2a20-43a5-9fca-250cc01dab4e`, candidate `b987a7a2…`; index 5 reproduced exactly the same three accepted `core.autocrlf=true` baseline failures and no others |
| `2026-09-02` | fourth independent Spec/Standards review of candidate `b987a7a2…` | Spec accepted; Standards blocked, remediated | Standards found that terminal 401 and cancellation did not settle offline readiness or clean the pre-resource wait; it also requested actual orchestration coverage for cancellation and an untouched first-message route |
| `2026-09-02` | `pnpm --filter happy exec vitest run --project unit src/utils/serverConnectionErrors.test.ts src/utils/setupOfflineReconnection.test.ts src/codex/runCodex.launch.test.ts src/api/apiSession.test.ts` | RED then pass (92/92) | Typed 401/cancel events settle readiness; exported `runCodex()` rejects and cancels without thread/turn work; untouched Luna/Max and explicit Terra/High first turns reuse the eager thread |
| `2026-09-02` | `pnpm --filter happy test && git diff --check` | pass (1031/1031) | Complete CLI build/unit suite after fourth-review terminal/cancel remediation; no whitespace errors |
| `2026-09-02` | `python3 scripts/workflow-check.py --applicable --record publish-launch-pinned-codex-effort --staged --base refs/remotes/origin/dev` | accepted gap: 8/9 commands passed | Run `afbfd0e4-4292-4718-a439-83ec7f794979`, candidate `5c0d3a15…`; index 5 reproduced exactly the same three accepted `core.autocrlf=true` baseline failures and no others |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-02T12:21:04+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `77ade5dc93b5` | 2541 ms |
| 2026-09-02T12:21:07+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `91b15ddceff7` | 2092 ms |
| 2026-09-02T12:21:19+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `7db4942ba5f0` | 12219 ms |
| 2026-09-02T12:21:23+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `ffbb65f13d58` | 3391 ms |
| 2026-09-02T12:21:23+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `345a83947d66` | 44 ms |
| 2026-09-02T12:23:58+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `ecac2587b57e` | 155332 ms |
| 2026-09-02T12:23:59+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `70fc7c5c5937` | 37 ms |
| 2026-09-02T12:23:59+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `96ce97f112b0` | 112 ms |
| 2026-09-02T12:24:00+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `f3e119f6dd3f` | 112 ms |
| 2026-09-02T12:47:38+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `eb03a8e8dae2` | 4179 ms |
| 2026-09-02T12:47:43+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `5e78ac77fb02` | 4251 ms |
| 2026-09-02T12:48:06+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `9310982ef58a` | 22705 ms |
| 2026-09-02T12:48:10+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `b338bfb530be` | 4202 ms |
| 2026-09-02T12:48:11+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `b4c8544717ab` | 99 ms |
| 2026-09-02T12:51:13+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `3e99b4c109db` | 181410 ms |
| 2026-09-02T12:51:13+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `0755b4a3d7a7` | 37 ms |
| 2026-09-02T12:51:13+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `67ee7a8e4d47` | 85 ms |
| 2026-09-02T12:51:14+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `3cdb97ad9eb1` | 79 ms |
| 2026-09-02T13:07:52+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `2bb09887096e` | 4758 ms |
| 2026-09-02T13:07:57+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `0eeb4064cd69` | 4288 ms |
| 2026-09-02T13:08:18+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `08419bab2223` | 21220 ms |
| 2026-09-02T13:08:23+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `bab638a76e9c` | 4490 ms |
| 2026-09-02T13:08:24+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `f45121ca0afe` | 85 ms |
| 2026-09-02T13:11:41+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `d52b6acd2304` | 197186 ms |
| 2026-09-02T13:11:42+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `cb40bd338cef` | 41 ms |
| 2026-09-02T13:11:42+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `7391f2712175` | 78 ms |
| 2026-09-02T13:11:42+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `26c0fb1ca30e` | 74 ms |
| 2026-09-02T13:25:15+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `039ea14103da` | 4572 ms |
| 2026-09-02T13:25:20+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `6186b8e27c8a` | 4973 ms |
| 2026-09-02T13:25:42+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `ba9ed3c4dd10` | 21001 ms |
| 2026-09-02T13:25:46+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `a9b467fbc81c` | 4088 ms |
| 2026-09-02T13:25:47+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `b5dbaa7d6cb1` | 69 ms |
| 2026-09-02T13:30:00+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `d3ccd3a5cc08` | 253333 ms |
| 2026-09-02T13:30:00+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `fe3db3c645cc` | 40 ms |
| 2026-09-02T13:30:01+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `91c585613556` | 91 ms |
| 2026-09-02T13:30:01+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `703081ef46a3` | 90 ms |
| 2026-09-02T13:46:44+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `5a093315bc31` | 4396 ms |
| 2026-09-02T13:46:47+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `ed2bd0b36f64` | 3379 ms |
| 2026-09-02T13:47:08+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `c6f3bc7bcad7` | 20166 ms |
| 2026-09-02T13:47:12+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `60bf5cfb82b2` | 3631 ms |
| 2026-09-02T13:47:12+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `6c79145f9c24` | 73 ms |
| 2026-09-02T13:51:18+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `0b69f089fa93` | 245238 ms |
| 2026-09-02T13:51:18+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `b751649cf97d` | 48 ms |
| 2026-09-02T13:51:19+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `659477c7cc7a` | 108 ms |
| 2026-09-02T13:51:19+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `8df5f1666e0e` | 81 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | App Server effort-config test, awaited fresh-thread metadata test, and App production display-candidate test |
| AC2 | verified | Fresh-thread real daemon control-server projection test plus explicit Session/daemon rejection propagation |
| AC3 | verified | App Server request capture asserts one `thread/start` and zero `turn/start` before user input |
| AC4 | verified | The production launch barrier holds a pre-arriving message until the eager active thread and both route publications complete |
| AC5 | verified | Production cold-start seam test applies Terra/High from the first queued message only after Luna/Max launch confirmation and keeps one thread |
| AC6 | verified | Incomplete fresh response, rejected durable metadata, and rejected daemon projection fail initialization; pending App state suppresses global Medium through the SessionView selector |
| AC7 | verified | Production initializer skips fresh creation when restore already established an active thread; offline startup preserves hot reconnection and waits for a real Session before Codex launch |
| AC8 | accepted gap | Fifth candidate-bound check passed 8/9 commands for candidate `5c0d3a15…`; the sole command gap exactly matches the three user-accepted baseline fixtures. Fifth Spec review accepted and Standards review found no candidate blocker |

## Remaining gaps

- Workflow runtime: 35/38 tests pass. The three `core.autocrlf=true`
  merge/archive fixtures fail because checked-out configuration bytes make the
  bound fingerprint stale; workflow inputs match `origin/dev`, the isolated
  failure reproduces, and the LF/autocrlf-disabled control passes.
- User explicitly accepted command index 5 as a candidate-external gap on
  2026-09-02; latest run `afbfd0e4-4292-4718-a439-83ec7f794979`
  reproduced the same three failures and no others for candidate `5c0d3a15…`.
- Fifth independent review accepted the final checked candidate: Spec had no
  findings; Standards had no candidate blocker and carried only the accepted
  workflow fixture gap plus a non-blocking real-server E2E suggestion.
