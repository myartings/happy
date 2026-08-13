# Validation: `studio-main-window-pencil-v2`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-12` | `python3 /Users/myartings/workspace/ios-coding-template/scripts/pencil-design-validate.py --mode changed --root . --path docs/design/studio-main-window-v2.pen` | passed | `OK: 1 changed .pen file(s) passed strict validation` |
| `2026-08-12` | `sips -g pixelWidth -g pixelHeight docs/design/studio-main-window-v2.png` | passed | Review PNG is exactly 1470×870 |
| `2026-08-12` | Pencil `snapshot_layout(parentId: vYaWj, problemsOnly: true)` | passed | No clipping or overlap problems after navigation-width repair |
| `2026-08-12` | `git diff --check` | passed | No whitespace errors |
| `2026-08-12` | `python3 scripts/workflow-audit.py --strict --require-active studio-main-window-pencil-v2` | passed with expected future-gate gaps | Design is awaiting human review; implementation/check/review/finish remain pending |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Entire 1470×870 desktop window is visible | verified | Exact node-only export inspected locally |
| Happy functional map remains in existing major regions | verified | Traffic lights/navigation, new/archive/Todo, grouped rich sessions, header actions, tool activity, status/permission and full composer are visible |
| Codex-led geometry is materially redesigned | verified | 316 pt sidebar, 62 pt rich session rows, 800 pt reading/composer measure and fill-only selection visible in PNG |
| Rich session metadata remains readable | verified | Three-level title, branch/project/device, provider/status/permission hierarchy visible |
| No clipping or overlap | verified | Pencil layout snapshot passed |
| User visual acceptance | verified | User explicitly replied `通过` on 2026-08-12 |

## Remaining gaps

- Product-code implementation was not part of this workflow; accepting v2 does
  not authorize implementation without approval of a bounded proposal.
- The first empty-canvas CLI attempt failed from a transient network reset before
  producing a design file. The successful retry used v1 as a structural input,
  wrote a separate v2, and did not alter v1.
