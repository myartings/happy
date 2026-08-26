# Validation: `workspace-project-picker-discoverability`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-26` | `pnpm --filter happy-app exec vitest run sources/utils/workspaceProjectDiscovery.test.ts` | RED environment gap | Worktree initially lacked local Vitest; invoking the main checkout's installed Vitest reached the intended failure: `buildRecentProjectPreview is not a function`, while the other 12 tests passed. |
| `2026-08-26` | `pnpm --filter happy-app exec vitest run sources/utils/workspaceProjectDiscovery.test.ts` | passed | GREEN and post-refactor runs passed all 13 tests. |
| `2026-08-26` | `pnpm install --frozen-lockfile` | setup gap | Links and packages were created, but the existing Skia postinstall failed on Windows because it invokes Unix `rm`; lockfile remained unchanged. |
| `2026-08-26` | `pnpm --filter @slopus/happy-wire build` | passed | Generated the ignored workspace package artifacts required for app type resolution. |
| `2026-08-26` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed without errors after the workspace dependency build. |
| `2026-08-26` | `git diff --check` | passed | No whitespace errors; Git only reported existing Windows LF-to-CRLF conversion warnings. |
| `2026-08-26` | `pnpm --filter happy-app exec vitest run` | baseline failures confirmed | Target worktree: 1505 passed and 17 failed across five unrelated model/Studio test files. Running exactly those five files in the clean base checkout at the same commit reproduced all 17 failures (60 passed, 17 failed), proving they are not introduced by this picker change. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Search remains outside the constrained result list | verified | `PathPickerContent` renders the Workspace Projects search and loading/unavailable state before the `ScrollView`. |
| Recent preview is capped and reversible | verified | Targeted test covers eight entries, five-item preview, full expansion, and order preservation. |
| Desktop/web result list scrolls vertically | verified | Embedded list keeps `maxHeight: 176`, adds web `overflowY: auto` and `overscrollBehavior: contain`, and exposes the vertical scroll indicator; type check passed. |
| Existing discovery behavior remains green | verified | All 12 pre-existing tests in `workspaceProjectDiscovery.test.ts` passed alongside the new test. |

## Remaining gaps

- Windows packaged-app visual smoke is outside this code-only slice unless explicitly requested after deterministic checks pass.
