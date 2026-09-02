# Validation: `codex-permission-mode-latest-dev-integration`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-02` | App focused Vitest command | passed | 38/38 across message metadata, session mode resolution, and Codex-first wiring. |
| `2026-09-02` | CLI focused Vitest command | passed | 87/87 across initial metadata, live permission control, runtime-confirmed route, resume, and serialization. |
| `2026-09-02` | `pnpm --filter happy-app typecheck` | passed | Exit 0. |
| `2026-09-02` | `pnpm --dir packages/happy-cli typecheck` | passed | Exit 0. |
| `2026-09-02` | archive overlay preflight | passed | Empty error list after target-first exact parent union. |
| `2026-09-02` | first two staged workflow CI attempts | diagnostic failures | First exposed archive ordering plus novel-byte requirements; second confirmed archive fixed and only the required merge-local workflow remained. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-02T06:23:14+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 4bb475d82148; working tree `55721e17affa` | 13359 ms |
| 2026-09-02T06:23:22+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 4bb475d82148; working tree `2944e736df1f` | 7484 ms |
| 2026-09-02T06:23:41+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 4bb475d82148; working tree `6abc920b5541` | 18360 ms |
| 2026-09-02T06:23:54+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 4bb475d82148; working tree `666de5d56b9a` | 11750 ms |
| 2026-09-02T06:23:55+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 4bb475d82148; working tree `9da2e08e41d9` | 157 ms |
| 2026-09-02T06:36:31+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 4bb475d82148; working tree `c71f87fd883e` | 755750 ms |
| 2026-09-02T06:36:32+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 4bb475d82148; working tree `dbc65005716a` | 109 ms |
| 2026-09-02T06:36:33+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 4bb475d82148; working tree `868a937c6795` | 312 ms |
| 2026-09-02T06:36:34+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 4bb475d82148; working tree `e22f3728583f` | 171 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| MI1 | verified | No unmerged paths or conflict markers; staged whitespace check passed. |
| MI2 | verified | Archive overlay function returned no errors. |
| MI3 | verified | App 38/38, CLI 87/87, App/CLI typechecks pass. |
| MI4 | verified | Both capable review axes found no new authorization/routing behavior; target `Metadata` block is exact and `runCodex.ts` is the clean parent union. |
| MI5 | accepted gap | Full staged check 7/9 with only explicitly accepted unchanged command 2/3 gaps; Spec and Standards accepted candidate `cb4c3101…`. |
| MI6 | verified | Pre-archive readiness is complete; archive, ordinary two-parent commit, non-force push, GitHub checks, and PR merge proof are intentionally sequenced next. |

## Remaining gaps

- Terminal staged/committed workflow CI, push, and PR merge remain.
