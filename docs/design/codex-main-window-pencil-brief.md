# Pencil Brief — Happy Studio Main Window

Status: accepted by the user on 2026-08-12. This accepts the visual direction;
individual product-code slices still require separate proposal approval and
post-build visual acceptance.

## Source Type

reference-app

## Design Intent

Settle the first design-stable Happy Desktop main conversation screen using
Codex as the primary visual reference while preserving Happy's product structure
and neutral `Studio` identity. This pass must make the shell, sidebar density,
message measure, tool result, and composer visually reviewable before code.

## Target Screens / States

- One populated light-mode desktop main conversation at exactly 1470×870 pt.
- Sidebar includes global navigation, three project groups, several sessions,
  one selected session, and a fixed account footer.
- Conversation includes assistant prose, one compact user bubble, one tool/status
  summary, one bordered tool-result card, message actions, and an empty composer.
- Out of scope: dark mode, empty/new chat, modal, command palette, popover,
  settings, loading/error, streaming, hover/focus, side chat, and responsive sizes.

## Inputs

- Product contract: `docs/specs/codex-visual-theme.md`
- Tasks: `docs/tasks/codex-visual-theme-tasks.md`
- Consumer adoption: `docs/design/system/studio-desktop-adoption.md`
- Reference package: `/Users/myartings/workspace/reference-app-assets/apps/macos/codex-desktop/`
- Reference visual system: `/Users/myartings/workspace/reference-app-assets/apps/macos/codex-desktop/design-system.md`
- Reference component spec: `/Users/myartings/workspace/reference-app-assets/apps/macos/codex-desktop/screen-component-spec.md`
- Private lossless reference screenshot: `/Users/myartings/Sync/reference-app-assets/raw/macos/codex-desktop/screenshots/codex-main-current.png`

## Reference Strength

high-fidelity for perceptual/structural layout; style-inspired for Happy-specific
content and controls; no pixel-parity claim.

## Visual Direction

- Neutral white main canvas and near-white sidebar.
- Approximately 275 pt sidebar, 46 pt header, and 750 pt centered reading measure.
- Compact 30–32 pt session rows with fill-only selected state and about 8 pt radius.
- Ordinary assistant output is unboxed; user message is a compact right-aligned
  subtle-gray bubble; tool result uses one thin bordered 12 pt rounded container.
- Composer is roughly 750×108 pt, 20 pt radius, bottom anchored, and the only
  persistent surface with a broad restrained shadow.
- Typography is neutral proportional sans, compact in navigation, comfortable in prose.
- Use blue only for interactive references; preserve semantic green/red/status colors.
- Overall feeling: precise, calm, dense enough for professional work, never card-heavy.

## Required Components

- `DesktopShell`
- `StudioSidebar`
- `GlobalNavItem` default state
- `ProjectGroup` expanded state
- `SessionRow` default and selected variants
- `ConversationHeader`
- `AssistantMessage`
- `UserMessageBubble`
- `ToolStatusRow`
- `ToolResultCard`
- `MessageActions`
- `StudioComposer` empty state with attachment, agent/mode, model, voice, and send controls
- `AccountFooter`

## Content Examples

- Product label: `Studio`
- Projects: `happy`, `ios-coding-template`, `knowledge-base`
- Selected session: `Refine desktop visual system`
- Assistant content: concise design-review summary with a short bullet list.
- User bubble: `先按这个方向出一版设计图`
- Tool status: `Updated 2 files · 18s`
- Tool result files: `theme.ts` `+24 −6`; `SessionView.tsx` `+12 −3`
- Composer placeholder: `Ask Studio to make changes…`
- Account: `yb Miao`

## Constraints

- Packaged desktop client only; no mobile or standalone web design.
- Preserve Happy's information architecture and functional affordances.
- Do not use Codex/OpenAI logos, names, icons, screenshots, or proprietary assets inside the design.
- Use original/simple vector icons and generic system-like glyphs.
- Do not introduce large gradients, glass effects, dark navigation rails,
  decorative nested cards, oversized headings, or heavy shadows.
- Screenshot-derived values remain design proposals until user acceptance.
- The design must be implementable in Happy's existing desktop stack without functional redesign.

## Output

- `docs/design/studio-main-window-v1.pen`
- `docs/design/studio-main-window-v1.png`

## Acceptance Criteria

- Canvas is exactly 1470×870 pt and shows the entire packaged desktop window.
- Sidebar/main/header/reading-column/composer proportions visibly follow the approved Codex evidence.
- Happy identity and content are clearly distinct from Codex.
- Assistant prose, user bubble, tool result, and composer have distinct but restrained hierarchy.
- The composer is the most visually elevated persistent component.
- The screen does not look card-heavy or mobile-scaled.
- Text is readable and no component clips or overlaps.
- User can accept or reject this single main-window direction before any code work.
