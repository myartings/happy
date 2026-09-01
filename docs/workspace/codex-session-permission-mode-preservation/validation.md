# Validation: `codex-session-permission-mode-preservation`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-01` | `pnpm install --frozen-lockfile` | setup gap | All 2638 packages reused from local cache and linked; unrelated Skia postinstall then failed because its Windows process invoked Unix `rm`. |
| `2026-09-01` | `pnpm --filter @slopus/happy-wire build` | passed | Restored the missing workspace `dist` prerequisite after the partial install. |
| `2026-09-01` | focused App `messageMeta.test.ts` RED | expected failure | Legacy true case received Auto instead of YOLO; 22 existing tests passed. |
| `2026-09-01` | focused App explicit-null RED | expected failure | Explicit synchronized reset received YOLO instead of Auto; 23 other tests passed. |
| `2026-09-01` | focused App explicit-mode RED | expected failure | Synchronized Auto lost to legacy/global YOLO; 24 other tests passed. |
| `2026-09-01` | focused shared-resolver RED | expected failure | Public module did not yet exist. |
| `2026-09-01` | focused CLI initial-metadata RED | expected failure | `metadata.permissionMode` was undefined instead of YOLO; 10 existing tests passed. |
| `2026-09-01` | focused final App tests | passed | 31/31 resolver and outbound message tests. |
| `2026-09-01` | focused final CLI tests | passed | 19/19 metadata factory and remote-mode tests. |
| `2026-09-01` | nearest App regression suite | passed | 96/96 across resolver, message metadata, agent defaults, session creation, and synchronized storage. |
| `2026-09-01` | nearest CLI regression suite | passed | 23/23 across initial metadata, remote mode state, and daemon spawn args. |
| `2026-09-01` | `pnpm --filter happy-app typecheck` | passed | Shared composer/outbound resolver integration typechecks. |
| `2026-09-01` | `pnpm --filter happy typecheck` | passed | Initial CLI metadata integration typechecks. |
| `2026-09-01` | `git diff --check` | passed | No whitespace errors; only expected Windows LF/CRLF notices. |
| `2026-09-01` | review remediation non-Codex resolver RED | expected failure | Non-Codex metadata with the legacy true marker resolved to YOLO; 6 other resolver tests passed. |
| `2026-09-01` | review remediation resolver GREEN | passed | Internal Codex flavor guard made all 7 resolver tests pass. |
| `2026-09-01` | completed resolver/message authorization matrix | passed | 36/36 across exact legacy markers, non-Codex metadata, explicit reset, Auto/Default/YOLO precedence, and outbound metadata. |
| `2026-09-01` | review remediation nearest App regression suite | passed | 59/59 across resolver, outbound metadata, agent defaults, spawn behavior, and session draft storage. |
| `2026-09-01` | review remediation `pnpm --filter happy-app typecheck` | passed | Shared resolver flavor guard and expanded matrix typecheck. |
| `2026-09-01` | review remediation `git diff --check` | passed | No whitespace errors; only expected Windows LF/CRLF notices. |
| `2026-09-01` | applicable configured workflow check | not run | Formal complete-candidate evidence runs in verification. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-01T08:46:06+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `eada19afd477` | 11344 ms |
| 2026-09-01T08:46:16+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | failed (2) | 2 | 304450403ea6; working tree `d38b5d385250` | 8609 ms |
| 2026-09-01T08:46:38+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `551199c1911c` | 20546 ms |
| 2026-09-01T08:46:43+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `23f89b9ea9cc` | 4797 ms |
| 2026-09-01T08:46:44+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `a83b56d04319` | 203 ms |
| 2026-09-01T09:06:58+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `ca8db16cf3f2` | 1212703 ms |
| 2026-09-01T09:06:59+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `d69a6f425b79` | 156 ms |
| 2026-09-01T09:07:01+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `0cc668152171` | 375 ms |
| 2026-09-01T09:07:02+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `a01be916085b` | 234 ms |
| 2026-09-01T09:08:45+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `6bcdd6cf6b7e` | 11844 ms |
| 2026-09-01T09:08:55+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 304450403ea6; working tree `eee1e4c4ae2b` | 9016 ms |
| 2026-09-01T09:09:16+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `8e5dc93b22b1` | 19671 ms |
| 2026-09-01T09:09:21+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `1866aa1178fe` | 4422 ms |
| 2026-09-01T09:09:22+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `23a3e08267ed` | 187 ms |
| 2026-09-01T09:27:15+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `4e72781f66d3` | 1072141 ms |
| 2026-09-01T09:27:16+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `1ae95edfdf41` | 172 ms |
| 2026-09-01T09:27:18+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `1406ecc25b27` | 313 ms |
| 2026-09-01T09:27:19+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `bb56f727b531` | 219 ms |
| 2026-09-01T09:50:06+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `c33c9680cc63` | 11625 ms |
| 2026-09-01T09:50:17+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 304450403ea6; working tree `e6ba023598ce` | 10141 ms |
| 2026-09-01T09:50:41+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `979797379f3b` | 22312 ms |
| 2026-09-01T09:50:48+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `3b28f751b24a` | 5563 ms |
| 2026-09-01T09:50:49+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `a6605b804b27` | 219 ms |
| 2026-09-01T10:09:25+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `1d5ddd10af97` | 1113907 ms |
| 2026-09-01T10:09:26+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `4080bd6c9873` | 157 ms |
| 2026-09-01T10:09:27+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `a22824c4cd7b` | 312 ms |
| 2026-09-01T10:09:29+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `0bd02f1c65b7` | 219 ms |
| 2026-09-01T10:10:24+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `5ccf016cbb75` | 11906 ms |
| 2026-09-01T10:10:36+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 304450403ea6; working tree `6ea00a6ed6e1` | 10610 ms |
| 2026-09-01T10:10:57+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `193471b73232` | 19500 ms |
| 2026-09-01T10:11:03+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `1e985e5da94d` | 4766 ms |
| 2026-09-01T10:11:04+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `d7d28cada4e5` | 172 ms |
| 2026-09-01T10:26:38+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `4e209ef0f25f` | 933203 ms |
| 2026-09-01T10:26:39+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `ffda00941f08` | 141 ms |
| 2026-09-01T10:26:40+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `7aa033cab371` | 359 ms |
| 2026-09-01T10:26:41+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `572a5bced593` | 266 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1-AC3 legacy and explicit precedence | verified | Shared resolver matrix and `messageMeta.test.ts`, 36/36 after review remediation, including non-Codex and Auto/Default/YOLO precedence |
| AC4-AC5 composer/wire convergence and compatibility | verified | Shared resolver consumed by `SessionView` and `messageMeta`; focused tests and App typecheck passed |
| AC6-AC7 initial launch persistence | verified | Auto/YOLO metadata factory tests, `runCodex` caller inspection, CLI typecheck |
| AC8 later synchronized mode changes | verified | Existing App creation and storage synchronization suites in 96/96 regression run |
| AC9 unchanged defaults and other harnesses | verified | Agent-default, spawn-mode, remote-mode, and related App/CLI regressions passed |
| AC10 configured verification and review | accepted gap | Final run `6b493757-9fdb-47f2-9712-b97e7206cbc8` bound candidate `aefae2341ca433f1074f8ae781eceecf6fd86595870263c79b9caeb33c48302b`; named command indexes 2 and 3 explicitly accepted; fresh independent Spec and Standards reviews passed with no findings |

## Remaining gaps

- Installed Android/iOS handoff reproduction is a final acceptance signal when
  devices are available; deterministic resolver and metadata tests are the
  implementation gate and do not authorize build/install/release work.
- The configured setup command has an unrelated Windows Skia postinstall gap;
  dependencies were linked and the missing Happy Wire build was restored, so
  focused tests and both typechecks are runnable. Formal check must report this
  baseline setup fact rather than treating the failed install as a pass.
