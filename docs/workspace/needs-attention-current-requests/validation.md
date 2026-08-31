# Validation: `needs-attention-current-requests`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | `pnpm install --frozen-lockfile` | pass | Installed the exact lockfile dependencies after initial Vitest invocation reported `Command "vitest" not found`. |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention sources/hooks/useVisibleSessionListViewData.test.ts sources/hooks/useNavigateToSession.test.ts sources/sync/pendingCommunicationsSelector.spec.ts sources/sync/settings.spec.ts` | pass | 6 files, 74 tests passed. |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | pass | `tsc --noEmit` exited 0 after projection, presentation, and navigation integration. |
| `2026-08-30` | `python3 scripts/workflow-check.py --applicable --record needs-attention-current-requests --staged --base cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a` | fail | 7/9 command groups passed. Happy App full tests and workflow runtime tests failed; diagnosis below. |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/utils/activeSessionRuntimeStatusWiring.test.ts` | pass | Updated the one candidate-owned static wiring expectation; 4/4 passed. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention sources/hooks/useVisibleSessionListViewData.test.ts sources/hooks/useNavigateToSession.test.ts sources/sync/pendingCommunicationsSelector.spec.ts sources/sync/settings.spec.ts sources/utils/messageTarget.test.ts sources/utils/activeSessionRuntimeStatusWiring.test.ts` | pass | First-review remediation suite passed 8 files, 88 tests. |
| `2026-08-31` | `pnpm --filter happy-app typecheck` | pass | All row-policy, translation, and destination message-resolution integration typechecked. |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record needs-attention-current-requests --staged --base cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a` | accepted gaps | Run `68281c8e-3c74-4476-a741-f3caad8292e1` bound candidate `a1f92231…`; only the same user-accepted Studio and workflow baseline failures remained. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention/currentRequestAttentionFocus.spec.ts` | fail, expected RED | Strict route-version test failed because `parseCurrentRequestAttentionRouteVersion` did not yet exist; the other two focus tests passed. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention/currentRequestAttentionFocus.spec.ts` | fail, expected RED | Runtime-type extension received `7` for an array route value, proving RegExp/Number coercion still accepted non-string input before the type guard. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention sources/hooks/useVisibleSessionListViewData.test.ts sources/hooks/useNavigateToSession.test.ts sources/sync/pendingCommunicationsSelector.spec.ts sources/sync/settings.spec.ts sources/utils/messageTarget.test.ts sources/utils/activeSessionRuntimeStatusWiring.test.ts` | pass | Second-review remediation suite passed 8 files, 90 tests. |
| `2026-08-31` | `pnpm --filter happy-app typecheck` | pass | Strict route-boundary parser integration typechecked. |
| `2026-08-31` | `git diff HEAD --check` | pass | No whitespace errors after second-review remediation. |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record needs-attention-current-requests --staged --base cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a` | accepted gaps | Run `72e0933c-2b56-4bc5-89b6-96a16cf78946` bound candidate `9b614de0…`; only the same user-accepted Studio and workflow baseline failures remained. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention/currentRequestAttention.spec.ts sources/hooks/useVisibleSessionListViewData.test.ts` | fail, expected RED | Initial mixed-state run failed both the target ordering test and an invalid empty-form test fixture; after making the form valid, only the target ordering test failed (1 failed / 28 passed). |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention/currentRequestAttention.spec.ts sources/hooks/useVisibleSessionListViewData.test.ts` | pass | Mixed completed-permission / pending-answer projection and priority coverage passed 29/29. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention sources/hooks/useVisibleSessionListViewData.test.ts sources/hooks/useNavigateToSession.test.ts sources/sync/pendingCommunicationsSelector.spec.ts sources/sync/settings.spec.ts sources/utils/messageTarget.test.ts sources/utils/activeSessionRuntimeStatusWiring.test.ts` | pass | Third-review remediation suite passed 8 files, 92 tests. |
| `2026-08-31` | `pnpm --filter happy-app typecheck` | pass | Projected-reason priority change and new fixtures typechecked. |
| `2026-08-31` | `git diff HEAD --check` | pass | No whitespace errors after third-review remediation. |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record needs-attention-current-requests --staged --base cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a` | accepted gaps | Run `a816fd38-1d94-4b5d-9eb4-7d7b480e056d` bound candidate `b5b5f47b…`; only the same user-accepted Studio and workflow baseline failures remained. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention/currentRequestAttentionFocus.spec.ts` | fail, expected RED | Older inline form without explicit `toolUseId` returned general focus (1 failed / 3 passed) instead of using its established communication-ID transcript join key. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention/currentRequestAttentionFocus.spec.ts` | pass | Older inline-form compatibility and transcript message-ID resolution passed 4/4. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/needs-attention sources/hooks/useVisibleSessionListViewData.test.ts sources/hooks/useNavigateToSession.test.ts sources/sync/pendingCommunicationsSelector.spec.ts sources/sync/settings.spec.ts sources/utils/messageTarget.test.ts sources/utils/activeSessionRuntimeStatusWiring.test.ts` | pass | Fourth-review remediation suite passed 8 files, 93 tests. |
| `2026-08-31` | `pnpm --filter happy-app typecheck` | pass | Legacy communication-ID join fallback typechecked. |
| `2026-08-31` | `git diff HEAD --check` | pass | No whitespace errors after fourth-review remediation. |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record needs-attention-current-requests --staged --base cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a` | accepted gaps | Final run `782801d8-569e-4f7f-a7c7-4ebcf580d881` bound candidate `9c71abfd…`; only the same user-accepted Studio and workflow baseline failures remained, with no new failure. |
| `2026-08-31` | Fresh capable Spec + Standards whole-diff review of candidate `9c71abfd…` | pass | Both independent axes accepted the exact staged candidate with no blocking or non-blocking finding. |
| `2026-08-31` | `python3 scripts/workflow-check.py --applicable --record needs-attention-current-requests --staged --base cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a` | accepted gaps | Final completion-record run `7d707cfd-0dbc-420b-9506-3855e6f8ec8b` bound candidate `13dde813…`; commands 0, 1, 3, 4, 6, 7, and 8 passed, while only accepted baseline indexes 2 and 5 failed. |
| `2026-08-31` | Fresh capable Spec + Standards whole-diff review of candidate `13dde813…` | pass | Both independent axes accepted the exact staged candidate and diff `2e35bb0e…` with no blocking or non-blocking finding. |

## Incremental TDD evidence

| Slice | RED | GREEN / nearest suite |
| --- | --- | --- |
| T1 projection | `currentRequestAttention.spec.ts` failed because `./currentRequestAttention` did not exist. | Projection tests passed; subsequent focused suite passed. |
| T2 offline membership/dedup | Visible-list test received `active-sessions` instead of leading `attention-sessions`. | Target passed, then the complete visible-list suite passed 20/20; expanded matrix now passes 22/22. |
| T2 offline presentation | Presentation test failed because `resolveCurrentRequestReasonKind` did not exist. | Feature projection/presentation tests pass 3/3 and App typecheck confirms all row integrations. |
| T3 stale focus | Focus suite failed because `./currentRequestAttentionFocus` did not exist. | Destination resolver tests pass 2/2. |
| T3 route hint | After mocking the Expo Router boundary, the test received `/session/session%2Fone` instead of bounded route params. | Navigation helper test passes 1/1; App typecheck passes. |
| Review remediation: transcript target | The focused resolver test received `{ kind: 'message', messageId: 'tool-1' }`, proving that the provider tool join key was incorrectly treated as a transcript message ID. | The resolver now returns a tool join key and the destination resolves it against current tool-call messages; focus/message-target suite passes 9/9. |
| Review remediation: disabled rollback | The row-policy test failed because `resolveCurrentRequestRowAttention` did not exist, so structured reason/action/focus state could not be suppressed as one behavior. | Disabled policy returns no structured reason, action, or focus hint; every row uses it while retaining legacy `session.state` presentation. |
| Review remediation: visible action | The enabled row-policy test received `actionTextKey: null` for a permission reason. | Permission maps to localized `Review`, communication to localized `Answer`; row-policy and row-wiring tests pass and App typecheck validates every locale. |
| Second-review remediation: strict route version | The route-boundary test failed because `parseCurrentRequestAttentionRouteVersion` did not exist. | Only canonical non-negative decimal safe-integer strings parse; empty, whitespace, leading-zero, signed, fractional, hexadecimal, scientific, nonnumeric, and oversized values return `undefined`, and the Session route is wired exclusively through this parser. |
| Second-review remediation: runtime route type | An array route value was coerced to `"7"` and parsed as version 7. | The parser accepts `unknown` and rejects every non-string value before syntax or numeric conversion; the 8-file suite remains 90/90 green. |
| Third-review remediation: projected reason priority | A newer Answer row carrying stale legacy `permission_required` state sorted ahead of a genuinely pending permission row; after correcting an initially invalid empty-form fixture, this was the sole RED failure. | An existing projection now owns priority whenever present, with legacy permission state used only when projection is absent; the mixed snapshot/list tests pass 29/29 and the full focused suite passes 92/92. |
| Fourth-review remediation: older inline-form join | A version-matched supported inline form without explicit `toolUseId` resolved to general state even though existing transcript selection uses its communication ID as the join key. | Explicit tool IDs still win; fallback forms still use the banner/modal; only older inline forms use communication ID, which must then resolve to an actual current transcript tool-call message ID. Focus tests pass 4/4 and the full focused suite passes 93/93. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-30T15:31:01+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | cbf63a29bd3f; working tree `960e38c4587e` | 2358 ms |
| 2026-08-30T15:31:03+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | cbf63a29bd3f; working tree `a046209e1f9a` | 1993 ms |
| 2026-08-30T15:31:11+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | cbf63a29bd3f; working tree `06b9d17ce56b` | 7847 ms |
| 2026-08-30T15:31:14+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | cbf63a29bd3f; working tree `e6b195ca626a` | 2690 ms |
| 2026-08-30T15:31:14+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | cbf63a29bd3f; working tree `c61a69d38f9e` | 50 ms |
| 2026-08-30T15:32:10+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | cbf63a29bd3f; working tree `af7dd0fc1b85` | 55419 ms |
| 2026-08-30T15:32:10+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `b0934abc268c` | 23 ms |
| 2026-08-30T15:32:10+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `37ccc75d9335` | 59 ms |
| 2026-08-30T15:32:11+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | cbf63a29bd3f; working tree `1a970fdf715f` | 49 ms |
| 2026-08-30T15:43:39+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | cbf63a29bd3f; working tree `aee682fd77ff` | 2546 ms |
| 2026-08-30T15:43:41+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | cbf63a29bd3f; working tree `2a832e397a5f` | 2061 ms |
| 2026-08-30T15:43:50+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | cbf63a29bd3f; working tree `9891e28ee022` | 8230 ms |
| 2026-08-30T15:43:52+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | cbf63a29bd3f; working tree `def6c4424808` | 1699 ms |
| 2026-08-30T15:43:52+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | cbf63a29bd3f; working tree `df2ed56e6954` | 42 ms |
| 2026-08-30T15:44:47+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | cbf63a29bd3f; working tree `3b594205c5d5` | 55200 ms |
| 2026-08-30T15:44:47+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `2e7942110f8c` | 27 ms |
| 2026-08-30T15:44:48+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `215f70685fb2` | 51 ms |
| 2026-08-30T15:44:48+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | cbf63a29bd3f; working tree `b2e31af3e4cd` | 48 ms |
| 2026-08-30T16:04:04+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | cbf63a29bd3f; working tree `71396be646a4` | 3056 ms |
| 2026-08-30T16:04:06+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | cbf63a29bd3f; working tree `ab25161320c9` | 2434 ms |
| 2026-08-30T16:04:16+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | cbf63a29bd3f; working tree `2962f3675e4c` | 9534 ms |
| 2026-08-30T16:04:18+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | cbf63a29bd3f; working tree `4fb447e6fb2f` | 2095 ms |
| 2026-08-30T16:04:18+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | cbf63a29bd3f; working tree `2d3086f8e728` | 44 ms |
| 2026-08-30T16:05:46+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | cbf63a29bd3f; working tree `bef139acb234` | 87231 ms |
| 2026-08-30T16:05:46+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `2b9f9de2a4b7` | 58 ms |
| 2026-08-30T16:05:47+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `0e0f0d2cfb7e` | 121 ms |
| 2026-08-30T16:05:47+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | cbf63a29bd3f; working tree `8ac2316fef72` | 117 ms |
| 2026-08-30T16:15:08+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | cbf63a29bd3f; working tree `0d9b65e6fb5d` | 5303 ms |
| 2026-08-30T16:15:14+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | cbf63a29bd3f; working tree `af03ab17312a` | 5884 ms |
| 2026-08-30T16:15:39+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | cbf63a29bd3f; working tree `904b007982f9` | 24079 ms |
| 2026-08-30T16:15:45+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | cbf63a29bd3f; working tree `de1c17ee1b26` | 5246 ms |
| 2026-08-30T16:15:45+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | cbf63a29bd3f; working tree `dfd0f674d7f1` | 87 ms |
| 2026-08-30T16:17:37+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | cbf63a29bd3f; working tree `f42e94af778c` | 111268 ms |
| 2026-08-30T16:17:37+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `1e0d1dabd1d0` | 38 ms |
| 2026-08-30T16:17:37+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `a291e1c81117` | 91 ms |
| 2026-08-30T16:17:38+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | cbf63a29bd3f; working tree `a2cd52e68a65` | 97 ms |
| 2026-08-30T16:24:49+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | cbf63a29bd3f; working tree `42a95458164d` | 2447 ms |
| 2026-08-30T16:24:51+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | cbf63a29bd3f; working tree `ab97ebce9f81` | 2519 ms |
| 2026-08-30T16:25:03+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | cbf63a29bd3f; working tree `655b038dc5ee` | 11320 ms |
| 2026-08-30T16:25:05+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | cbf63a29bd3f; working tree `3d2f4601cabb` | 2242 ms |
| 2026-08-30T16:25:06+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | cbf63a29bd3f; working tree `80603736a19c` | 59 ms |
| 2026-08-30T16:26:17+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | cbf63a29bd3f; working tree `341d8b91d32f` | 71035 ms |
| 2026-08-30T16:26:17+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `be85d9cd5676` | 34 ms |
| 2026-08-30T16:26:17+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `10861c09f989` | 85 ms |
| 2026-08-30T16:26:18+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | cbf63a29bd3f; working tree `c9a4702454cb` | 80 ms |
| 2026-08-30T16:33:32+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | cbf63a29bd3f; working tree `0d107fa4f309` | 2317 ms |
| 2026-08-30T16:33:34+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | cbf63a29bd3f; working tree `6b88f39431a4` | 2042 ms |
| 2026-08-30T16:33:43+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | cbf63a29bd3f; working tree `ab3f77d66dcd` | 8117 ms |
| 2026-08-30T16:33:45+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | cbf63a29bd3f; working tree `2dba50a8c736` | 1945 ms |
| 2026-08-30T16:33:45+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | cbf63a29bd3f; working tree `790cb209d9f0` | 39 ms |
| 2026-08-30T16:34:44+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | cbf63a29bd3f; working tree `4324d4bab2c1` | 58404 ms |
| 2026-08-30T16:34:44+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `8bbd86797267` | 22 ms |
| 2026-08-30T16:34:44+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `d7dac45a24b0` | 62 ms |
| 2026-08-30T16:34:44+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | cbf63a29bd3f; working tree `3a19c566543d` | 51 ms |
| 2026-08-30T16:45:35+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | cbf63a29bd3f; working tree `678e4a450796` | 9046 ms |
| 2026-08-30T16:45:45+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | cbf63a29bd3f; working tree `657d1383b3a0` | 8898 ms |
| 2026-08-30T16:46:25+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | cbf63a29bd3f; working tree `3fd7937715b7` | 39645 ms |
| 2026-08-30T16:46:33+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | cbf63a29bd3f; working tree `46219e6e1ea9` | 7001 ms |
| 2026-08-30T16:46:34+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | cbf63a29bd3f; working tree `6058d2a32518` | 148 ms |
| 2026-08-30T16:49:22+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | cbf63a29bd3f; working tree `446ffc92a885` | 167897 ms |
| 2026-08-30T16:49:23+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `3fb729d63c96` | 71 ms |
| 2026-08-30T16:49:24+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | cbf63a29bd3f; working tree `e188de5c724e` | 128 ms |
| 2026-08-30T16:49:24+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | cbf63a29bd3f; working tree `7fa87e8a086f` | 115 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| 1. Complete, offline, deduplicated current-request projection | verified | Projection and visible-list tests cover offline answer rows, duplicate IDs, and archive filtering. |
| 2. Permission precedence, retained reasons, deterministic ordering | verified | Feature tests retain all reasons; list tests cover permission > answer > unread, mixed completed-permission state, activity/ID ordering, and pin immunity. |
| 3. Localized visible/accessibility text and safe unsupported explanation | verified | Every locale supplies Review/Answer action text; all row variants include it in visible and accessibility status copy; projection remains metadata-only and unsupported explanations remain reachable. |
| 4. Navigation-only valid exact focus | verified | Resolver validates current source/version, then the destination resolves current provider or legacy communication join keys to actual transcript message IDs; route versions accept only canonical decimal safe integers. |
| 5. Every stale/invalid case safely falls back with zero effects | verified | Route/parser and resolver coverage rejects non-string, empty, whitespace, non-canonical, changed, missing, NaN, fractional, negative, and oversized versions; inspection finds no response or state-write operation. |
| 6. Open resolves nothing; synchronization removes resolved source | verified | Missing-source reprojection/focus tests return general; list and route code contain no request mutation. |
| 7. Exclusions and disabled-feature compatibility | verified | Disabled row policy suppresses structured reason/action/focus across all three renderers while ordinary list placement and legacy state presentation remain; no Goal, terminal, provider, protocol, or notification code changed. |

## Accepted baseline gaps

The user explicitly accepted these exact baseline gaps on 2026-08-30 so the
Issue #70 candidate can proceed through review and finish. This acceptance does
not cover any new failure:

- Baseline Studio test gap: the verified base commit fails 15 assertions in
  `StudioMarkdownOptions.test.ts`, `studioRichTextWiring.test.ts`, and
  `ToolViewStudioPresentation.test.ts`. The candidate does not modify their
  implementation or tests. Consequence: the repository-wide Happy App suite
  is not globally green, while the Issue #70 focused suite, App typecheck, and
  its candidate-owned wiring test pass.
- Baseline workflow fixture gap: the verified base commit fails
  `test_committed_merge_auto_detects_second_parent_as_source` and
  `test_committed_merge_preserves_explicit_first_parent_source` with stale
  structured-check / non-canonical ACTIVE projection errors. The candidate
  does not modify workflow runtime code. Consequence: the full workflow
  runtime suite is not globally green; workflow state upgrade, validation,
  validation tests, and strict repository audit pass.

## Failure diagnosis

- Latest pre-review candidate run: structured run
  `7d707cfd-0dbc-420b-9506-3855e6f8ec8b`, 9 configured groups, 2 failed;
  these were exactly the user-accepted baseline command indexes 2 and 5.
- Candidate-owned regression: `activeSessionRuntimeStatusWiring.test.ts` still
  asserted the pre-feature waiting-color source expression. Its expectation now
  preserves the same waiting behavior while allowing current request status to
  own the reason color; its expanded row-policy wiring suite passes 5/5.

## First whole-diff review and remediation

- Capable Spec and Standards axes independently reviewed fixed candidate
  `0af48ada3b400c3252584ac6eb220b6f05fe3c3c4bce34efba0dcf173a31cd12`.
- Both blocked it on disabled-setting presentation/navigation leakage; Spec
  additionally found provider tool join keys were not transcript message IDs
  and that localized Review/Answer affordance text was absent.
- All findings classify as accepted-contract gaps or a candidate-introduced
  rollback regression. They were remediated without expanding provider,
  protocol, response, Goal, terminal, or workflow-baseline scope. Reviewers
  reported no non-blocking follow-up candidates.
- Baseline control: an archive of
  `cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a` in
  `/tmp/happy-issue70-base.FIfR5k` reproduced all remaining 15 Studio failures
  and both workflow fixture failures without any Issue #70 files.

## Second whole-diff review and remediation

- Capable Spec and Standards axes independently reviewed fixed candidate
  `a1f92231fbe2356df9829c331f6daedcef0ef9dafb3ef657c156cd79facebee6`.
- Both found the same candidate-caused fail-closed gap: route-boundary
  `Number(...)` coercion could turn blank, whitespace, hexadecimal, or other
  non-canonical strings into a valid version and authorize exact focus.
- The continuation right-sizing reassessment kept the same accepted slice: one
  pure parser seam, route wiring assertion, and no new dependency or remainder.
- The parser now accepts only runtime strings containing canonical non-negative
  decimal safe integers and rejects arrays or other non-string route values;
  second-review remediation passes 8 files / 90 tests, App typecheck, and
  `git diff HEAD --check`; later candidate-bound checks and final review passed.

## Third whole-diff review and remediation

- Capable Spec and Standards axes independently reviewed fixed candidate
  `9b614de04d633a8765737d08acbcf2e61ecebce1823a26633099de05a1f77b36`.
- Spec accepted the complete contract with no blocking or non-blocking finding.
- Standards found one candidate-caused criterion-2 gap: stale legacy
  `permission_required` state could override an answer-only current projection
  after the permission request was completed, distorting severity order.
- Priority now trusts a present projected primary reason and falls back to the
  legacy permission state only without a projection. Projection and list
  regressions cover the mixed completed-permission / pending-answer snapshot.
- Third-review remediation passes 8 files / 92 tests, App typecheck, and
  `git diff HEAD --check`; later candidate-bound checks and final review passed.

## Fourth whole-diff review and remediation

- Capable Spec and Standards axes independently reviewed fixed candidate
  `b5b5f47b424a1d937fff25e9ba15da2f51b5b2ade2770f0ae1b6d283b734f664`.
- Standards accepted the complete candidate with no blocking or non-blocking
  finding. Spec found one accepted-contract compatibility gap: older supported
  inline forms without explicit `toolUseId` did not reuse the established
  communication-ID transcript join key and therefore fell back to general.
- Explicit tool IDs remain authoritative and fallback forms retain their
  banner/modal target. Only older inline forms use communication ID, and exact
  scroll still requires a current transcript message whose `callId` matches.
- Fourth-review remediation passes 8 files / 93 tests, App typecheck, and
  `git diff HEAD --check`; the subsequent final check and fifth review passed.

## Fifth whole-diff review — accepted

- Capable Spec and Standards axes independently reviewed final candidate
  `9c71abfd827e390a551eb08fd3de6654cb9261d79c66d9c145028c39dc4c14a6`.
- Both accepted the complete diff with no blocking or non-blocking finding.
- They confirmed every prior remediation, the App-only/no-response boundary,
  setting rollback, strict stale-state validation, projected severity, and the
  bounded older-inline-form join behavior.
- The two accepted baseline command failures remain reproduced and unrelated;
  no candidate-owned gap remains.

## Sixth whole-diff review — final accepted candidate

- Capable Spec and Standards axes independently reviewed exact candidate
  `13dde813971b5434ad3906841052ce7d22bba48f197290e9e3957d29bf754c7a`
  and diff `2e35bb0ee255c3c67e76a27e37faaf66b91ba8f596e3e60c5b6db17691a638b2`.
- Both accepted the complete staged candidate with no blocking or non-blocking
  finding. Standards found no correctness, regression, security/privacy,
  architecture, maintainability, rollback, verification, or repository-rule
  violation.
- Exact-candidate run `7d707cfd-0dbc-420b-9506-3855e6f8ec8b` passed seven of
  nine commands; only the two explicitly accepted and base-reproduced command
  groups failed. No candidate-owned gap remains.
