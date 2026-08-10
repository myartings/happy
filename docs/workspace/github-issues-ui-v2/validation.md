# Validation: `github-issues-ui-v2`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-10` | Session-panel revision review | passed | User approved the Codex-style Session quick popover → right-workspace Issues tab model; full-route desktop composition is superseded. |
| `2026-08-10` | revision `validate-happy-workflow.py`, `test-workflow-core.py`, and `git diff --check` | passed | Selective workflow validation passed, all 14 workflow-core tests passed, and revised specification/task/evidence documents have no whitespace errors. |
| `2026-08-10` | `git diff --check` | passed | Approved spec, task plan, and Workspace evidence have no whitespace errors. |
| `2026-08-10` | `python scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption is valid. |
| `2026-08-10` | `python scripts/test-workflow-core.py` | passed | 14 workflow-core tests passed. |
| `2026-08-10` | `python scripts/workflow-audit.py github-issues-ui-v2 --strict --require-active` | passed with expected planning gaps | Acceptance and decisions passed; future scoping, risk, implementation, check, review, and finish gates remain pending. |
| `2026-08-10` | scoping assessment | passed | Feature scope, contracts, allowed/blocked paths, serial execution plan, test seams, and tracker boundary recorded in `decisions.md` and `execution-plan.md`. |
| `2026-08-10` | risk assessment | passed with controls | Repository mismatch, draft safety, Triage gating, irreversible delete, auth/error preservation, and official-behavior controls recorded in `decisions.md`. |
| `2026-08-10` | `git switch -c myartings/github-issues-ui-v2` | passed | Created from `dev` at `974b3daccccc73aa66be7a113c6ed423156c214c`; planning changes preserved. |
| `2026-08-10` | `python scripts/workflow-state.py ready github-issues-ui-v2 implementation` | passed | Acceptance, decisions, scoping, and required risk receipts permit implementation. |
| `2026-08-10` | final planning `python scripts/validate-happy-workflow.py` and `python scripts/test-workflow-core.py` | passed | Selective workflow validation passed and 14 workflow-core tests passed after scoping records. |
| `2026-08-10` | final planning `git diff --check` | passed | Scoping, risk, execution-plan, and branch records have no whitespace errors. |
| `2026-08-10` | final planning strict audit | passed with expected future gaps | Only implementation, check, review, and finish remain pending. |
| `2026-08-10` | focused T1 `vitest` RED/GREEN cycles | passed | Seven presentation-contract behaviors were each introduced with a failing focused test before implementation; observed failures were missing export/behavior or an unsafe unconditional Triage task, followed by focused passes. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run sources/features/github-issues` | passed | 7 files and 37 tests passed, including existing Device Flow, transport, CRUD, repository, and screen contract tests. |
| `2026-08-10` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed with no errors after the T1 Interface exports. |
| `2026-08-10` | implementation `git diff --check` | passed | T1 product and workflow changes have no whitespace errors. |
| `2026-08-10` | implementation `python scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption remains valid after T1. |
| `2026-08-10` | `python scripts/workflow-audit.py github-issues-ui-v2 --strict --require-active` | passed with expected future gaps | T1 is complete within the active implementation phase; feature-level implementation, check, review, and finish gates remain pending. |
| `2026-08-10` | focused T2 `vitest` RED/GREEN cycles | passed | Twelve focused failures established cache invalidation, exact path isolation, fetch-only evidence, URL normalization, local persistence, resolver delegation, picker interaction/fallback, Manage access, remembered selection, and safe manual association before their implementations passed. |
| `2026-08-10` | first T2 `pnpm --filter happy-app typecheck` | failed as expected during integration | The new entry input required optional identity properties; the public input contract was corrected and the subsequent typecheck passed. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run sources/features/github-issues sources/sync/localSettings.test.ts` | passed | 11 files and 62 tests passed, including Device Flow, CRUD, presentation, repository resolution, picker, Session entry, and device-local schema tests. |
| `2026-08-10` | final T2 `pnpm --filter happy-app typecheck` | passed | TypeScript completed with no errors after repository resolver and picker integration. |
| `2026-08-10` | T2 `git diff --check` | passed | T1/T2 product and workflow changes have no whitespace errors. |
| `2026-08-10` | T2 `python scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption remains valid after T2. |
| `2026-08-10` | final T2 `python scripts/workflow-audit.py github-issues-ui-v2 --strict --require-active` | passed with expected future gaps | T1/T2 are complete within the active implementation phase; feature-level implementation, check, review, and finish gates remain pending. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run sources/features/github-issues sources/sync/localSettings.test.ts` | passed | 12 files and 70 focused tests passed for repository resolution, list/detail/create, Device Flow, CRUD, dispatch, settings schema, and accessibility states. |
| `2026-08-10` | `pnpm --filter happy-app typecheck` | passed | All route, feature Module, local settings, and translation catalog changes typecheck. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run` | passed | 106 files and 1052 Happy App tests passed, including Project Todos and browser-isolation regressions. |
| `2026-08-10` | `pnpm --filter happy-server typecheck` | passed | Server types remain unaffected. |
| `2026-08-10` | `pnpm --filter happy-server test` | failed outside feature scope | 94/95 passed; existing local attachment download test returned 404 instead of 200. Focused rerun reproduced it; no server files changed. |
| `2026-08-10` | workflow validation/core/CI | passed | Selective workflow validation passed; core and CI each passed 14 tests. |
| `2026-08-10` | `happy-manager.ps1 build-desktop` | passed | Expo export, GitHub App identifier embedding, Tauri resource embedding, Rust build, MSI, and NSIS checks passed. |
| `2026-08-10` | `happy-manager.ps1 update-desktop` | passed | Backed up and replaced Happy dev; installed executable hash matches the new build artifact. |
| `2026-08-10` | `happy-manager.ps1 verify-desktop` | passed | Installed version 0.1.0 launched from the expected path and passed process verification. |
| `2026-08-10` | installed-window visual inspection | passed with bounded evidence | Happy dev rendered normally and visibly exposed the Issues entry; automated component tests supply deeper list/detail/create evidence. |
| `2026-08-10` | Android `assembleRelease` with JDK 17, all ABI and `x86_64` | unavailable | Online emulator and device detected, but Ninja failed on React Native generated paths over Windows' 260-character limit; no APK or mobile live pass claimed. |

## Superseded full-route acceptance baseline

The evidence below remains valid for the reusable Device Flow, repository,
CRUD, draft, lifecycle, and dispatch foundations. Its desktop composition is no
longer product acceptance after approval of the Session-panel revision.

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 returning list without account UI | verified | Normal list test excludes persistent connection management; Settings-mode test owns connected/removal UI. |
| AC2 Happy-native responsive UI | verified | Native headers, bounded content width, cards, forms, and modal targets passed component/type checks and installed-window rendering. |
| AC3 rich list and preserved refresh | verified | List tests cover metadata and preservation/retry after refresh failure. |
| AC4 repository selection/association | verified | Resolution/cache/picker/entry tests cover normalized evidence and fallback behavior. |
| AC5 detail/lifecycle/delete | verified | Detail tests and client tests cover metadata, close/reopen, capability-gated precise delete confirmation, and errors. |
| AC6 creation and drafts | verified | Repository drafts, failed-create preservation, and record-versus-dispatch success behavior passed. |
| AC7 explicit repository-safe Triage dispatch | verified | Matching path targets, protected draft append, new Session context, and explicit `/triage` task construction passed. |
| AC8 Triage stop/continue behavior | verified | Prompt explicitly preserves repository Triage checkpoint and requests continuation only after Agent-ready outcome; no internal state leaks into UI. |
| AC9 complete state model | verified | Focused connection/Device Flow/no-repo/list/detail/form/error tests passed. |
| AC10 feature/browser isolation | verified | Flag remains default-off, browser exclusion tests and full app regression pass, and official profile API is untouched. |
| AC11 desktop/mobile live acceptance | accepted gap | Windows build/install/launch passed; Android live acceptance blocked before APK by reproducible Windows CMake path-length failure. |

## Session-panel revision acceptance

| Criterion | Status | Required evidence |
| --- | --- | --- |
| AC1 anchored Session popover | pending | Component interaction plus installed Windows visual acceptance |
| AC2 popover to Issues tab | pending | Selection/create transition tests and installed-window acceptance |
| AC3 rich paginated list | pending | Pagination, filter, refresh-preservation, and uncapped-list tests |
| AC4 repository association | reusable, reverify | Existing resolver suite plus per-Session panel-state tests |
| AC5 embedded detail/lifecycle/delete | pending | Embedded component and live Close/Reopen evidence |
| AC6 embedded create/drafts | pending | Embedded form/draft tests and live creation evidence |
| AC7 repository-safe Triage dispatch | reusable, reverify | Existing task tests plus panel-to-composer transition test |
| AC8 Triage stop/continue | reusable, reverify | Existing task contract and repository workflow acceptance |
| AC9 panel coexistence/isolation | pending | Side Session coexistence, close, switch, and repository-leak tests |
| AC10 blocking/error states | pending | Popover/panel/sheet state tests |
| AC11 feature/browser isolation | pending | Feature-off/browser/full-suite regressions |
| AC12 desktop/mobile live acceptance | pending | Windows popover → panel flow and available mobile sheet flow |

## Remaining gaps

- Android live acceptance remains an accepted gap until the native project is
  built from a shorter Windows path or the affected CMake/Ninja path handling is
  fixed.
- The unrelated Happy Server local attachment-download test remains red on this
  Windows checkout (404 versus expected 200); no server files changed.
