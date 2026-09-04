# Validation: `daemon-bundle-handoff-sessions`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-04` | planning evidence inspection | pass | Issue #108, live systemd unit, daemon handoff, spawn, persistence, and integration-test seams inspected. |
| `2026-09-04` | `pnpm install --frozen-lockfile` | pass | Restored this Issue worktree's dependencies. |
| `2026-09-04` | `pnpm --filter happy exec vitest run --project unit src/utils/spawnHappyCLI.test.ts` | RED then pass | RED proved scope requests still launched `node` directly; GREEN used `systemd-run --user --scope` without a shell. |
| `2026-09-04` | focused Vitest for Session isolation/identity/persistence | RED/GREEN, pass | Proved systemd detection, exact process identity, stale/PID-reuse/zombie/malformed rejection, persistence, direct-path compatibility, and no launcher fallback; final focused run: 45 tests. |
| `2026-09-04` | `pnpm --filter happy typecheck` | pass | CLI TypeScript check passed after production integration. |
| `2026-09-04` | disposable nested `systemd-run` probe | pass | A process launched from a temporary `KillMode=control-group` service retained the tracked PID and moved into a sibling transient scope; unit auto-collected. |
| `2026-09-04` | `pnpm --filter happy exec vitest run --project unit --reporter=dot` | pass | 101 files, 1014 tests. |
| `2026-09-04` | authenticated daemon integration test filtered to `keeps two daemon Sessions alive and adopted across a systemd bundle handoff` | pass | Final run changed the daemon PID while preserving and adopting two exact Session PIDs/IDs; 1 passed, 13 filtered/skipped. An earlier rerun failed only because the disposable Web fixture missed its setup timeout; the next identical run passed. Output credentials were not retained. |
| `2026-09-04` | review-remediation identity tests | RED/GREEN, pass | RED proved expired records and post-adoption PID reuse were not rejected at the final adoption/stop seams. GREEN adds a 14-day record bound, exact heartbeat revalidation, and fail-closed process-group signalling; 6 focused identity tests pass. |
| `2026-09-04` | `pnpm --filter happy exec vitest run --project unit src/daemon/sessionProcessIdentity.test.ts src/daemon/controlServer.test.ts src/persistence.test.ts src/utils/spawnHappyCLI.test.ts src/daemon/sessionProcessIsolation.test.ts` | pass | 5 files, 53 tests after review remediation. |
| `2026-09-04` | Agent-native identity diagnosis | pass | Two authenticated RED runs proved idle daemon-spawned Sessions have no provider ID until the first Agent interaction. The deterministic fixture now publishes representative Claude IDs through the real encrypted metadata socket, then verifies list/adoption continuity without invoking a model. Diagnostic credentials were not retained. |
| `2026-09-04` | authenticated systemd handoff after review remediation | pass | Two protected Sessions retained exact Happy IDs, injected Agent-native IDs, PIDs, and process identities across daemon PID replacement; cleanup stopped both through the replacement daemon with exact-identity TERM/KILL fallback and asserted both gone. 1 passed, 13 skipped. |
| `2026-09-04` | `pnpm --filter happy exec vitest run --project unit --reporter=dot` | pass | 101 files, 1017 tests after review remediation. |
| `2026-09-04` | second-review remediation focused RED/GREEN | RED/GREEN, pass | RED rejected neither a string `recordedAt` nor a never-settling list refresh. GREEN strictly requires positive safe-integer timestamps and returns local list state without awaiting background refresh; 12 focused tests pass. |
| `2026-09-04` | bounded/coalesced Agent identity refresh inspection and authenticated systemd handoff | pass | Adopted missing identities schedule one in-flight batch fetch with a 1-second timeout and 5-second retry bound; the test waits for both native identities and passes. Partial spawn results plus live list and persisted records define cleanup before unit stop. 1 passed, 13 skipped; no credentials retained. |
| `2026-09-04` | `pnpm --filter happy exec vitest run --project unit --reporter=dot` after second review remediation | pass | 101 files, 1018 tests. |
| `2026-09-04` | asynchronous launcher-error and named-scope cleanup remediation | RED/GREEN, pass | RED reproduced an asynchronous `ENOENT` emitted after `spawnHappyCLI` returned without a PID. GREEN installs an immediate child error listener and gives each transient Session scope a daemon-PID-prefixed unit name so cleanup can enumerate pre-webhook launches. |
| `2026-09-04` | `pnpm --filter happy exec vitest run --project unit src/utils/spawnHappyCLI.test.ts src/daemon/controlServer.test.ts src/daemon/sessionProcessIdentity.test.ts` | pass | 3 files, 16 tests after third-review remediation; CLI typecheck also passed. |
| `2026-09-04` | authenticated systemd handoff after third-review remediation | pass | Two protected Sessions survived and were adopted after daemon replacement; final cleanup enumerated the original daemon's named transient scopes and left no Issue #108 test service units. 1 passed, 13 skipped; no credentials retained. |
| `2026-09-04` | `pnpm --filter happy exec vitest run --project unit --reporter=dot` after third-review remediation | pass | 101 files, 1019 tests. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-04T09:03:14+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `0b6501b84e34` | 31746 ms |
| 2026-09-04T09:03:22+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `f3e3546d1143` | 7600 ms |
| 2026-09-04T09:04:01+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `a892cf0ca49b` | 39250 ms |
| 2026-09-04T09:04:06+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `054d526f504b` | 4565 ms |
| 2026-09-04T09:04:06+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `52f2f021a544` | 57 ms |
| 2026-09-04T09:05:02+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `32a992df1e25` | 56297 ms |
| 2026-09-04T09:05:03+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `4c4f6eb73720` | 61 ms |
| 2026-09-04T09:05:03+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `b95a84ba0f23` | 124 ms |
| 2026-09-04T09:05:03+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `3b8b2f1db5c8` | 78 ms |
| 2026-09-04T09:40:26+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `4b64985f4683` | 5945 ms |
| 2026-09-04T09:40:33+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `6ab674a986ae` | 7036 ms |
| 2026-09-04T09:41:13+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `f2e41918d842` | 40299 ms |
| 2026-09-04T09:41:18+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `e608492ec962` | 4585 ms |
| 2026-09-04T09:41:18+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `a3d3eaaf9c62` | 58 ms |
| 2026-09-04T09:42:14+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `386dbbdf5955` | 55459 ms |
| 2026-09-04T09:42:14+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `666b8e0c5a4a` | 34 ms |
| 2026-09-04T09:42:14+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `00386fbf11d8` | 92 ms |
| 2026-09-04T09:42:14+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `0c7db5f769eb` | 50 ms |
| 2026-09-04T09:57:03+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `31879213530d` | 7410 ms |
| 2026-09-04T09:57:13+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `7e4fd704783e` | 9305 ms |
| 2026-09-04T09:58:02+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `f824852a93fc` | 49448 ms |
| 2026-09-04T09:58:08+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `77716b2bb06a` | 5869 ms |
| 2026-09-04T09:58:08+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `c6dff888fb08` | 70 ms |
| 2026-09-04T09:59:29+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `42033f9cb908` | 80837 ms |
| 2026-09-04T09:59:29+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `380ae26262bd` | 43 ms |
| 2026-09-04T09:59:30+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `e626cabd7d27` | 101 ms |
| 2026-09-04T09:59:30+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `d8f7ab3effc2` | 67 ms |
| 2026-09-04T10:11:44+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `b3884b0e703b` | 8333 ms |
| 2026-09-04T10:11:52+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `1871c9695a0a` | 7646 ms |
| 2026-09-04T10:12:33+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `8d21f60a75a3` | 40759 ms |
| 2026-09-04T10:12:38+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `446861cea9d2` | 5475 ms |
| 2026-09-04T10:12:38+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `9c22b88b1555` | 72 ms |
| 2026-09-04T10:13:36+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `dbcebdde8ac5` | 58018 ms |
| 2026-09-04T10:13:37+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `e00a916e0a6e` | 46 ms |
| 2026-09-04T10:13:37+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `b79d6e4be57f` | 115 ms |
| 2026-09-04T10:13:37+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `eb398de20a32` | 78 ms |
| 2026-09-04T10:18:23+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `29fc1a48b1e2` | 5745 ms |
| 2026-09-04T10:18:31+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `387828392584` | 7090 ms |
| 2026-09-04T10:19:09+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `418466e73fa7` | 38215 ms |
| 2026-09-04T10:19:14+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `4b822ae76fc9` | 4501 ms |
| 2026-09-04T10:19:14+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `eed606930719` | 57 ms |
| 2026-09-04T10:20:06+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `6c215f7462f9` | 52013 ms |
| 2026-09-04T10:20:06+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `03171640eb50` | 34 ms |
| 2026-09-04T10:20:06+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `9bb6d720f75a` | 88 ms |
| 2026-09-04T10:20:06+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `1b06c3420651` | 49 ms |
| 2026-09-04T10:26:58+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 1e03026a5feb; working tree `f61d00197e2e` | 6993 ms |
| 2026-09-04T10:27:05+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 1e03026a5feb; working tree `4630e2989de4` | 7298 ms |
| 2026-09-04T10:27:43+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 1e03026a5feb; working tree `d466607ba28b` | 38244 ms |
| 2026-09-04T10:27:48+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 1e03026a5feb; working tree `d8f8a8f07204` | 4616 ms |
| 2026-09-04T10:27:48+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `aa14a1c8e8b6` | 56 ms |
| 2026-09-04T10:28:40+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 1e03026a5feb; working tree `f30b8a122dc4` | 51662 ms |
| 2026-09-04T10:28:40+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `0f1c70cf235e` | 35 ms |
| 2026-09-04T10:28:40+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `3447fc475442` | 82 ms |
| 2026-09-04T10:28:40+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `e8e5c1cb0624` | 51 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Scope invocation unit test plus disposable nested systemd service/scope probe. |
| AC2 | verified | Launcher failure/no-fallback unit test and bounded child exit/error settlement inspection/typecheck. |
| AC3 | verified | Authenticated two-Session `KillMode=control-group` handoff integration test. |
| AC4 | verified | Authenticated integration test proves replacement-daemon list/adoption retains exact Happy ID, representative Agent-native ID, PID, and process identity; cleanup exercises adopted stop. |
| AC5 | verified | Exact identity, PID-reuse after adoption, expired, string-timestamp/malformed, missing, zombie, and persistence tests; heartbeat and stop revalidate before tracking/signalling. |
| AC6 | verified | Platform decision/direct-spawn tests plus full CLI unit suite. |
| AC7 | verified | Current diff is restricted to Happy CLI source/tests and required workflow/product documentation. |
| AC8 | verified | Final fixed-base applicable check passed 8 of 9 commands; the user accepted the clean-`dev`-reproduced workflow-runtime baseline gap. Independent capable Spec and Standards reviews accepted the complete terminal candidate with no actionable findings. |

## Remaining gaps

- The user explicitly accepted the pre-existing `scripts/test-happy-workflow-runtime.py` baseline gap after the same three stale structured-check fixture failures reproduced on clean `dev`; the final fixed-base run bound that identical gap to its own structured check receipt.
- Delivery commit, push, PR/Issue reconciliation, merge, installation, and release remain outside the authorization granted in this session.
