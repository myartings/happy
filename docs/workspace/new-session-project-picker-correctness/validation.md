# Validation: `new-session-project-picker-correctness`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/utils/workspaceProjectDiscovery.test.ts sources/sync/ops.workspaceProjects.test.ts` | pass | 2 files, 20 tests; unified Recent/Workspace search, ranking, displayed Recent names, preview recovery, stale/cache behavior, and optional App RPC parameters. |
| `2026-08-30` | `pnpm --filter happy exec vitest run --project unit src/workspace/workspaceProjectScanner.test.ts src/api/apiMachine.workspaceProjects.test.ts` | pass | 2 files, 9 tests; outermost-root scan and query-before-cap RPC behavior. |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | pass | TypeScript completed with no errors. |
| `2026-08-30` | `pnpm --filter happy typecheck` | pass | TypeScript completed with no errors. |
| `2026-08-30` | `pnpm --filter happy test` | pass | CLI build plus complete unit family: 93 files and 873 tests passed. |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run --silent --reporter=json` | fail (unrelated baseline) | 1,630/1,645 tests passed. The 15 failures are confined to four untouched Studio/settings wiring files; none imports or exercises this feature. Exact files are listed under Remaining gaps. |
| `2026-08-30` | `CI=1 pnpm --filter happy-app web`; `agent-browser open http://localhost:8081/new`; open Project picker; DOM measurement and screenshot | pass | Search input measured 682 px in a 734 px row with `flex: 1 1 0%`; complete `Search projects` placeholder was visible. Browser and Metro were closed afterward. |
| `2026-08-30` | privacy-safe local `listWorkspaceProjects` scan of the conventional workspace root | pass | 59 outermost projects, no truncation; bounded `happy` query returned 2 matches and no truncation. No paths or result set were recorded. |
| `2026-08-30` | `python3 scripts/validate-happy-workflow.py` | pass | Selective workflow adoption valid. |
| `2026-08-30` | `python3 scripts/test-workflow-core.py` | pass | 14 tests passed. |
| `2026-08-30` | `python3 scripts/test-workflow-ci.py` | pass | 14 tests passed. |
| `2026-08-30` | `git diff --check` | pass | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Browser DOM measurement (682/734 px) and screenshot smoke. |
| AC2 | verified | `workspaceProjectDiscovery.test.ts`: matching sixth Recent item is the visible collapsed result. |
| AC3 | verified | Ranking regression covers exact, prefix, substring, relative-path, and absolute-path-only matches. |
| AC4 | verified | Picker condition renders `no matching projects` only when both filtered sections are empty; browser smoke confirms the integrated screen renders. |
| AC5 | verified | Scanner nested-package fixture returns only the recognized outer monorepo. |
| AC6 | verified | Scanner query-before-cap fixture recovers the otherwise third project with a cap of two. |
| AC7 | verified | Loader tests cover Machine/query cache isolation and same-Machine stale query rejection; App integration uses a 250 ms debounce. |
| AC8 | verified | Empty-query App RPC test preserves `{}` requests; existing unavailable/invalid-response loader tests pass; manual and Recent UI paths remain mounted. |
| AC9 | verified | Selection/spawn code is untouched; path normalization tests in the focused App file and both package typechecks pass. |
| AC10 | verified | Targeted App/CLI suites, App/CLI typechecks, and complete CLI unit family pass. |

## Remaining gaps

- The repository-wide App suite is not fully green because of 15 failures in
  untouched files: `flatSessionListPreferenceWiring.test.ts`,
  `ToolViewStudioPresentation.test.ts`, `StudioMarkdownOptions.test.ts`, and
  `studioRichTextWiring.test.ts`. The failures concern a missing settings file
  and pre-existing Studio style/wiring expectations; the changed Project picker
  files pass their complete focused suites. Consequence: feature acceptance is
  evidenced, but this branch cannot claim a globally green App test baseline.
