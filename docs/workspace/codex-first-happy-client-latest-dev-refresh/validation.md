# Validation: `codex-first-happy-client-latest-dev-refresh`

Record exact commands and results. Never mark a check passed unless it ran.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| 2026-08-31 | `python scripts/workflow-ci.py --base 68cfb6f915fb25f5ecd444df2aefafeccae92fa8` | passed | Committed CI for prerequisite pinned merge `ddb3034e`. |
| 2026-08-31 | prospective `git merge-tree --write-tree --name-only --messages ddb3034e origin/dev` | expected conflicts | Four conflicts identified without moving refs or changing the worktree. |
| 2026-08-31 | `python scripts/workflow-audit.py --all --strict` | passed | Repository health before creating this Workspace. |
| 2026-08-31 | `git merge --no-commit --no-ff 87b5385e82d96b5eaab68bc65a968cf36167e9c5` | expected conflicts | `MERGE_HEAD` is exact; archive, SessionView, SessionsList, and visible-list projection conflicted as predicted. |
| 2026-08-31 | focused visible-list test before compatibility repair | failed, expected RED | 1/1 failed only because legacy `input_required` remained in `active-sessions` instead of the leading attention section. |
| 2026-08-31 | focused visible-list test after repair; complete visible-list file | passed | GREEN 1/1, then 24/24. Current-request projection remains authoritative; legacy input fallback is answer-level. |
| 2026-08-31 | PR #76 focused 8-file family before focus repair | failed, integration RED | 93/94 passed. The only failure was the accepted older inline-form communication-ID transcript join after the Codex-first shared fallback policy composed with the incoming focus resolver. |
| 2026-08-31 | focused legacy join; shared fallback+focus suites | passed | GREEN 1/1; then 34/34. The repair is limited to missing/null `allowCustom` choice-form compatibility and leaves explicit custom-answer modal fallback unchanged. |
| 2026-08-31 | PR #76 focused 8-file family | passed | 8 files / 94 tests, including both parents' visible-list expectations. |
| 2026-08-31 | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell` | passed | 22 files / 80 tests. Packaged Windows selection and legacy platform fallbacks remain green. |
| 2026-08-31 | `pnpm --filter happy-app typecheck` | passed | Import unions, focus routing, list projection, translations, and Codex-first host seams typecheck. |
| 2026-08-31 | full candidate-bound `workflow-check.py` profile | accepted gap | 8/9 commands passed. App: 223 files / 1784 tests. Workflow runtime: 21/21. Server: 110/112 with only the two unchanged native-Windows `/tmp` fixture failures; both failing test blobs and the complete Server delta are identical to target `87b5385e`. Receipt run `4322b610-e8ee-46fd-8525-e72eef42820b`, fingerprint `8d5f3a0dc1af7f502096ab3025f7c53d52d262c4abc76edcc286bcc43cd0cf00`. |
| 2026-08-31 | `.\devtools\happyctl.ps1 doctor` | passed | Node 20.20.2, pnpm 10.11.0, Rust 1.95.0 MSVC, Tauri CLI 2.9.6, Visual Studio 2022, WebView2 153.0.4234.8, and tracked git guard present. |
| 2026-08-31 | `.\devtools\tests\happyctl-windows-smoke.ps1` | passed | 12/12 Windows devtools contracts. |
| 2026-08-31 | worktree-bound `.\devtools\happyctl.ps1 build-desktop` | passed | Exit 0. Built and frontend-embedding-verified `app.exe`, MSI, and NSIS artifacts from this worktree. No install, replacement, signing, launch, publication, or release. Tauri emitted a non-blocking updater bundle-type patch warning. |
| 2026-08-31 | `Get-FileHash` / `Get-AuthenticodeSignature` on three build artifacts | passed as inspection | `app.exe` SHA-256 `400066841EDD17153AFBDC20F7360100EC7F43C0F16B174E8AF1B570D1FFB81C` (26,554,880 bytes); MSI `3BDE15DA34CF76413D9A9D72836E3333A953C55E5CA45A21CFE2E747991B4022` (16,650,240 bytes); NSIS `13ECC9F2892E27D0247EC5E30621AA58EAE9A4844C3656899D8F598AA5ED7BB3` (15,035,736 bytes). All are intentionally `NotSigned` local development artifacts. |
| 2026-08-31 | full workflow runtime after stale-check binding cleanup | failed, actionable RED | 20/21 passed. `test_pending_merge_accepts_lf_active_with_autocrlf_disabled` exposed an unstaged tracked line-ending normalization in the temporary Windows fixture (`.gitignore` and `CONTEXT.md`), so its baseline commit failed. |
| 2026-08-31 | `python scripts/test-happy-workflow-runtime.py HappyWorkflowRuntimeTest.test_pending_merge_accepts_lf_active_with_autocrlf_disabled` after fixture repair | passed | GREEN 1/1 in 106.8s. The fixture now stages all tracked normalization with `git add -u` before its baseline commit; untracked fixture files remain excluded. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-31T09:16:38+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | ddb3034e2e30; working tree `a31eee2c461b` | 8812 ms |
| 2026-08-31T09:16:45+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | ddb3034e2e30; working tree `0b51a0d45c2d` | 6188 ms |
| 2026-08-31T09:16:59+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | ddb3034e2e30; working tree `856534178275` | 13328 ms |
| 2026-08-31T09:17:03+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | ddb3034e2e30; working tree `471a96a7fc6b` | 3328 ms |
| 2026-08-31T09:17:04+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | ddb3034e2e30; working tree `2ddd4d1858ad` | 125 ms |
| 2026-08-31T09:28:11+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | ddb3034e2e30; working tree `00589f3a6341` | 666125 ms |
| 2026-08-31T09:28:12+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | ddb3034e2e30; working tree `2350c99bb17f` | 156 ms |
| 2026-08-31T09:28:13+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | ddb3034e2e30; working tree `38f26c351be4` | 265 ms |
| 2026-08-31T09:28:14+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | ddb3034e2e30; working tree `59d0cf94531d` | 188 ms |
| 2026-08-31T09:47:09+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | ddb3034e2e30; working tree `eaa6869ecf3c` | 8609 ms |
| 2026-08-31T09:47:17+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | ddb3034e2e30; working tree `17bfd858556c` | 6969 ms |
| 2026-08-31T09:47:33+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | ddb3034e2e30; working tree `28c8855fe2dd` | 14891 ms |
| 2026-08-31T09:47:38+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | ddb3034e2e30; working tree `685fbab2c93f` | 4360 ms |
| 2026-08-31T09:47:39+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | ddb3034e2e30; working tree `9c1ac085e1c4` | 156 ms |
| 2026-08-31T09:59:50+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | ddb3034e2e30; working tree `062d69827585` | 730094 ms |
| 2026-08-31T09:59:51+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | ddb3034e2e30; working tree `82c9ff2c2ea3` | 110 ms |
| 2026-08-31T09:59:51+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | ddb3034e2e30; working tree `78bfe7e8094c` | 266 ms |
| 2026-08-31T10:00:15+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | failed (1) | 1 | ddb3034e2e30; working tree `b70346f5ea3c` | 23094 ms |
| 2026-08-31T10:03:11+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | ddb3034e2e30; working tree `cd44ad9cc711` | 7485 ms |
| 2026-08-31T10:03:19+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | ddb3034e2e30; working tree `b2c467c5b0cf` | 6750 ms |
| 2026-08-31T10:03:33+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | ddb3034e2e30; working tree `001d18fb1e33` | 14016 ms |
| 2026-08-31T10:03:38+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | ddb3034e2e30; working tree `89a9d8a35919` | 3344 ms |
| 2026-08-31T10:03:38+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | ddb3034e2e30; working tree `f2951390c938` | 141 ms |
| 2026-08-31T10:13:26+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | ddb3034e2e30; working tree `79f9322ea62b` | 587031 ms |
| 2026-08-31T10:13:27+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | ddb3034e2e30; working tree `23b1d7aed023` | 109 ms |
| 2026-08-31T10:13:28+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | ddb3034e2e30; working tree `ac930f425848` | 234 ms |
| 2026-08-31T10:13:29+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | ddb3034e2e30; working tree `c2338d84c8bb` | 359 ms |
| 2026-08-31T10:20:21+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | ddb3034e2e30; working tree `e5b908c69dda` | 8453 ms |
| 2026-08-31T10:20:28+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | ddb3034e2e30; working tree `97aebccfbc54` | 6094 ms |
| 2026-08-31T10:20:43+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | ddb3034e2e30; working tree `2a4085322c38` | 14360 ms |
| 2026-08-31T10:20:47+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | ddb3034e2e30; working tree `ee4f42a27564` | 3625 ms |
| 2026-08-31T10:20:48+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | ddb3034e2e30; working tree `935b69baee95` | 141 ms |
| 2026-08-31T10:32:31+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | ddb3034e2e30; working tree `10d98e30ff97` | 701781 ms |
| 2026-08-31T10:32:32+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | ddb3034e2e30; working tree `87632d2f9066` | 94 ms |
| 2026-08-31T10:32:33+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | ddb3034e2e30; working tree `0fd7c076e465` | 312 ms |
| 2026-08-31T10:32:34+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | ddb3034e2e30; working tree `149b77ece3e2` | 187 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| LR-001 | verified | Pre-commit parents are pinned as `HEAD=ddb3034e` and `MERGE_HEAD=87b5385e`; the exact committed two-parent order will be checked immediately after the authorized merge commit. |
| LR-002 | verified | Archive parent-row comparison found exact union: expected/current 96, delta 0; strict validation passed. |
| LR-003 | verified | No unresolved stage; both symbol families present; App typecheck and full App suite passed. |
| LR-004 | verified | Codex-first 22 files / 80 tests and complete App 223 files / 1784 tests passed. |
| LR-005 | verified | Two existing-parent RED→GREEN loops closed; visible-list 24/24 and PR #76 family 94/94 pass. |
| LR-006 | verified | Legacy join GREEN, shared policy+focus 34/34, and navigation/current-request family 94/94 pass. |
| LR-007 | accepted gap | Candidate-bound full profile accepted only the unchanged native-Windows Server fixture gap; doctor, 12/12 smoke, worktree-bound native build, embedding check, artifact hashes, and unsigned status are recorded. |
| LR-008 | verified | Candidate scans and strict all-workspace audit passed; independent capable Spec and Standards review accepted frozen package `ff7eeadab2c5602f` with only the named LR-007 gap. |
| LR-009 | accepted gap | Remote SHA equality and PR #78 state/check inspection are necessarily post-archive/post-commit/post-push delivery checks. Normal push is explicitly authorized, has not yet occurred, and no remote success is claimed in pre-archive evidence. |

## Remaining gaps

- Independent review, finish/archive, merge commit, committed CI, normal push,
  and PR verification remain.
- Accepted check gap: the two Server failures use Unix `/tmp` fixture paths on
  native Windows. Their test blobs are identical in candidate, first parent,
  and target, and the Server tree has zero delta from target.
- A newly observed Windows line-ending fixture failure was not accepted as a
  gap; it was repaired under TDD and now requires one fresh complete check.
- Discovered focus failure classification: `accepted-contract-gap` under LR-006.
  It is integration-only, bounded to the existing navigation/focus seam, and
  preserves the accepted outcome, risk class, merge boundary, and zero-response
  contract; it creates no independent remainder.
