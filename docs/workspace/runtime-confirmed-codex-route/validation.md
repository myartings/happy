# Validation: `runtime-confirmed-codex-route`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-01` | planning/source inspection only | passed | Live Issue, exact worktree route, baseline, and current metadata/App Server seams re-read before acceptance. |
| `2026-09-01` | `pnpm --filter happy exec vitest run --project unit src/codex/codexRuntimeModelMetadata.test.ts` | setup unavailable | Initial attempt exited 254 because the isolated worktree had no installed `vitest`; no behavioral RED claimed. |
| `2026-09-01` | `pnpm install --frozen-lockfile` | passed | Restored the repository-declared dependency precondition from the existing pnpm store; lockfile unchanged. |
| `2026-09-01` | focused metadata test after adding complete-pair expectation | RED | Exit 1: existing 3 tests passed; new test failed because `withCodexEffectiveRouteMetadata` was not a function. |
| `2026-09-01` | focused metadata test after minimal helper/type implementation | GREEN | Exit 0: 1 file and 4 tests passed; package test prebuild also ran `tsc --noEmit` and `pkgroll`. |
| `2026-09-01` | focused metadata partial-evidence and identity tracer bullets | RED then GREEN | Partial evidence initially retained the stale pair and unchanged evidence initially copied metadata; final focused suite passed 6/6. |
| `2026-09-01` | focused App Server lifecycle tracer bullets | RED then GREEN | Start, resume, fork, primary settings update, and forced reconnect now preserve the App Server response pair; child-thread settings updates are ignored. |
| `2026-09-01` | `pnpm --filter happy exec vitest run --project unit src/codex/resumeExistingThread.test.ts` | GREEN | Exit 0: 2/2 tests passed after the resume response pair was integrated into Session metadata. |
| `2026-09-01` | `pnpm --filter happy exec vitest run --project unit src/daemon/controlServer.test.ts` | RED then GREEN | The Luna Max projection was initially absent; final suite passed 2/2 and withheld partial metadata. |
| `2026-09-01` | focused four-file CLI suite | passed | Exit 0: 4 files, 45 tests passed; package prebuild ran `tsc --noEmit` and `pkgroll`. |
| `2026-09-01` | installed `happy-session-launcher` v0.5 parser fixture | passed | Existing route-verification unit test passed; direct unchanged-parser fixture accepted nested Luna Max effective fields and rejected a partial pair. |
| `2026-09-02` | complete recorded applicable check, first candidate | failed | App: 1/1929 large-blob timeout under full load; Server 112/112 passed; workflow runtime 19/22 passed with three pre-existing CRLF fingerprint failures; all other configured commands passed. |
| `2026-09-02` | isolated App large-blob test, three fixed attempts | passed | 3/3 passed in 3.32s, 3.73s, and 3.99s; the full-suite timeout was not reproduced outside parallel load. |
| `2026-09-02` | read-only workflow runtime diagnosis | baseline failure confirmed | The three failures reproduce in fixtures that copy none of #80's changed paths. `core.autocrlf=true` makes `checkout-index` materialize CRLF `.ai/project.json`; raw-byte config SHA then differs from the LF recorded SHA despite identical JSON. The same sequence passes with autocrlf disabled. |
| `2026-09-02` | live daemon projection tracer bullet | RED then GREEN | The launch-only snapshot initially made runtime confirmation invisible. A local atomic push now makes Luna Max visible, clears to absent, rejects a partial request, and adds no polling/store. |
| `2026-09-02` | focused four-file CLI suite after live projection integration | passed | Exit 0: 4 files and 46 tests passed; package prebuild ran `tsc --noEmit` and `pkgroll`. |
| `2026-09-02` | first `pnpm --filter happy test` attempt | load-related timeout | 967/968 passed; unchanged difftastic `--version` test exceeded 5s while other diagnostic/build work was concurrent. |
| `2026-09-02` | isolated difftastic version test, three fixed attempts | passed | 3/3 passed; the tested subprocess completed in 28ms, 31ms, and 46ms after per-attempt CLI prebuilds. |
| `2026-09-02` | `pnpm --filter happy test` clean rerun | passed | Exit 0: CLI build/typecheck passed; 98 files and 968 tests passed. |
| `2026-09-02` | first independent Spec and Standards review | blocked, remediated | Review found fail-open model/effort validation, stale route retention after reconnect failure, and fork projection loss. The revised candidate centralizes strict validators, clears on both reconnect-connect and resume failures, and resumes the forked thread through the same Session/daemon publication seam. |
| `2026-09-02` | focused remediation suite | RED then GREEN | New default, whitespace, unknown-effort, missing-side, reconnect-clear, resume-projection, and daemon-ingress/list cases failed before implementation; final 4-file suite passed 52/52 after CLI build/typecheck. |
| `2026-09-02` | `pnpm --filter happy test` after review remediation | passed | Exit 0: CLI build/typecheck passed; 98 files and 974 tests passed. |
| `2026-09-02` | second independent Spec and Standards review | blocked, remediated | Review found legacy/raw stream coexistence and unbound settings gaps, generation-unbound daemon mutation, overly broad model identifiers, blocking daemon delivery, and insufficient end-to-end evidence. The revised candidate preserves settings updates across mixed streams, clears unbound evidence, generation-binds writes, strips startup claims, applies identifier grammar, coalesces projection off the turn path, and adds Luna Max resume-to-daemon coverage. |
| `2026-09-02` | second focused remediation suite | RED then GREEN | Added mixed legacy/raw, unbound clear, malformed model, generation spoof, startup spoof, non-blocking latest-state, Luna Max resume→Session→daemon, and model-only/effort-only/combined-reset fixtures; final 6-file suite passed 73/73 after CLI build/typecheck. |
| `2026-09-02` | `pnpm --filter happy test` after second review remediation | passed | Exit 0: CLI build/typecheck passed; 98 files and 981 tests passed. |
| `2026-09-02` | `pnpm --filter happy test` after requested-change coverage | passed | Exit 0: CLI build/typecheck passed; 98 files and 985 tests passed. |
| `2026-09-02` | third independent Spec and Standards review | Standards passed; Spec blocked, remediated | All implementation behavior passed both axes. Spec required AC10's launcher v0.5 compatibility evidence to be reproducible within the pinned candidate rather than only recorded from the installed external fixture. |
| `2026-09-02` | candidate-local launcher v0.5 behavioral fixture | passed | The test-only frozen consumer contract accepts the daemon's nested Luna Max pair, defers when the pair is absent/partial, and reports a Sol Medium pair as mismatch; focused control-server suite passed 4/4 after CLI build/typecheck. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-01T15:49:08+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 8ecad0b722e5; working tree `a10a830453e0` | 42665 ms |
| 2026-09-01T15:49:22+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 8ecad0b722e5; working tree `4d6106eb6aa2` | 13235 ms |
| 2026-09-01T15:50:17+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 8ecad0b722e5; working tree `fab17db1af9e` | 53541 ms |
| 2026-09-01T15:50:28+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 8ecad0b722e5; working tree `b37d5fa132ac` | 10095 ms |
| 2026-09-01T15:50:29+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 8ecad0b722e5; working tree `4d1263f97bd1` | 171 ms |
| 2026-09-01T15:59:09+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 8ecad0b722e5; working tree `059c1c80074c` | 520174 ms |
| 2026-09-01T15:59:11+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `49b9062f77b6` | 108 ms |
| 2026-09-01T15:59:12+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `10d2c2a86249` | 353 ms |
| 2026-09-01T15:59:13+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 8ecad0b722e5; working tree `a05bf05aa193` | 204 ms |
| 2026-09-01T16:15:12+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 8ecad0b722e5; working tree `fd125a38ff89` | 12764 ms |
| 2026-09-01T16:15:26+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 8ecad0b722e5; working tree `cace63f185b9` | 12602 ms |
| 2026-09-01T16:16:26+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 8ecad0b722e5; working tree `ba0ac9c08309` | 59318 ms |
| 2026-09-01T16:16:36+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 8ecad0b722e5; working tree `e88409bae065` | 9129 ms |
| 2026-09-01T16:16:37+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 8ecad0b722e5; working tree `ff7ab09b2aab` | 192 ms |
| 2026-09-01T16:26:25+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 8ecad0b722e5; working tree `b0da2a7c4cb4` | 586667 ms |
| 2026-09-01T16:26:26+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `e9084275b689` | 98 ms |
| 2026-09-01T16:26:27+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `23c47faedfff` | 330 ms |
| 2026-09-01T16:26:28+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 8ecad0b722e5; working tree `113fea2ea96c` | 231 ms |
| 2026-09-01T16:44:07+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 8ecad0b722e5; working tree `bb2a95b4b9a9` | 10190 ms |
| 2026-09-01T16:44:21+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 8ecad0b722e5; working tree `5e14f64da999` | 13520 ms |
| 2026-09-01T16:45:13+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 8ecad0b722e5; working tree `4c9e9a3ff91b` | 50787 ms |
| 2026-09-01T16:45:22+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 8ecad0b722e5; working tree `5e85ecf11f2d` | 8609 ms |
| 2026-09-01T16:45:23+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 8ecad0b722e5; working tree `e0483eeb3a30` | 106 ms |
| 2026-09-01T16:52:46+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 8ecad0b722e5; working tree `001ffe0d08a8` | 442863 ms |
| 2026-09-01T16:52:47+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `91b0f8719f02` | 80 ms |
| 2026-09-01T16:52:48+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `34bd46db0412` | 164 ms |
| 2026-09-01T16:52:48+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 8ecad0b722e5; working tree `39d511a9a42e` | 206 ms |
| 2026-09-01T17:08:37+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 8ecad0b722e5; working tree `1bfd53a274d2` | 8696 ms |
| 2026-09-01T17:08:48+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 8ecad0b722e5; working tree `922161a424ee` | 9572 ms |
| 2026-09-01T17:09:33+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 8ecad0b722e5; working tree `28353b59961c` | 44360 ms |
| 2026-09-01T17:09:43+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 8ecad0b722e5; working tree `1aedd3a801d8` | 9500 ms |
| 2026-09-01T17:09:44+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 8ecad0b722e5; working tree `2fb42e323666` | 190 ms |
| 2026-09-01T17:18:25+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 8ecad0b722e5; working tree `a2c4c65af94b` | 520560 ms |
| 2026-09-01T17:18:26+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `58e71f972b72` | 80 ms |
| 2026-09-01T17:18:27+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `8ff8985a464c` | 246 ms |
| 2026-09-01T17:18:27+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 8ecad0b722e5; working tree `0057849f97f6` | 192 ms |
| 2026-09-01T17:25:13+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 8ecad0b722e5; working tree `75c9222410dc` | 8976 ms |
| 2026-09-01T17:25:25+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 8ecad0b722e5; working tree `7a175c93e441` | 11229 ms |
| 2026-09-01T17:26:18+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 8ecad0b722e5; working tree `9c11aa8ead74` | 53134 ms |
| 2026-09-01T17:26:28+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 8ecad0b722e5; working tree `53d43e9aec43` | 8557 ms |
| 2026-09-01T17:26:29+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 8ecad0b722e5; working tree `c268ad02e79f` | 159 ms |
| 2026-09-01T17:35:31+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 8ecad0b722e5; working tree `1448afcfe26e` | 541688 ms |
| 2026-09-01T17:35:32+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `3875f4577751` | 98 ms |
| 2026-09-01T17:35:33+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `0a4c17d4795a` | 262 ms |
| 2026-09-01T17:35:34+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 8ecad0b722e5; working tree `285cdf2defa3` | 202 ms |
| 2026-09-01T17:40:58+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 8ecad0b722e5; working tree `922f001f14cd` | 5918 ms |
| 2026-09-01T17:41:05+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 8ecad0b722e5; working tree `d35bc20ec097` | 5886 ms |
| 2026-09-01T17:41:44+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 8ecad0b722e5; working tree `ab7e3b14a181` | 39036 ms |
| 2026-09-01T17:41:51+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 8ecad0b722e5; working tree `47fc2aa1df25` | 6555 ms |
| 2026-09-01T17:41:52+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 8ecad0b722e5; working tree `f565a88ff507` | 168 ms |
| 2026-09-01T17:49:36+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | 8ecad0b722e5; working tree `2ffd2be6ee96` | 462765 ms |
| 2026-09-01T17:49:36+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `167a894d2fb5` | 76 ms |
| 2026-09-01T17:49:37+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 8ecad0b722e5; working tree `622d8f8c6e40` | 188 ms |
| 2026-09-01T17:49:38+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 8ecad0b722e5; working tree `e3f542353280` | 219 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1-AC2 | verified | typed optional fields and atomic helper; focused metadata suite 15/15 passed with protocol-grounded model identifiers. |
| AC3 | verified | null, missing, malformed, partial, whitespace, unknown-effort, and reset/default evidence clears both fields; unchanged evidence preserves identity. |
| AC4-AC7 | verified | App Server start/resume/fork-resume, mixed-stream primary settings update, unbound clear, mismatch, forced-reconnect confirmation, and failed-reconnect clearing fixtures passed. |
| AC8 | verified | focused reconnect/requested-state behavior passed; daemon delivery is non-blocking and coalesces queued state; non-Codex code paths are untouched. |
| AC9-AC11 | verified | generation-bound bounded projection, startup/update spoof rejection, Luna Max resume→Session→daemon fixture, and unchanged launcher v0.5 Luna Max/partial fixture passed. |
| AC12 | verified | focused remediation suite passes 73/73, complete CLI passes 985/985, final structured run is bound with two owner-accepted candidate-external gaps, and independent Spec/Standards review passed. |

## Remaining gaps

- Three unrelated workflow runtime fixtures have a proven pre-existing
  LF/CRLF raw-byte fingerprint failure. The owner explicitly accepted this
  candidate-external check gap; #80 does not enter those fixtures.
- The owner explicitly accepted the unchanged App full-load large-blob timeout
  after 1928 peer tests passed and the isolated test passed 3/3.
