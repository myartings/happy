# Studio Desktop Visual Convergence Tasks

## Batch 0 — parent-owned shared contract

- [x] Record evidence baseline, compatibility boundary, acceptance criteria,
  fixed rich-text role matrix, file ownership, and integration order.
- [x] Confirm no security/privacy/protocol risk gate is triggered.
- [x] Commit the shared contract before child branches are created (`d54c2fea`).

## Track A — resizable desktop panels

- [x] Add a pure Studio panel-width policy with defaults, clamps, available-main
  protection, drag projection, and reset behavior.
- [x] Add device-local persisted left/right widths with backwards-compatible
  defaults.
- [x] Wire the left persistent drawer and right workspace panel to the policy.
- [x] Add accessible separators, quiet resting state, hover/focus/drag feedback,
  resize cursor, double-click reset, and collapse/re-open restoration.
- [x] Test policy, persistence schema/defaults, and host wiring; run child gates.

Allowed product files: new `features/studio-panel-resize/**`,
`SidebarNavigator.tsx`, `-session/SessionView.tsx`, and the minimum local-settings
schema/default/test files. Blocked: concrete sidebar rows/controls, Markdown,
MessageView, AgentInput, tool presentation, overlays.

## Track B — sidebar density and hierarchy

- [x] Make ordinary Studio Session titles regular/medium and quieter.
- [x] Compress row geometry and metadata rhythm without removing information.
- [x] Convert New Session, Archive, and Todo to transparent resting rows.
- [x] Preserve interaction-state presentation, callbacks, accessibility, and
  all non-Studio paths.
- [x] Test resolver and actual component wiring; run child gates.

Allowed product files: `SidebarView.tsx`, `SessionsList.tsx`,
`ActiveSessionsGroupCompact.tsx`, `ProjectGroup.tsx`, and
`features/studio-visual-style/**` except panel-width ownership. Blocked:
`SidebarNavigator`, `SessionView`, local settings, Markdown, AgentInput, tools,
overlays.

## Track C — conversation rich text

- [x] Add deterministic fixture/role coverage for every accepted construct.
- [x] Extend parser types only for missing accepted constructs such as
  blockquotes and strikethrough.
- [x] Refine Studio light/dark typography, spacing, semantic foregrounds,
  inline/fenced code, tables, quotes, rules, and language/copy chrome.
- [x] Preserve link safety, selection/copy, Mermaid/options/images, tools/diffs,
  and all non-Studio paths.
- [x] Add parser, resolver, and actual renderer behavior tests; run child gates.

Allowed product files: `components/markdown/**`,
`features/studio-semantic-text/**`, `SimpleSyntaxHighlighter` only if necessary,
and bounded MessageView seams/fixture demo data. Blocked: layout, sidebar,
AgentInput, tool execution/presentation, overlays, protocol/storage.

## Parent integration

- [x] Merge A, B, C and resolve only documented ownership-boundary conflicts.
- [x] Run focused and full applicable verification plus whole-diff review.
- [x] Build/sign/install packaged macOS Desktop from the integrated branch.
- [x] Refine packaged-Studio Markdown AI options to a compact 40pt minimum,
  14/20 typography, quieter surfaces, and explicit hover/focus/pressed states;
  preserve option payloads, selection, accessibility compatibility, and every
  non-Studio path.
- [x] Capture the available default geometry and record the accepted limitation
  for resized/dark/rich-fixture states that could not be driven automatically.
- [x] Present the complete batch for user acceptance; adjust failed regions in
  their owning child branch or a bounded follow-up.
- [x] Record user acceptance of the compact options correction and route richer
  execution-transcript semantics to a separate follow-up feature.
- [ ] Archive and merge locally to `dev`; do not push.
