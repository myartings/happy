# Journal: `studio-sidebar-unboxed-rows-followup`

## `2026-08-13`

- Started workflow.
- Marked the first implementation's packaged visual verification as failed.
- Visual evidence and static tracing show a split style source: the sidebar
  frame resolves Studio, while `SessionsList` independently resolves row style.
  Both row renderers also compose default position/surface styles before Studio
  overrides, leaving the failure vulnerable to recurrence.
- TDD RED produced five intended missing-policy failures. GREEN added one
  authoritative frame-to-list style resolver and one explicit row-chrome policy.
- `SidebarView → MainView → SessionsList` now carries the resolved frame style.
  Compact and historical rows consume the policy; ordinary Studio rows never
  apply default surfaces/position shapes and use zero radius/no divider, while
  selected rows retain only their bounded fill.
- Focused policy and wiring coverage passes 24/24 tests; typecheck passes.
- Complete Happy App verification passes 114/114 files and 1123/1123 tests;
  all four configured Happy workflow checks pass.
- Whole-diff review found no blocking issue. The frame override is supplied only
  by the runtime-gated SidebarView path; phone/non-Tauri callers omit it. Default
  chrome and all behavioral JSX remain unchanged.
