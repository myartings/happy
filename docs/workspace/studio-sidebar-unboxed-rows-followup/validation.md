# Validation: `studio-sidebar-unboxed-rows-followup`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-13` | revision-2 packaged screenshot inspection | failed reproduction | Contiguous white child rows, outer group radii, and separators visibly reconstruct the card. |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run sources/features/studio-visual-style/studioSidebarGroupPresentation.test.ts` | failed as expected (RED) | Five new tests failed because authoritative style propagation and row-chrome functions did not exist. |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run sources/features/studio-visual-style/studioSidebarGroupPresentation.test.ts sources/features/studio-visual-style/studioSidebarWiring.test.ts sources/features/studio-visual-style/studioVisualStyle.test.ts` | passed | 3 files, 24 tests cover Studio/Default/non-Tauri policy and both host/renderer wiring chains. |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run --reporter=dot` | passed | Complete Happy App family: 114 files, 1123 tests. |
| `2026-08-13` | `pnpm --filter happy-app typecheck` | passed | TypeScript completed without errors. |
| `2026-08-13` | `git diff --check` | passed | No whitespace errors. |
| `2026-08-13` | `validate_visual_evidence.py --record ... --check-paths` | passed | Evidence record valid: 3 claims, 4 evidence items, high overall quality. |
| `2026-08-13` | `python3 scripts/validate-happy-workflow.py` | passed | Selective Happy workflow adoption valid. |
| `2026-08-13` | `python3 scripts/test-workflow-core.py` | passed | 14/14 workflow core tests. |
| `2026-08-13` | `python3 scripts/test-workflow-ci.py` | passed | 14/14 workflow CI tests. |
| `2026-08-13` | `python3 scripts/workflow-audit.py --strict` | passed | Only future review/finish gates remained pending at execution time. |
| 2026-08-13 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-13 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-13 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-13 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Sidebar list inherits authoritative resolved frame style | verified | Policy test plus wiring test covers `SidebarView → MainView → SessionsList`. |
| Ordinary Studio rows have no group-recomposing chrome | verified | Policy asserts no surface/position shape/clipping/divider and zero radius; wiring test covers compact and historical callers. |
| Selected Studio row retains bounded local fill | verified | Policy test asserts selected role, 9-point radius, and no divider. |
| Default and non-Tauri behavior is unchanged | verified | Policy tests retain standalone gating and Default container/position/clipping/divider roles. |
| Failed visible card is absent in packaged result | accepted gap | Parent assignment explicitly delegates rebuild/capture and user review to integration. |

## Whole-diff review

- No blocking correctness, compatibility, security, or maintainability finding.
- The authoritative override is safe because only `SidebarView` supplies it
  from the already runtime-gated `DesktopSidebarFrame`; phone and standalone
  callers omit it and retain the existing resolver.
- Default row style ordering and values are preserved through explicit policy
  roles. Studio wrapper/row chrome changes do not alter content, height, margins,
  callbacks, context menus, navigation, or mobile swipe behavior.
- Remaining uncertainty is perceptual and requires the parent-owned packaged
  screenshot; source/test verification cannot substitute for it.

## Remaining gaps

- No post-fix packaged screenshot exists yet; parent owns this reproduction.
