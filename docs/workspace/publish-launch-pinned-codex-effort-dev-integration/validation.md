# Validation: `publish-launch-pinned-codex-effort-dev-integration`

Record exact commands and results. Never mark a check passed unless it ran.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-02` | `git diff --check`; unresolved-index and conflict-marker inspection | passed | The sole archive conflict is resolved; no unmerged paths or whitespace errors remain. |
| `2026-09-02` | parent identity and archive-row union inspection | passed | Source `008f90c4`, target `124299f0`, base `1e03026a`; both parent terminal rows occur once in the staged archive. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-02T14:34:49+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 008f90c447c2; working tree `8a81fe194fae` | 3208 ms |
| 2026-09-02T14:34:51+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 008f90c447c2; working tree `98fff55984c9` | 2102 ms |
| 2026-09-02T14:35:02+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 008f90c447c2; working tree `2312be3a9a9d` | 10417 ms |
| 2026-09-02T14:35:04+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 008f90c447c2; working tree `534f14fd76b5` | 1893 ms |
| 2026-09-02T14:35:04+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 008f90c447c2; working tree `7680bf794ecd` | 51 ms |
| 2026-09-02T14:39:23+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 008f90c447c2; working tree `986caac6407a` | 258988 ms |
| 2026-09-02T14:39:23+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 008f90c447c2; working tree `cee95ed8f559` | 33 ms |
| 2026-09-02T14:39:24+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 008f90c447c2; working tree `ee007c1134d3` | 96 ms |
| 2026-09-02T14:39:24+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 008f90c447c2; working tree `030e05114ac6` | 74 ms |
| 2026-09-02T14:46:55+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 008f90c447c2; working tree `268a59b2f34f` | 4706 ms |
| 2026-09-02T14:46:59+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 008f90c447c2; working tree `5549864bf4cc` | 3805 ms |
| 2026-09-02T14:47:22+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | 008f90c447c2; working tree `fb24c1b4b1e5` | 22214 ms |
| 2026-09-02T14:47:27+00:00 | full / test | `pnpm --filter happy-server test` | passed | 0 | 008f90c447c2; working tree `7026100197db` | 4213 ms |
| 2026-09-02T14:47:27+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 008f90c447c2; working tree `2c1a418361cd` | 100 ms |
| 2026-09-02T14:52:30+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 008f90c447c2; working tree `1dcf03534de0` | 302840 ms |
| 2026-09-02T14:52:31+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 008f90c447c2; working tree `1430f42d75dc` | 25 ms |
| 2026-09-02T14:52:31+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 008f90c447c2; working tree `00193d0a51bb` | 396 ms |
| 2026-09-02T14:52:33+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 008f90c447c2; working tree `b2fef2165fc2` | 146 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| INT-001 ordinary two-parent history | verified | Pending merge binds HEAD `008f90c4` and MERGE_HEAD `124299f0`; committed-range CI remains a mandatory post-archive delivery check. |
| INT-002 exact parent archive union | verified | staged archive comparison and marker scan |
| INT-003 no novel inherited product/workflow bytes | verified | Candidate package proves every inherited path comes from one parent; Spec and Standards review found no integration edit outside the accepted lifecycle. |
| INT-004 complete deterministic validation | verified | Fresh corrected-candidate run passed all 9 configured commands; pre-/post-archive staged CI remains in Finish. |
| INT-005 independent same-candidate review | verified | Candidate `819b6f91…`: Spec accepted; Standards accepted with no blocker and one separate resilience follow-up. |
| INT-006 authorized remote delivery | not applicable | External publication follows the archive-introducing commit by workflow rule; push, hosted CI, and PR merge remain mandatory Finish follow-up and are not claimed complete here. |
| INT-007 Issue reconciliation | not applicable | Issue closure can only be observed after PR merge; final GitHub verification remains mandatory Finish follow-up and is not claimed complete here. |

## Remaining gaps

- Non-blocking separate product decision: daemon startup timeout/unavailability
  could retry, surface a clearer terminal error, or permit degraded terminal
  operation. The frozen Issue #103 AC2/AC6 contract requires fail-closed daemon
  projection, so this integration must not absorb that new outcome.
