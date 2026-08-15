# Validation: `studio-desktop-default`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-15` | `pnpm --filter happy-app exec vitest run sources/features/studio-visual-style/studioVisualStyle.test.ts sources/features/studio-overlays/studioDesktopBuildConfiguration.test.ts sources/sync/localSettings.test.ts` before implementation | failed as expected | Five RED assertions proved the old resolver, local default, and Tauri export behavior. |
| `2026-08-15` | Same focused suite after implementation and compatibility-test addition | passed | 3 files / 29 tests passed. |
| `2026-08-15` | Studio presentation suite across visual style, overlays, conversation, composer, semantic text, tools, and local settings | passed | 17 files / 95 tests passed. |
| `2026-08-15` | `pnpm --filter happy-app exec vitest run --testTimeout=15000` | passed | 139 files / 1255 tests passed before the final additional compatibility assertion; final rerun recorded below. |
| `2026-08-15` | Final `pnpm --filter happy-app exec vitest run --testTimeout=15000` | passed | 139 files / 1256 tests passed, including the persisted legacy Default compatibility assertion. |
| `2026-08-15` | `pnpm --filter happy-app typecheck` | passed | TypeScript graph completed with no errors. |
| `2026-08-15` | `python3 scripts/workflow-check.py --only typecheck --record studio-desktop-default` | passed | Happy App and Happy Server typechecks both passed and were recorded. |
| `2026-08-15` | `python3 scripts/validate-happy-workflow.py && python3 scripts/test-workflow-core.py && python3 scripts/test-workflow-ci.py && git diff --check` | passed | Workflow validation and both 14-test suites passed; diff integrity passed. |
| `2026-08-15` | `python3 scripts/workflow-check.py --only check --record studio-desktop-default` | passed | Four configured workflow checks passed; check gate recorded. |
| `2026-08-15` | `pnpm --filter happy-app exec tauri build --config src-tauri/tauri.dev.conf.json --bundles app --no-sign` | passed | Log showed the exact Studio `cross-env` command, a cache-empty 7282-module Expo export, release compile, and fresh `Happy (dev).app` bundle. |
| `2026-08-15` | Fresh bundle launch plus explicit-window capture | passed | PID 18916 ran from this worktree while installed PID 21174 remained separate; 1470x872pt / 2940x1744px capture visibly shows the Studio shell. |
| `2026-08-15` | Visual-evidence schema validation | passed | Record `happy-studio-desktop-default-fresh-bundle-2026-08-15` valid with 2 claims / 1 baseline reproduction screenshot. |
| `2026-08-15` | Whole-diff semantic review plus final affected presentation tests | passed | No blocking/high/medium finding; misleading preview-override test names were corrected, then 3 files / 21 tests and `git diff --check` passed. |
| `2026-08-15` | `python3 scripts/workflow-ci.py --staged` after archive | passed | Atomic staged product and workflow evidence passed repository CI. |
| 2026-08-15 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-15 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-15 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-15 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-15 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-15 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Tauri always resolves Studio | verified | Resolver tests cover requested and preview Default values; dependent presentation suites pass. |
| Non-Tauri remains Default | verified | Resolver and dependent presentation tests cover non-Tauri requests and preview values. |
| Old settings remain parseable and inert | verified | Local-settings test preserves persisted Default; resolver test proves Tauri ignores it. |
| Production export explicitly embeds Studio | verified | Static configuration test and successful Tauri build log. |
| Default implementation remains present | verified | Product diff changes only central selection policy, compatibility default, and build command. |
| Fresh personal bundle renders Studio | verified | Metadata-backed screenshot and process-path evidence from the newly built worktree bundle. |

## Remaining gaps

- Dark mode and selected-conversation component states were not recaptured because
  the selection policy is centralized and their complete automated suites passed.
- The fresh bundle was launched directly for verification; `/Applications/Happy
  (dev).app` was deliberately not overwritten before integration.
