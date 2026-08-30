# Validation: `restore-personal-features-sync-guard`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/utils/personalFeaturesSettingsWiring.test.ts --reporter=dot` | RED: failed 4/4 | Missing visible entry, route, dedicated module/keys, and Developer Tools delegation. |
| `2026-08-30` | `bash devtools/tests/happyctl-refresh-guards-smoke.sh` | RED: exit 127 | Failed at the intended missing `validate_personal_feature_surface` guard. |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/utils/personalFeaturesSettingsWiring.test.ts sources/utils/flatSessionListPreferenceWiring.test.ts --reporter=dot` | passed 6/6 | GREEN for the dedicated surface, delegation, protected keys, and existing flat-list runtime seam. |
| `2026-08-30` | `bash devtools/tests/happyctl-refresh-guards-smoke.sh` | passed | GREEN for intact surface, missing route, missing Settings entry, missing protected keys, and sync-function invocation. |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/utils/personalFeaturesSettingsWiring.test.ts sources/utils/flatSessionListPreferenceWiring.test.ts sources/sync/localSettings.test.ts sources/utils/flatSessionList.test.ts --reporter=dot` | passed 25/25 | Nearest UI wiring, persistence/default, and flat-row suite. |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed with no errors. |
| `2026-08-30` | `bash -n devtools/happyctl devtools/tests/happyctl-refresh-guards-smoke.sh && git diff --check` | passed | Shell parsing and whitespace checks passed. |
| `2026-08-30` | `for test_script in devtools/tests/*.sh; do bash "$test_script"; done` | passed 6/6 scripts | Layout, signing, official baseline, refresh guards, iOS release, and main-push guard smoke families passed. |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run --reporter=basic` | failed 15; passed 1630 | Three unrelated pre-existing Studio test files fail on stale rich-text wiring and `marginVertical` expectations; none of their production/test files are changed by this task. |
| `2026-08-30` | Repository workflow checks | passed 4/4 commands | Recorded by `workflow-check.py --only check --record`; no command failures. |
| `2026-08-30` | Focused 25-test suite + refresh guard smoke + Happy App typecheck after guard hardening | passed | Refactor rerun confirms mutable-hook binding checks and always-visible entry ordering remain green. |
| `2026-08-30` | `bash -c 'source devtools/happyctl help >/dev/null; HAPPY_REPO="$PWD"; validate_personal_feature_surface'` | passed | Guard validates the actual working tree, not only fixtures. |
| 2026-08-30 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-30 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-30 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-30 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Settings exposes Personal Features without Developer Mode | verified | Focused wiring test checks the entry before the Developer-only section |
| Dedicated screen owns every protected switch using existing keys | verified | Focused wiring test covers all 13 keys; source inspection confirms one module owner |
| Developer Tools delegates instead of duplicating controls | verified | Focused wiring test rejects the old inline Flat Session List control and key binding |
| Sync guard accepts the intact surface | verified | Positive smoke fixture passed |
| Sync guard rejects each missing invariant | verified | Missing route, Settings entry, and protected-key negative fixtures passed |
| Guard runs before push/build/install | verified | Smoke inspection confirms `sync_patch_stack_locally` invokes the guard; callers push/build only after it returns |
| Existing Flat Session List runtime wiring remains | verified | Focused regression plus local-settings and row-building suites passed |

## Risk controls

- Preconditions: clean repository; final patch-stack branch checked out; local
  merge completed; guard runs with no network dependency.
- Stop condition: any missing surface invariant returns non-zero before
  `push_patch_stack`, desktop build, install, or launch.
- Interruption/retry: failure may leave an unpushed local merge for inspection;
  repair the tree and rerun validation before synchronization.
- Rollback: revert the code-only change; no persisted values or schemas change.
- Blast radius: personal `dev` integration and local desktop refresh only;
  official `main` product equivalence remains unchanged.

## Remaining gaps

- The complete Happy App suite has 15 unrelated baseline failures in
  `ToolViewStudioPresentation.test.ts`, `StudioMarkdownOptions.test.ts`, and
  `studioRichTextWiring.test.ts`. This task changes none of those tests or their
  production dependencies; targeted/nearest tests, typecheck, all devtools
  smoke tests, and workflow checks pass.
