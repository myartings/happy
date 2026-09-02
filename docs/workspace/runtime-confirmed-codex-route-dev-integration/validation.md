# Validation: `runtime-confirmed-codex-route-dev-integration`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-02` | `pnpm --filter happy exec vitest run --project unit src/daemon/controlServer.test.ts src/daemon/controlClient.test.ts src/persistence.test.ts src/codex/codexRuntimeModelMetadata.test.ts` | passed | 4 files, 67/67 tests; TypeScript build completed. |
| `2026-09-02` | `git diff --check` and conflict-marker scan | passed | No unresolved merge paths, conflict markers, or whitespace errors. |
| `2026-09-02` | parent/index workflow blob comparison | passed | `test-happy-workflow-runtime.py`, `workflow-state.py`, `workflow-ci.py`, and `workflow-check.py` are byte-identical in HEAD, MERGE_HEAD, and the index. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-01T19:03:33+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | b4d182931a5b; working tree `39b401010d2a` | 5509 ms |
| 2026-09-01T19:03:39+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | b4d182931a5b; working tree `ebc0bc03f289` | 5366 ms |
| 2026-09-01T19:04:03+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | b4d182931a5b; working tree `198c25341b5f` | 24208 ms |
| 2026-09-01T19:04:08+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | b4d182931a5b; working tree `d14e52195516` | 4639 ms |
| 2026-09-01T19:04:09+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | b4d182931a5b; working tree `32d65e923ad8` | 90 ms |
| 2026-09-01T19:08:44+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | failed (1) | 1 | b4d182931a5b; working tree `4d4e21574384` | 274642 ms |
| 2026-09-01T19:08:44+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | b4d182931a5b; working tree `b395569dd9fa` | 46 ms |
| 2026-09-01T19:08:45+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | b4d182931a5b; working tree `1ec95f99da95` | 99 ms |
| 2026-09-01T19:08:45+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | b4d182931a5b; working tree `2db50bf2c409` | 96 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Preserve Issue #80 effective-route behavior | verified | Focused Codex metadata and daemon tests passed; independent Spec review accepted candidate `aa11e7fb…`. |
| Preserve PR #95 daemon ownership and legacy stop compatibility | verified | Focused control/persistence tests passed, including the retained empty `/stop` payload case. |
| Limit manual merge bytes to composing both test groups | verified | Conflict inspection and whole-diff review found no product redesign; Spec reported no out-of-contract scope. |
| Complete candidate-bound validation | accepted gap | Full profile passed 8/9 commands; command index 5 reproduced three pre-existing workflow runtime configuration-staleness fixtures with identical workflow blobs. |
| Obtain independent two-axis review | accepted gap | Spec accepted with no findings; Standards found no blockers and two non-binding follow-ups. |

## Remaining gaps

- Accepted check gap: command index 5 fails in three pre-existing merge-workflow
  configuration-staleness fixtures. The relevant workflow blobs are identical
  across both parents and the staged candidate, so this does not reduce product
  confidence for the integration.
- Non-blocking follow-up candidates: clarify the no-op heartbeat persistence
  API/caller semantics; prefer a version-pinned shared launcher-v0.5 parser
  fixture or parity check. Neither is a frozen-contract gap or candidate
  regression, so both remain outside this Slice.
