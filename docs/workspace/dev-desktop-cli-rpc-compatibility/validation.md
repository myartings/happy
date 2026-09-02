# Validation: `dev-desktop-cli-rpc-compatibility`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-02` | `bash devtools/tests/happyctl-desktop-cli-compatibility-smoke.sh` before implementation | expected RED (exit 1) | Dry-run lacked all CLI/daemon/RPC intent. |
| `2026-09-02` | Same smoke after orchestration fixture was added | expected RED (exit 1) | Trace diverged at line 2 because refresh called only Desktop stages. |
| `2026-09-02` | Same smoke with pkgroll entry-plus-chunk fixture | expected RED (exit 1) | Entry-only verifier rejected a valid RPC marker in a hashed chunk. |
| `2026-09-02` | `pnpm install --frozen-lockfile` | passed | Installed the isolated worktree dependencies after initial `shx`/`vitest` ENOENT. |
| `2026-09-02` | `bash -n devtools/happyctl` | passed | Shell syntax. |
| `2026-09-02` | `bash devtools/tests/happyctl-desktop-cli-compatibility-smoke.sh` | passed | Paired success order, dry-run non-mutation, four-stage failure matrix, reports, replacement PID, chunked RPC marker, and missing-RPC rejection. |
| `2026-09-02` | `bash devtools/tests/happyctl-refresh-guards-smoke.sh` | passed | Existing branch and personal-feature guards. |
| `2026-09-02` | `bash devtools/tests/happyctl-macos-signing-smoke.sh` | passed | Existing macOS sign/install seam. |
| `2026-09-02` | `pnpm --filter happy run build` | passed | CLI 1.2.2 compiled; pkgroll emitted expected bin/empty-chunk warnings. |
| `2026-09-02` | Workspace-dist `verify_workspace_cli_rpc_compatibility` probe | passed | Found `list-saved-projects` in generated `types-FRle7Gof.mjs`. |
| `2026-09-02` | `pnpm --filter happy exec vitest run --project unit src/api/apiMachine.savedProjects.test.ts src/projects/savedProjectRegistry.test.ts` | passed | 2 files, 20 tests. |
| `2026-09-02` | `pnpm --filter happy-app exec vitest run sources/features/saved-projects/savedProjectModel.test.ts sources/sync/ops.savedProjects.test.ts` | passed | 2 files, 14 tests. |
| `2026-09-02` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstNewSessionWiring.test.ts` | passed | 1 file, 2 tests; App focused total is 16. |
| `2026-09-02` | `git diff --check` | passed | No whitespace errors. |
| `2026-09-02` | `bash devtools/tests/devtools-layout-smoke.sh` | not applicable on `dev` (exit 1) | The script asserts personal `main`'s devtools-only delta against `upstream/main`; this Issue worktree is based on personal `dev`, whose accepted product/workflow files necessarily violate that main-only invariant. |
| `2026-09-02` | First `python3 scripts/workflow-check.py --applicable --record dev-desktop-cli-rpc-compatibility --staged --base refs/remotes/origin/dev` | blocked: 7/9 commands passed | Run `ddf678e3-d83f-46f8-87fe-eac757439ccb`, candidate `aa46e4aba73c`; App had one unrelated blob timeout and workflow runtime had three same-root CRLF/LF fixture failures. |
| `2026-09-02` | Three fixed attempts of `pnpm --filter happy-app exec vitest run sources/encryption/blob.test.ts` | 2 passed, 1 timed out | The 1 MB case completed in about 3.0–3.6 seconds twice and exceeded the fixed 5-second timeout once at about 6.4 seconds; candidate does not touch encryption/App code. |
| `2026-09-02` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_pending_merge_can_archive_fresh_reviewed_integration_task` | reproduced (exit 1) | Deterministic `core.autocrlf=true` failure: the recorded working-tree config hash differs from staged CI's index-normalized snapshot hash. |
| `2026-09-02` | `python3 scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_pending_merge_accepts_lf_active_with_autocrlf_disabled` | passed | Positive control confirms the same merge/archive path passes with LF worktree bytes. |
| `2026-09-02` | Exact installed-CLI daemon identity fixture before remediation | expected RED (exit 1) | The verifier still invoked PATH-resolved `happy`, reproducing the Standards review gap with a decoy executable. |
| `2026-09-02` | `bash -n devtools/happyctl && bash devtools/tests/happyctl-desktop-cli-compatibility-smoke.sh` after remediation | passed | Daemon stop/start uses the exact npm-linked `bin/happy.mjs`, ignores the PATH decoy, and rejects an unreplaced post-install PID. |
| `2026-09-02` | Remediated `python3 scripts/workflow-check.py --applicable --record dev-desktop-cli-rpc-compatibility --staged --base refs/remotes/origin/dev` | accepted gaps: 8/9 commands passed | Run `80556492-c69f-410f-8e1e-e88856a66f2c`, candidate `bf02b26c6cee`; App passed 245 files/1931 tests, Server passed 112 tests, and only command index 5 reproduced the same three accepted CRLF/LF workflow fixtures. |
| `2026-09-02` | Link-only installer and distinctive exit-code fixture before second-review remediation | expected RED (exit 1) | Existing `install-local.cjs` ignored `--link-only`, ran `pnpm build`, and retained PATH-dependent composite behavior. |
| `2026-09-02` | `bash -n devtools/happyctl && node --check packages/happy-cli/scripts/install-local.cjs && bash devtools/tests/happyctl-desktop-cli-compatibility-smoke.sh` after second-review remediation | passed | Link-only invokes only `npm link`; install/daemon failures preserve fixture codes 23/24 and exact report stages; daemon lifecycle remains bound to the exact installed CLI. |
| `2026-09-02` | Refresh-guard and macOS-signing smoke tests plus `git diff --check` after second-review remediation | passed | Adjacent devtools guards and signing seam remain green; no whitespace errors. |
| `2026-09-02` | Distinctive RPC compatibility command-status fixture before final-review remediation | expected RED (exit 1) | A fake `find` exited 26 but the verifier normalized the compatibility-stage failure to 1. |
| `2026-09-02` | Compatibility, refresh-guard, and macOS-signing smokes plus syntax/diff checks after final-review remediation | passed | npm-root, `find`, and `grep` command errors retain their status; no-marker remains ordinary incompatibility 1; fake `find` 26 propagates through the verifier. |
| `2026-09-02` | npm-root full helper-chain fixture before delivery-review remediation | expected RED (exit 1) | `verify_workspace_cli_install_identity` converted fake `npm root -g` exit 27 to 1, exposing equivalent coercion at package-derived helper boundaries. |
| `2026-09-02` | Compatibility and adjacent devtools smokes after delivery-review remediation | passed | Fresh subshell fault injection proves npm-root exit 27 propagates through install identity, bundle, executable, daemon, and RPC helpers; find 26, PATH decoy, and status 23/24 cases remain green. |
| `2026-09-02` | Report-write failure fixture before integrated-review remediation | expected RED (exit 1) | A report writer failure 29 overrode the original install failure 23, violating the frozen operational exit-status contract. |
| `2026-09-02` | Compatibility and adjacent devtools smokes after integrated-review remediation | passed | Operational failure 23 survives report failure 29; direct daemon stop/start failures preserve 31/32; realpath mismatch, npm-root 27, find 26, and prior stage fixtures remain green. |
| `2026-09-02` | Orphan compiled RPC chunk fixture before final Standards remediation | expected RED (exit 1) | The all-dist scan accepted `list-saved-projects` in an unreferenced chunk even though `index.mjs` reached only an incompatible chunk. |
| `2026-09-02` | Entrypoint-reachable graph compatibility smoke and workspace CLI build | passed | Orphan marker is rejected; missing reachable modules preserve graph error 2; the real built `dist/index.mjs` reaches `types-FRle7Gof.mjs`; report failure 29 is also exposed after otherwise successful operations. |
| `2026-09-02` | Syntax-aware registration and daemon-status fixtures after final Spec remediation | passed, then superseded | AST traversal rejects comment/string pseudo-imports and marker-only constants; the status fixture exposed error 33, but later review showed CLI status was not affirmative HTTP health evidence. |
| `2026-09-02` | Affirmative daemon HTTP health fixture after converged dual-axis review | passed | A live PID with a 200 `/list` response and valid children payload passes; the same live/state-tied PID with HTTP 503 is rejected; injected health error 33 remains preserved. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-02T05:29:29+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 03936270022b; working tree `0f0e1e22a5f7` | 24908 ms |
| 2026-09-02T05:29:38+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 03936270022b; working tree `757b6be4436b` | 8339 ms |
| 2026-09-02T05:30:10+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 03936270022b; working tree `f29e2bbd954f` | 31749 ms |
| 2026-09-02T05:30:20+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 03936270022b; working tree `080a8be51adc` | 8597 ms |
| 2026-09-02T05:30:20+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 03936270022b; working tree `b65c95c4f47a` | 132 ms |
| 2026-09-02T05:39:39+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 03936270022b; working tree `26c243e8fec7` | 557603 ms |
| 2026-09-02T05:39:39+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `6f0332bd2c22` | 83 ms |
| 2026-09-02T05:39:40+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `8cb05cc4e32a` | 257 ms |
| 2026-09-02T05:39:42+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 03936270022b; working tree `d311baf7fefb` | 623 ms |
| 2026-09-02T06:02:19+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 03936270022b; working tree `d9527f1557c5` | 6732 ms |
| 2026-09-02T06:02:25+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 03936270022b; working tree `e658406d87dc` | 5762 ms |
| 2026-09-02T06:02:52+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 03936270022b; working tree `f4308beb6e41` | 26579 ms |
| 2026-09-02T06:02:58+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 03936270022b; working tree `d6f9ab950d6e` | 4649 ms |
| 2026-09-02T06:02:58+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 03936270022b; working tree `3b1096097f5d` | 73 ms |
| 2026-09-02T06:08:55+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 03936270022b; working tree `e7ae5d4796b2` | 356500 ms |
| 2026-09-02T06:08:56+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `3be4b5c2e00b` | 49 ms |
| 2026-09-02T06:08:56+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `ed057b951ac2` | 114 ms |
| 2026-09-02T06:08:56+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 03936270022b; working tree `98727cf99ec8` | 109 ms |
| 2026-09-02T06:21:36+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 03936270022b; working tree `c281479adfa2` | 9426 ms |
| 2026-09-02T06:21:44+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 03936270022b; working tree `73362b5c0851` | 7205 ms |
| 2026-09-02T06:22:42+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 03936270022b; working tree `e0aefe380f11` | 57638 ms |
| 2026-09-02T06:22:49+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 03936270022b; working tree `7d14aa9db699` | 7023 ms |
| 2026-09-02T06:22:50+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 03936270022b; working tree `9772af6e4713` | 119 ms |
| 2026-09-02T06:28:05+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 03936270022b; working tree `8b3fd2a41b4b` | 313905 ms |
| 2026-09-02T06:28:05+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `7edcb7675a43` | 62 ms |
| 2026-09-02T06:28:05+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `5dad41e88032` | 88 ms |
| 2026-09-02T06:28:06+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 03936270022b; working tree `1323e2c72f5e` | 73 ms |
| 2026-09-02T06:55:23+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 03936270022b; working tree `f3445e4e115d` | 3160 ms |
| 2026-09-02T06:55:26+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 03936270022b; working tree `51d2240d00f1` | 2904 ms |
| 2026-09-02T06:55:43+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 03936270022b; working tree `2e3fc775a941` | 16936 ms |
| 2026-09-02T06:55:46+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 03936270022b; working tree `60e9d01a5f7a` | 2434 ms |
| 2026-09-02T06:55:46+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 03936270022b; working tree `d53c74987e0a` | 71 ms |
| 2026-09-02T06:58:18+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 03936270022b; working tree `fda41ff24249` | 151506 ms |
| 2026-09-02T06:58:18+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `0f955990b8cc` | 24 ms |
| 2026-09-02T06:58:18+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `bdb19f9c6f73` | 56 ms |
| 2026-09-02T06:58:19+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 03936270022b; working tree `fdc738e29314` | 59 ms |
| 2026-09-02T07:07:09+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 03936270022b; working tree `dada1ef3095c` | 6241 ms |
| 2026-09-02T07:07:14+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 03936270022b; working tree `75ebe21a8a17` | 4629 ms |
| 2026-09-02T07:07:42+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 03936270022b; working tree `6ce31e103469` | 28033 ms |
| 2026-09-02T07:07:48+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 03936270022b; working tree `9f18cb22f819` | 4555 ms |
| 2026-09-02T07:07:48+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 03936270022b; working tree `66d66c8b50bd` | 98 ms |
| 2026-09-02T07:11:33+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 03936270022b; working tree `2ec8c0c63f85` | 224778 ms |
| 2026-09-02T07:11:33+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `e588a605b531` | 36 ms |
| 2026-09-02T07:11:34+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `698c869359a1` | 93 ms |
| 2026-09-02T07:11:34+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 03936270022b; working tree `eb2f57852f55` | 86 ms |
| 2026-09-02T07:22:06+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 03936270022b; working tree `b316963f7a08` | 5842 ms |
| 2026-09-02T07:22:12+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 03936270022b; working tree `49613edd9bf0` | 6022 ms |
| 2026-09-02T07:22:49+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 03936270022b; working tree `06738daa331a` | 36238 ms |
| 2026-09-02T07:23:02+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 03936270022b; working tree `094bb2212a02` | 12607 ms |
| 2026-09-02T07:23:03+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 03936270022b; working tree `ad57581ceb2f` | 135 ms |
| 2026-09-02T07:27:21+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 03936270022b; working tree `6fbc120e52be` | 257952 ms |
| 2026-09-02T07:27:22+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `b3d026828c36` | 114 ms |
| 2026-09-02T07:27:22+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 03936270022b; working tree `789324f080bf` | 98 ms |
| 2026-09-02T07:27:22+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 03936270022b; working tree `fb78e26c120a` | 79 ms |
| 2026-09-02T07:36:16+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e63b8ccb5bb3; working tree `818ca34c7745` | 10817 ms |
| 2026-09-02T07:36:21+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e63b8ccb5bb3; working tree `69c40d879395` | 4739 ms |
| 2026-09-02T07:36:48+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | e63b8ccb5bb3; working tree `7948aae67e57` | 27179 ms |
| 2026-09-02T07:36:53+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | e63b8ccb5bb3; working tree `d804dd51078f` | 4506 ms |
| 2026-09-02T07:36:54+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e63b8ccb5bb3; working tree `f9c797a234b6` | 71 ms |
| 2026-09-02T07:41:17+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | e63b8ccb5bb3; working tree `c17de039a8bd` | 262661 ms |
| 2026-09-02T07:41:17+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `2fda438b79da` | 35 ms |
| 2026-09-02T07:41:17+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `5eb7b45c2eee` | 79 ms |
| 2026-09-02T07:41:18+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e63b8ccb5bb3; working tree `1cacf1496814` | 77 ms |
| 2026-09-02T07:56:12+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e63b8ccb5bb3; working tree `225414d532f1` | 4791 ms |
| 2026-09-02T07:56:17+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e63b8ccb5bb3; working tree `a66ed563e051` | 5137 ms |
| 2026-09-02T07:56:38+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | e63b8ccb5bb3; working tree `4ca5b809169f` | 20196 ms |
| 2026-09-02T07:56:42+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | e63b8ccb5bb3; working tree `5ff73e45b879` | 3987 ms |
| 2026-09-02T07:56:43+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e63b8ccb5bb3; working tree `326ab87120b3` | 103 ms |
| 2026-09-02T08:00:59+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | e63b8ccb5bb3; working tree `0521f853a262` | 255669 ms |
| 2026-09-02T08:00:59+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `7d70dfdc17c7` | 47 ms |
| 2026-09-02T08:00:59+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `2d689d2a1b11` | 101 ms |
| 2026-09-02T08:01:00+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e63b8ccb5bb3; working tree `b7d02f864c32` | 98 ms |
| 2026-09-02T08:15:03+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e63b8ccb5bb3; working tree `71b292c783f0` | 3742 ms |
| 2026-09-02T08:15:07+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e63b8ccb5bb3; working tree `f51516e3c9f7` | 3774 ms |
| 2026-09-02T08:15:29+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | e63b8ccb5bb3; working tree `55a4d64a2126` | 21729 ms |
| 2026-09-02T08:15:33+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | e63b8ccb5bb3; working tree `93145755329d` | 3533 ms |
| 2026-09-02T08:15:34+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e63b8ccb5bb3; working tree `5708c0d1555d` | 66 ms |
| 2026-09-02T08:18:20+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | e63b8ccb5bb3; working tree `e010d073d7b0` | 165879 ms |
| 2026-09-02T08:18:20+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `56b3dd101945` | 41 ms |
| 2026-09-02T08:18:21+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `396b5d3fcb30` | 87 ms |
| 2026-09-02T08:18:21+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e63b8ccb5bb3; working tree `729583cac304` | 75 ms |
| 2026-09-02T08:29:08+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e63b8ccb5bb3; working tree `7c9315dd0020` | 4460 ms |
| 2026-09-02T08:29:13+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e63b8ccb5bb3; working tree `940fe08e0bed` | 4307 ms |
| 2026-09-02T08:29:36+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | e63b8ccb5bb3; working tree `b2b53fae1f22` | 22880 ms |
| 2026-09-02T08:29:42+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | e63b8ccb5bb3; working tree `ab5d216f268b` | 4697 ms |
| 2026-09-02T08:29:42+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e63b8ccb5bb3; working tree `b75a3a907140` | 96 ms |
| 2026-09-02T08:35:57+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | e63b8ccb5bb3; working tree `7ed9743bdb1c` | 374233 ms |
| 2026-09-02T08:35:57+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `457399af32ec` | 41 ms |
| 2026-09-02T08:35:58+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `1791126e3050` | 99 ms |
| 2026-09-02T08:35:58+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e63b8ccb5bb3; working tree `0ff7d903b02e` | 107 ms |
| 2026-09-02T08:45:49+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e63b8ccb5bb3; working tree `fa473576dcb2` | 4464 ms |
| 2026-09-02T08:45:53+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e63b8ccb5bb3; working tree `ec0802ac3585` | 4284 ms |
| 2026-09-02T08:46:12+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | e63b8ccb5bb3; working tree `72aaece48a38` | 18764 ms |
| 2026-09-02T08:46:16+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | e63b8ccb5bb3; working tree `ac938333a961` | 3374 ms |
| 2026-09-02T08:46:17+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e63b8ccb5bb3; working tree `1085f874fb1b` | 82 ms |
| 2026-09-02T08:50:22+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | e63b8ccb5bb3; working tree `877495acd57f` | 245480 ms |
| 2026-09-02T08:50:23+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `5d54ab40f2d5` | 40 ms |
| 2026-09-02T08:50:23+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e63b8ccb5bb3; working tree `e53601f954b2` | 113 ms |
| 2026-09-02T08:50:24+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e63b8ccb5bb3; working tree `46e8af19351d` | 111 ms |
| 2026-09-02T09:06:24+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 0fad5446e527; working tree `8e16e16bcae4` | 2904 ms |
| 2026-09-02T09:06:26+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 0fad5446e527; working tree `725c112e769a` | 2135 ms |
| 2026-09-02T09:06:38+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 0fad5446e527; working tree `cbe6fcb679f5` | 11911 ms |
| 2026-09-02T09:06:40+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 0fad5446e527; working tree `cb4d8d3dd5cd` | 1995 ms |
| 2026-09-02T09:06:41+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 0fad5446e527; working tree `214bb4cf4e70` | 54 ms |
| 2026-09-02T09:09:10+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 0fad5446e527; working tree `7510a44333b2` | 149101 ms |
| 2026-09-02T09:09:10+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 0fad5446e527; working tree `d8b0643fe140` | 28 ms |
| 2026-09-02T09:09:10+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 0fad5446e527; working tree `850c3a1e5c02` | 65 ms |
| 2026-09-02T09:09:11+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 0fad5446e527; working tree `9b28e2b0ea03` | 56 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| DC-01 | verified | Success trace proves CLI build/install precede Desktop install. |
| DC-02 | verified | Exact npm-linked executable, replacement PID, same-PID rejection, required `/list` HTTP 200/payload; real PID `49414 -> 61895` and HTTP 200. |
| DC-03 | verified | AST/realpath graph rejects orphan/pseudo/escaped markers; real installed graph reaches `types-FRle7Gof.mjs`. |
| DC-04 | verified | Build/install/daemon/RPC failures return nonzero and report exact failed stage. |
| DC-05 | verified | Dry-run text passes and external report/backup paths remain absent. |
| DC-06 | verified | Report assertions cover CLI build/install, daemon restart/PIDs, and compatibility. |
| DC-07 | verified | CLI build, generated-chunk probe, and 20 focused CLI tests passed. |
| DC-08 | verified | Three focused App files, 16 tests passed. |
| DC-09 | verified | PR #101 merged to `dev@87c6aa7e`; report `20260902-165849-refresh-desktop.md` succeeded; CLI/daemon/App checks and New Session UI observation passed. |

## Remaining gaps

- The final check no longer reproduces the previously accepted App blob
  timeout. Run `e7d66ca0-279b-4a9c-9aeb-e6ed2a327ad9` retains only command
  index 5: the same three accepted merge/archive fixtures whose configuration
  fingerprint compares CRLF working-tree bytes with an LF staged snapshot. The
  unrelated workflow defect remains outside Issue #98 and is recorded as the
  candidate-bound accepted gap.
- Real refresh and runtime observation passed on `dev@87c6aa7e`: global CLI
  identity, daemon HTTP health, AST RPC registration, signed App install/launch,
  and `tauri://localhost/new` controls were all observed.
