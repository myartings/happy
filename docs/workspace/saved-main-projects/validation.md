# Validation: `saved-main-projects`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-01` | `pnpm --filter happy exec vitest run src/api/apiMachine.test.ts src/api/apiMachine.savedProjects.test.ts src/projects/savedProjectRegistry.test.ts` | pass | 3 files, 13 tests passed after restoring the legacy mocked-configuration fallback. |
| `2026-09-01` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstNewSessionWiring.test.ts sources/features/saved-projects/savedProjectModel.test.ts sources/hooks/useNewSessionDraft.test.ts sources/hooks/useStartSessionFromDraft.test.ts sources/sync/ops.savedProjects.test.ts sources/sync/spawnRequestId.test.ts` | pass | 6 files, 60 tests passed. |
| `2026-09-01` | `pnpm --filter happy typecheck` | pass | CLI TypeScript check passed. |
| `2026-09-01` | `pnpm --filter happy-app typecheck` | pass | App TypeScript check passed. |
| `2026-09-01` | `pnpm --filter happy-app exec vitest run` | fail | 1909/1911 passed. `blob.test.ts` passed on immediate isolated rerun; the remaining stable failure is a pre-existing static whitespace assertion in unmodified `SidebarView.tsx`. |
| `2026-09-01` | `pnpm --filter happy test` | fail | 914/923 passed. Slice tests passed; unrelated failures require unpacked rg/difft assets absent because Windows Skia postinstall failed, plus one existing Claude auto-discovery timeout. |
| `2026-09-01` | `pnpm --filter happy exec vitest run src/projects/savedProjectRegistry.test.ts src/api/apiMachine.test.ts src/api/apiMachine.savedProjects.test.ts` | pass | Review remediation: 3 files, 16 tests passed, including broken Git metadata, corrupt identity fields, junction/symlink swap, and unavailable Rig spawn. |
| `2026-09-01` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstNewSessionWiring.test.ts sources/features/saved-projects/savedProjectModel.test.ts sources/hooks/useNewSessionDraft.test.ts sources/hooks/useStartSessionFromDraft.test.ts sources/sync/ops.rigSpawn.test.ts sources/sync/ops.savedProjects.test.ts sources/sync/spawnRequestId.test.ts` | pass | Review remediation: 7 files, 67 tests passed, including Rig project identity, validated Add responses, and cross-machine/concurrent stale response rejection. |
| `2026-09-01` | `pnpm --filter happy-app typecheck; pnpm --filter happy typecheck` | pass | Both affected package typechecks passed after review remediation. |
| `2026-09-01` | `pnpm --filter happy-app test -- --run sources/features/saved-projects/savedProjectModel.test.ts sources/features/codex-first-shell/codexFirstNewSessionWiring.test.ts sources/hooks/useNewSessionDraft.test.ts sources/hooks/useStartSessionFromDraft.test.ts sources/sync/ops.rigSpawn.test.ts sources/sync/ops.savedProjects.test.ts` | pass | Second-review remediation: 6 files, 66 tests passed, including cross-platform absolute-path, identity-equality, duplicate-ID, and Windows case/separator canonical-identity rejection. |
| `2026-09-01` | `pnpm --filter happy-app typecheck` | pass | App TypeScript check passed after second-review boundary-validator remediation. |
| `2026-09-01` | `pnpm --filter happy exec vitest run src/api/apiMachine.savedProjects.test.ts src/projects/savedProjectRegistry.test.ts` | pass | Final-review remediation: 2 files, 15 tests passed, including explicit capability resolution before start. |
| `2026-09-01` | `pnpm --filter happy-app exec vitest run sources/features/saved-projects/savedProjectModel.test.ts sources/features/codex-first-shell/codexFirstNewSessionWiring.test.ts sources/hooks/useNewSessionDraft.test.ts sources/hooks/useStartSessionFromDraft.test.ts sources/sync/ops.rigSpawn.test.ts sources/sync/ops.savedProjects.test.ts` | pass | Final-review remediation: 6 files, 69 tests passed, including machine-bound registry state, restored-draft capability gating, invalid resolution rejection, and Rig fail-closed behavior. |
| `2026-09-01` | `pnpm --filter happy typecheck; pnpm --filter happy-app typecheck` | pass | Both affected package typechecks passed after final-review remediation. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-01T07:06:28+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `0067d9f9cecc` | 11407 ms |
| 2026-09-01T07:06:39+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | failed (2) | 2 | 304450403ea6; working tree `49401c21ee1b` | 9672 ms |
| 2026-09-01T07:07:00+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `d02a75be1de0` | 20328 ms |
| 2026-09-01T07:07:14+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `2f976cb17d44` | 12469 ms |
| 2026-09-01T07:07:15+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `e051266d4800` | 203 ms |
| 2026-09-01T07:22:27+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `b52847647d5a` | 911516 ms |
| 2026-09-01T07:22:28+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `e1301ba1487f` | 140 ms |
| 2026-09-01T07:22:30+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `2fedd2f65169` | 391 ms |
| 2026-09-01T07:22:31+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `d1bb0e5249fe` | 219 ms |
| 2026-09-01T07:24:20+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `bf1221423af0` | 10516 ms |
| 2026-09-01T07:24:30+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 304450403ea6; working tree `a186c93af9b6` | 8266 ms |
| 2026-09-01T07:24:49+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `ffa6c1be1dca` | 18187 ms |
| 2026-09-01T07:24:54+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `77af45b01372` | 3953 ms |
| 2026-09-01T07:24:55+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `87fd384154ff` | 157 ms |
| 2026-09-01T07:39:45+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `71f17131640b` | 889766 ms |
| 2026-09-01T07:39:46+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `e2d6b7e393f0` | 125 ms |
| 2026-09-01T07:39:47+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `38aa1773d753` | 328 ms |
| 2026-09-01T07:39:48+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `7b886ffad00b` | 235 ms |
| 2026-09-01T08:10:06+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `28669402b3ba` | 10406 ms |
| 2026-09-01T08:10:16+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 304450403ea6; working tree `d00be9be665f` | 8734 ms |
| 2026-09-01T08:10:34+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `5c2bbd6359c2` | 17406 ms |
| 2026-09-01T08:10:41+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `3dac21006911` | 5157 ms |
| 2026-09-01T08:10:42+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `57f38e76f755` | 187 ms |
| 2026-09-01T08:26:50+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `f1f2a4d14fdb` | 967812 ms |
| 2026-09-01T08:26:51+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `b65f390c45fd` | 110 ms |
| 2026-09-01T08:26:53+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `0062f002dbee` | 453 ms |
| 2026-09-01T08:26:54+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `954f7986c147` | 203 ms |
| 2026-09-01T09:01:41+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `a923ee135423` | 11484 ms |
| 2026-09-01T09:01:51+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 304450403ea6; working tree `5ffd2dc7d7e4` | 9282 ms |
| 2026-09-01T09:02:11+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `b41967d71694` | 20203 ms |
| 2026-09-01T09:02:17+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `584e0613df31` | 4984 ms |
| 2026-09-01T09:02:18+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `d21b7c8ee44e` | 172 ms |
| 2026-09-01T09:20:26+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `c8999d3e05ae` | 1087703 ms |
| 2026-09-01T09:20:27+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `254a71d85ccf` | 187 ms |
| 2026-09-01T09:20:28+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `2d4997a5b785` | 360 ms |
| 2026-09-01T09:20:28+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `91d4519dfbd4` | 375 ms |
| 2026-09-01T09:21:30+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `7e0c7e6a0c3d` | 11750 ms |
| 2026-09-01T09:21:40+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 304450403ea6; working tree `6f6a2458c02c` | 9015 ms |
| 2026-09-01T09:22:02+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `81781d7a0483` | 20297 ms |
| 2026-09-01T09:22:07+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `2f96ee345231` | 4469 ms |
| 2026-09-01T09:22:09+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `0d118f610da2` | 203 ms |
| 2026-09-01T09:38:44+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `2a43f84c172b` | 994422 ms |
| 2026-09-01T09:38:45+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `822f437eb754` | 109 ms |
| 2026-09-01T09:38:47+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `db90f106dabd` | 359 ms |
| 2026-09-01T09:38:48+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `bf866ba88934` | 266 ms |
| 2026-09-01T09:52:10+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 304450403ea6; working tree `f07e43786b3d` | 11141 ms |
| 2026-09-01T09:52:20+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 304450403ea6; working tree `827433927af2` | 9078 ms |
| 2026-09-01T09:52:43+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 304450403ea6; working tree `72f168f98680` | 22015 ms |
| 2026-09-01T09:52:50+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 304450403ea6; working tree `309b26d82a50` | 5094 ms |
| 2026-09-01T09:52:51+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 304450403ea6; working tree `d8d85cd359f2` | 219 ms |
| 2026-09-01T10:11:17+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 304450403ea6; working tree `2034fafb60e5` | 1105469 ms |
| 2026-09-01T10:11:18+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `fa522912fa9b` | 109 ms |
| 2026-09-01T10:11:20+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 304450403ea6; working tree `e11a1286e9f6` | 250 ms |
| 2026-09-01T10:11:21+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 304450403ea6; working tree `b3bcbfec132c` | 328 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| SP-01–SP-04 | verified | Registry tests cover empty/idempotent persistence, relative and symlink normalization, Git child/linked-worktree identity, submodule identity, stale revisions, corrupt bytes, and missing directories. |
| SP-05–SP-06 | verified | Machine RPC tests cover list/add, daemon-side project-ID resolution, stale caller path replacement, and no spawn for unavailable projects. |
| SP-07–SP-09 | verified | App model/ops/draft/start/wiring tests cover strict fail-closed loading, machine RPC payloads, persisted identity, main spawn identity, and shared start orchestration. |
| SP-10 | accepted gap | Final staged candidate `3d08b0febdad` ran all 9 configured commands: both typechecks and all 5 workflow checks pass; the two full-suite commands retain only the user-accepted unrelated baseline failures described below. Fresh Spec and Standards reviews both accepted the candidate. |

