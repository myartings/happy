# Validation: `remote-workspace-project-discovery`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-14` | `pnpm --filter happy exec vitest run --project unit src/workspace/workspaceProjectScanner.test.ts` | RED (expected) | Failed because the scanner module did not exist. |
| `2026-08-14` | same targeted scanner command | GREEN, 1/1 | Discovered a marked immediate child with the public result shape. |
| `2026-08-14` | same targeted scanner command | RED then GREEN, 2/2 | Added configured-depth traversal, recognized markers, and deterministic ordering. |
| `2026-08-14` | same targeted scanner command | RED then GREEN, 3/3 | Added skip-directory filtering; max-depth behavior already held. |
| `2026-08-14` | same targeted scanner command | RED then GREEN, 4/4 | Added result limit and truncation signal. |
| `2026-08-14` | same targeted scanner command | RED then GREEN, 5/5 | Added Unity canonical-directory recognition. |
| `2026-08-14` | `pnpm --filter happy exec vitest run --project unit src/workspace/workspaceProjectScanner.test.ts` | passed, 5/5 | Complete T1 targeted suite after refactor. |
| `2026-08-14` | `pnpm --filter happy typecheck` | passed | CLI package typecheck after T1. |
| `2026-08-14` | `pnpm --filter happy exec vitest run --project unit src/api/apiMachine.workspaceProjects.test.ts` | RED then GREEN, 1/1 | Registered optional RPC with daemon-owned conventional root. First cold import exceeded the default test timeout; a 15-second local test timeout exposed the intended missing-handler RED and prevents cold-transform flakiness. |
| `2026-08-14` | `pnpm --filter happy exec vitest run --project unit src/workspace/workspaceProjectScanner.test.ts src/api/apiMachine.workspaceProjects.test.ts` | passed, 7/7 | T1/T2 targeted CLI suite. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/utils/workspaceProjectDiscovery.test.ts` | RED/GREEN tracer bullets, 9/9 final | Proved Windows dedup, Unix case sensitivity, three-field search, stale response rejection, cache, failure fallback, and timeout. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/sync/ops.workspaceProjects.test.ts` | RED then GREEN, 1/1 | Proved empty-parameter optional Machine RPC wrapper. |
| `2026-08-14` | `pnpm --filter happy-app typecheck` | passed | App data layer and New Session integration typecheck. |
| `2026-08-14` | `git diff --check` | passed | No whitespace errors; line-ending conversion warnings are repository/worktree configuration notices. |
| 2026-08-14 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-14 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-14 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-14 | `pnpm --filter happy-server test` | failed (1) | test |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/encryption/blob.test.ts` | passed, 9/9 | The full-suite 1MB blob timeout did not reproduce alone (4.388s under the 5s limit); unrelated concurrency sensitivity. |
| `2026-08-14` | `pnpm --filter happy-server exec vitest run sources/app/api/routes/attachmentRoutes.spec.ts` | failed, 19/20 | Existing local-mode attachment GET expected 200 but returned 404; reproducible and unrelated because this branch changes no Server file. |
| `2026-08-14` | `pnpm --filter happy exec tsx -e <privacy-safe benchmark>` | unavailable | First wrapper used top-level await, unsupported by the command's CJS transform; no scanner result was produced. |
| `2026-08-14` | `pnpm --filter happy exec tsx -e <async privacy-safe benchmark>` | passed | Representative native Windows workspace: 59 projects in 166ms, not truncated; no paths printed. |
| `2026-08-14` | `py -3 scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption valid. |
| `2026-08-14` | `py -3 scripts/test-workflow-core.py` | passed, 14/14 | Used Windows Python launcher because the configured `python3` alias is unavailable. |
| `2026-08-14` | `py -3 scripts/test-workflow-ci.py` | passed, 14/14 | Used Windows Python launcher because the configured `python3` alias is unavailable. |
| `2026-08-14` | `py -3 scripts/workflow-audit.py --strict --require-active remote-workspace-project-discovery` | pass-with-gaps | Only future review and finish gates remain after deterministic checks. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/utils/workspaceProjectDiscovery.test.ts` | RED then GREEN, 10/10 | Review R1: resolved encrypted `{ error }` response now becomes uncached `unavailable`. |
| `2026-08-14` | same targeted discovery command | RED then GREEN, 12/12 | Review R2: Unix and Windows home-relative Recent paths now dedupe against absolute discovered paths. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/utils/workspaceProjectDiscovery.test.ts sources/sync/ops.workspaceProjects.test.ts` | passed, 13/13 | Post-review-fix App target suite. |
| `2026-08-14` | `pnpm --filter happy-app typecheck` | passed | Post-review-fix App typecheck. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run` | failed, 1166/1167 | Post-review-fix full App family; only the unrelated 1MB blob test exceeded its 5-second limit under parallel suite load (6.187s). Discovery tests passed. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/encryption/blob.test.ts` | passed, 9/9 | Immediate isolated reproduction passed; 1MB case completed in 2.431s. |
| `2026-08-14` | `git diff --check` | passed | Post-review-fix whitespace check; only repository line-ending notices. |
| `2026-08-14` | `py -3 scripts/workflow-audit.py --strict --require-active remote-workspace-project-discovery` | pass-with-gaps | Post-review-fix audit; check, review, and finish receipts remain. |
| `2026-08-15` | merge `origin/dev` at `c5d08175` | conflicts resolved | Preserved both PRD documents and all archive rows; retained the newer empty ACTIVE-workflow date. No product-code conflict occurred. |
| `2026-08-15` | targeted CLI scanner/RPC Vitest suites | passed, 7/7 | Post-merge regression in the independent feature worktree. |
| `2026-08-15` | targeted App discovery/RPC-wrapper Vitest suites | passed, 13/13 | Post-merge regression in the independent feature worktree. |
| `2026-08-15` | `pnpm --filter happy typecheck` and `pnpm --filter happy-app typecheck` | passed | Post-merge CLI and App typechecks. |
| `2026-08-15` | workflow validator, core tests, CI tests, and staged workflow CI | passed | Core and CI test scripts passed 14/14 each; staged workflow CI passed. |
| `2026-08-15` | full Happy App Vitest family | failed, one unrelated test | `studioSidebarWiring.test.ts` has a Windows CRLF-sensitive source-string assertion; it fails 1/6 in isolation and both involved files are byte-for-byte the `origin/dev` versions. Workspace Project Discovery tests passed. User accepted this dev baseline gap on 2026-08-16. |
| `2026-08-16` | merge latest `origin/dev` at `33bdd46e` | passed | Integrated the subsequent Studio-desktop-default PR without conflict. |
| `2026-08-16` | targeted CLI scanner/RPC and App discovery/RPC-wrapper suites | passed, 7/7 and 13/13 | Final pre-PR regression after merging the current `origin/dev`. |
| `2026-08-16` | `pnpm --filter happy typecheck` and `pnpm --filter happy-app typecheck` | passed | Final pre-PR typechecks after merging the current `origin/dev`. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | accepted gap | Scanner and RPC tests plus New Session integration prove the deterministic path; the user accepted deferring real daemon/App smoke. |
| AC2 | verified | App data tests match project name, absolute path, and relative path. |
| AC3 | verified | App data tests prove Recent-first dedup with Windows case/slash semantics and Unix case sensitivity. |
| AC4 | accepted gap | New Session integration assigns discovered `selectionValue` as the absolute path and leaves spawn code unchanged; the user accepted the remaining smoke gap. |
| AC5 | verified | Loader tests convert old-daemon/RPC error and timeout to `unavailable`; UI preserves Recent and manual inputs in all states. |
| AC6 | verified | Loader generation test rejects stale Machine results; picker effect resets on Machine/offline/close changes. |
| AC7 | verified | Tests prove markers, deterministic traversal, depth, skips, limit, truncation, missing root, and Unity recognition; inspection confirms traversal only enqueues `Dirent.isDirectory()` entries, never symlinks, and tolerates non-root entry errors while surfacing non-ENOENT root errors. |
| AC8 | verified | Scanner imports directory enumeration/path APIs only and contains no file-content read, shell, process, or Git execution path. |
| AC9 | verified | Passed whole-diff review confirms no Server, DB, Sync Engine, Session protocol, metadata, spawn-shape, or Home Dock changes. |
| AC10 | verified | Targeted CLI/App suites and both package typechecks pass. |
| AC11 | verified | Privacy-safe native benchmark completed 59 results in 166ms without truncation. |
| AC12 | accepted gap | Real daemon/App smoke was explicitly deferred to avoid replacing Happy 1.2.0 and restarting the daemon serving the active session. |

## Remaining gaps

- Full App suite had one unrelated 1MB encryption timeout that passed alone.
- Full Server suite has one reproducible pre-existing attachment GET failure;
  this branch changes no Server file. Accepting this gap allows the workflow to
  continue but does not claim the Server baseline is green.
- Real daemon/App picker smoke was explicitly accepted as a gap by the user on
  2026-08-14 because installing this branch would replace global Happy 1.2.0 and
  restart the daemon serving the active session. Deterministic RPC, loader, and
  picker evidence passes, but end-to-end visual/spawn behavior is not proven.
- Review findings R1 and R2 were fixed with targeted regression coverage and
  the whole-diff re-review passed.
- The post-fix full App family again exposed only the unrelated parallel-load
  1MB blob timeout; its immediate isolated suite passed 9/9 and the user
  explicitly accepted this gap.
- After merging `origin/dev` at `c5d08175`, the full App family exposed one
  unrelated Windows CRLF-sensitive Studio source-string assertion. The test
  and its inspected source file have no feature-branch delta from `origin/dev`,
  the failure reproduces alone, and the user accepted this dev baseline gap on
  2026-08-16.
