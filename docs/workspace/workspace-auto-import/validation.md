# Validation: `workspace-auto-import`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-01` | `pnpm --filter happy exec vitest run --project unit src/projects/savedProjectRegistry.test.ts` | RED: 1 failed, 11 passed | Intended failure: `registry.importDiscovered is not a function`. |
| `2026-09-01` | same focused registry command | GREEN: 12 passed | Atomic additive import, invalid skip, and idempotency. |
| `2026-09-01` | `pnpm --filter happy exec vitest run --project unit src/api/apiMachine.savedProjects.test.ts` | RED: 1 failed, 3 passed | Intended failure: list handler returned old undefined `registry.list` mock result. |
| `2026-09-01` | same focused RPC command | GREEN: 4 passed | Handler scans trusted workspace and imports returned paths. |
| `2026-09-01` | four focused CLI files | passed: 25 tests | Registry, scanner, Saved Project RPC, and legacy discovery RPC. |
| `2026-09-01` | `pnpm --filter happy typecheck` | passed | TypeScript no-emit check. |
| `2026-09-01` | real `~/workspace` scan into temporary registry | passed | 46 discoveries, 25 unique primary projects, one broken-Git directory safely skipped, not truncated; temporary registry removed. |
| `2026-09-01` | independent Spec review, package `9f4895848234366c` | blocked | WAI-01/WAI-05 RPC result assertions were incomplete. |
| `2026-09-01` | independent Standards review, same package | blocked | Candidate identity was not revalidated after waiting for the registry lock. |
| `2026-09-01` | post-lock removal regression | RED then GREEN | RED persisted one stale project; GREEN skips it and leaves revision 0/file absent. |
| `2026-09-01` | remediated four-file CLI suite | passed: 27 tests | Includes returned imported-project snapshot and empty-workspace unchanged snapshot. |
| `2026-09-01` | remediated `pnpm --filter happy typecheck` | passed | TypeScript no-emit check. |
| `2026-09-01` | same-identity fallback race | RED then GREEN | First alias disappears under lock; surviving source imports once, alias is skipped. |
| `2026-09-01` | final affected-file Vitest suite | passed: 19 tests | Registry and Saved Project RPC behavior, including both lock races. |
| `2026-09-01` | final independent Spec and Standards review | passed | Candidate `35da276e66a30871c34182774b8a6ded91bc461d935203f2dbe623fc855ee2bd`; no blocking findings. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-01T14:04:11+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 5f4404ef6e02; working tree `a465227742bd` | 11016 ms |
| 2026-09-01T14:04:20+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 5f4404ef6e02; working tree `52fd7580d1e0` | 8203 ms |
| 2026-09-01T14:04:42+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 5f4404ef6e02; working tree `e74684e4a773` | 21500 ms |
| 2026-09-01T14:04:47+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 5f4404ef6e02; working tree `117553b548cc` | 4250 ms |
| 2026-09-01T14:04:48+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 5f4404ef6e02; working tree `4955f4e77e12` | 203 ms |
| 2026-09-01T14:21:04+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 5f4404ef6e02; working tree `589b3a8332dd` | 974469 ms |
| 2026-09-01T14:21:05+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 5f4404ef6e02; working tree `d6d6896a3975` | 172 ms |
| 2026-09-01T14:21:07+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 5f4404ef6e02; working tree `c763d6837b0d` | 485 ms |
| 2026-09-01T14:21:08+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 5f4404ef6e02; working tree `c9568d01f167` | 281 ms |
| 2026-09-01T14:31:37+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 5f4404ef6e02; working tree `a93ca3c7a82e` | 15703 ms |
| 2026-09-01T14:31:47+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 5f4404ef6e02; working tree `472ae461cd47` | 9125 ms |
| 2026-09-01T14:32:07+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 5f4404ef6e02; working tree `5d7d542f0d82` | 18547 ms |
| 2026-09-01T14:32:14+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 5f4404ef6e02; working tree `176f969ea86c` | 6703 ms |
| 2026-09-01T14:32:16+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 5f4404ef6e02; working tree `0cb1b4875e5f` | 360 ms |
| 2026-09-01T14:47:12+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 5f4404ef6e02; working tree `d9ded990b11f` | 895125 ms |
| 2026-09-01T14:47:13+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 5f4404ef6e02; working tree `4179962212f1` | 110 ms |
| 2026-09-01T14:47:14+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 5f4404ef6e02; working tree `d92c74ebe494` | 328 ms |
| 2026-09-01T14:47:15+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 5f4404ef6e02; working tree `01ab59036d61` | 218 ms |
| 2026-09-01T15:25:01+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 5f4404ef6e02; working tree `93a6f903123d` | 10250 ms |
| 2026-09-01T15:25:10+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 5f4404ef6e02; working tree `d4e43d6a2d9c` | 8390 ms |
| 2026-09-01T15:25:28+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 5f4404ef6e02; working tree `6d245b583947` | 16890 ms |
| 2026-09-01T15:25:33+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 5f4404ef6e02; working tree `405abe4b5070` | 4062 ms |
| 2026-09-01T15:25:34+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 5f4404ef6e02; working tree `cb7f10750ab7` | 156 ms |
| 2026-09-01T15:41:15+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 5f4404ef6e02; working tree `68c248c77946` | 939828 ms |
| 2026-09-01T15:41:16+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 5f4404ef6e02; working tree `45beec4570d1` | 94 ms |
| 2026-09-01T15:41:17+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 5f4404ef6e02; working tree `c2c36ea0ff95` | 281 ms |
| 2026-09-01T15:41:18+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 5f4404ef6e02; working tree `0f88a1ee24ca` | 250 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| WAI-01 | verified | RPC returns the imported snapshot containing both discovered projects. |
| WAI-02 | verified | Registry GREEN test preserves entry and file bytes on repeated import. |
| WAI-03 | verified | Real Git linked-worktree fixture imports no duplicate primary identity. |
| WAI-04 | verified | Missing candidate skipped; deterministic lock/removal test proves post-lock disappearance cannot persist stale identity. |
| WAI-05 | verified | Missing-root scanner test and empty-discovery RPC test return the unchanged existing snapshot. |
| WAI-06 | verified | Final affected-file suite 19/19 and CLI typecheck passed; protocol schema remains unchanged. |

## Remaining gaps

- Final candidate-bound full check run `904506cd-0144-4b41-9fc2-dbcab98d031f`
  passed 7/9 configured commands. The App and Server test commands retained
  three deterministic failures in paths byte-identical to `origin/dev` and
  outside the CLI-only candidate:
  - App CRLF-sensitive source-string assertion in
    `studioSidebarWiring.test.ts`.
  - Server local attachment fixture expected 200 but received 404.
  - Server local project-avatar fixture expected 200 but received 404.
- The App 1 MB encryption timeout from the broad run passed on focused rerun
  (9/9) and is not retained as a gap.
- The user previously instructed `接受无关缺口并继续评审归档` and explicitly
  disabled repeated authorization prompts in YOLO mode; those instructions are
  applied to the revalidated unchanged baseline gaps above.
- Installed-daemon smoke is performed after finish/archive validation so the
  reviewed source candidate remains frozen.
