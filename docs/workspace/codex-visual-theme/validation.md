# Validation: `codex-visual-theme`

## 2026-08-10 — specification

| Check | Result | Notes |
| --- | --- | --- |
| Visual evidence schema and paths | passed | 8 claims, 1 baseline screenshot, overall quality high |
| `python3 scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption valid |
| `python3 scripts/workflow-audit.py codex-visual-theme --strict --require-active` | passed with expected gaps | Implementation, check, review, and finish gates intentionally remain pending |
| `git diff --check` | passed | No whitespace errors |

No product build, typecheck, or UI runtime was run because this slice changes
documentation and workflow evidence only. Product verification becomes required
when implementation begins.

## 2026-08-10 — hierarchy rewrite

| Check | Result | Notes |
| --- | --- | --- |
| macOS main-window evidence | passed | 8 claims, 1 baseline screenshot |
| cross-platform light evidence | passed | 8 claims, 2 baseline screenshots |
| Windows popover-family evidence | passed | 8 claims, 3 runtime variants plus supporting static evidence |
| `python3 scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption valid |
| `python3 scripts/workflow-audit.py codex-visual-theme --strict --require-active` | passed with expected gaps | Product implementation, check, review, and finish remain pending |
| `git diff --check` | passed | No whitespace errors |
| superseded wording search | passed | Removed the misleading flat/sole-elevation claims and stale popover evidence gap |

The rewritten contract adds no product code. Typecheck, unit tests, runtime
preview, and screenshot comparison remain implementation-phase requirements.
| 2026-08-12 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-12 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-12 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-12 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Preserve Happy functionality and macro layout | verified | Product boundaries and visual acceptance sections prohibit functional or macro-layout changes. |
| Trace exact visual claims to evidence | verified | Evidence model and status-labelled token tables distinguish observed, supported, and candidate values. |
| Keep screenshot estimates qualified | verified | Windows scale caveat, menu-grid measurements, radii, shadows, and interaction values remain explicitly provisional. |
| Keep implementation token-first and Codium-decoupled | verified | Theme model, Happy implementation audit, and implementation sequence define semantic roles without a runtime dependency on `packages/codium`. |
| Define distinct, testable hierarchy levels | verified | Canonical L0-L6 model, adjacency rules, allowed signals, component specifications, and visual acceptance criteria cover persistent regions through modals. |
| Define one adaptive non-blocking popover family | verified | L5 shell and menu requirements specify shared styling, adaptive placement, cross-region occlusion, outside dismissal, and no visible scrim. |

## Remaining gaps

- Product implementation, dark/modal evidence, interaction capture, runtime
  verification, and screenshot comparison are outside this documentation slice
  and remain explicit follow-up work.
