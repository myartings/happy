# Validation: `codex-initial-permission-mode-sync-dev-integration`

## Incremental evidence

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-04` | focused five-file Vitest run | passed, 92 tests | Covers both conflict intents. |
| `2026-09-04` | `pnpm --filter happy typecheck` | passed | Post-resolution CLI typecheck. |
| `2026-09-04` | `pnpm --filter happy test` | passed, 103 files / 1045 tests | Post-resolution full CLI suite. |
| `2026-09-04` | focused stale-route test before production fix | failed as expected, 1 failed / 13 passed | RED proved the previous confirmed route survived pending reconnect metadata. |
| `2026-09-04` | focused three-file Vitest run after production fix | passed, 74 tests | GREEN clears stale route while preserving permission revision and launch behavior. |
| `2026-09-04` | `pnpm --filter happy typecheck` after remediation | passed | Post-remediation CLI typecheck. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-04T09:42:45+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 910097e4f453; working tree `62e47f307f64` | 20212 ms |
| 2026-09-04T09:42:53+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 910097e4f453; working tree `188d715b0156` | 7983 ms |
| 2026-09-04T09:43:37+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 910097e4f453; working tree `a58c95bddaed` | 43944 ms |
| 2026-09-04T09:43:43+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 910097e4f453; working tree `c29d71322845` | 5499 ms |
| 2026-09-04T09:43:43+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 910097e4f453; working tree `2b46c9513d4e` | 61 ms |
| 2026-09-04T09:44:59+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 910097e4f453; working tree `9a0cb5931c90` | 75918 ms |
| 2026-09-04T09:44:59+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 910097e4f453; working tree `d6c99f8cb888` | 34 ms |
| 2026-09-04T09:44:59+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 910097e4f453; working tree `e6585abf0107` | 93 ms |
| 2026-09-04T09:45:00+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 910097e4f453; working tree `5bc013feb90d` | 50 ms |
| 2026-09-04T09:55:05+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 910097e4f453; working tree `8af517d0fd0d` | 7995 ms |
| 2026-09-04T09:55:16+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 910097e4f453; working tree `7145a5862cf6` | 10900 ms |
| 2026-09-04T09:56:13+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 910097e4f453; working tree `5ebe72ce4d47` | 56190 ms |
| 2026-09-04T09:56:22+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 910097e4f453; working tree `b04f4758d275` | 9215 ms |
| 2026-09-04T09:56:23+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 910097e4f453; working tree `8f33cf212a30` | 104 ms |
| 2026-09-04T09:58:09+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 910097e4f453; working tree `acae32fc6c0a` | 106139 ms |
| 2026-09-04T09:58:09+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 910097e4f453; working tree `15cb20a1bb82` | 40 ms |
| 2026-09-04T09:58:09+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 910097e4f453; working tree `dc1b81c17b2c` | 100 ms |
| 2026-09-04T09:58:10+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | failed (1) | 1 | 910097e4f453; working tree `f4d26433fee0` | 732 ms |
| 2026-09-04T09:58:31+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 910097e4f453; working tree `2257568674ce` | 7464 ms |
| 2026-09-04T09:58:40+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 910097e4f453; working tree `001d5be75952` | 9082 ms |
| 2026-09-04T09:59:29+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 910097e4f453; working tree `053639d03e52` | 49207 ms |
| 2026-09-04T09:59:34+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 910097e4f453; working tree `50de1ee47be1` | 4994 ms |
| 2026-09-04T09:59:34+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 910097e4f453; working tree `5852f3f10d78` | 104 ms |
| 2026-09-04T10:00:53+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 910097e4f453; working tree `5e988b8cab16` | 78505 ms |
| 2026-09-04T10:00:53+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 910097e4f453; working tree `5b5d8f44f65b` | 33 ms |
| 2026-09-04T10:00:53+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 910097e4f453; working tree `8412c017acee` | 87 ms |
| 2026-09-04T10:00:53+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 910097e4f453; working tree `3c48a03502c6` | 50 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| INT-001 | verified | Pending merge binds HEAD `910097e4` and MERGE_HEAD `b6a79dbe`; final parent inspection remains a mandatory post-commit check. |
| INT-002 | verified | Target-relative product delta is limited to the accepted eight files; no unmerged entry or conflict marker remains. |
| INT-003 | verified | RED/GREEN proves stale route clearing; focused 74-test remediation suite and full CLI 103-file/1046-test suite pass. |
| INT-004 | verified | Fresh final run passed all 9 configured commands; capable Spec and Standards reviewers accepted candidate `916195c27349…`. |
| INT-005 | not applicable | External publication follows the archive-introducing commit; staged/committed CI, push, hosted checks, PR merge, and local `dev` fast-forward remain mandatory Finish follow-up and are not claimed complete here. |

## Remaining gaps

- No product gap remains. Archive, committed CI, and authorized remote delivery remain ordered Finish actions.