## Review remediation

- Initial independent Spec review blocked on Rig identity propagation, Git exit-128 classification, and corrupt relative-path/duplicate-ID acceptance.
- Initial independent Standards review blocked on pre-spawn symlink/junction replacement, ambiguous registry identities, and stale cross-machine Add completion.
- The implementation now carries project identity through Rig directory requests, rejects broken Git metadata, validates absolute/equal/unique stored identities, re-resolves canonical paths immediately before spawn, validates Add payloads, and generation-scopes mutations to the current machine and latest request.
- The App network boundary now independently rejects relative paths, primary/canonical identity mismatch, duplicate UUIDs, and Windows case/separator-equivalent canonical identities.
- Final review then found one shared machine/capability boundary: stale machine snapshots, restored drafts against old CLI, and CLI-owned identities forwarded to Rig.
- Registry state is now keyed to its source machine; restored main-project drafts require a successful current CLI resolution RPC; Rig saved-project starts fail closed because Rig cannot resolve the CLI-owned registry identity.
- Final candidate-bound check completed and fresh independent Spec/Standards reviews both accepted candidate `3d08b0febdad` with no blocking findings.

## Remaining gaps

- Root `pnpm install --frozen-lockfile` populated dependencies but its Skia postinstall uses Unix `rm` and failed on Windows. Running the package-standard `happy-server generate` and CLI `postinstall` recovered Prisma and packaged CLI tools without changing tracked source.
- Final App full-suite command retains the pre-existing static whitespace assertion in `studioSidebarWiring.test.ts`; the 1 MB encryption timing case also exceeds its 5-second threshold only under the full concurrent suite and passes isolated 9/9 in 2.59 seconds. All Saved Projects tests pass.
- Final Server full suite: 110/112 passed. The two stable failures are Windows local-file route expectations in unmodified attachment/avatar server tests; this Slice does not change Server code.
- The user explicitly accepted these unrelated baseline gaps. Candidate check and dual-axis review are complete; only finish/archive remains.
