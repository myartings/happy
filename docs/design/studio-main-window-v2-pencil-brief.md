# Pencil Brief — Happy Studio Main Window v2

Status: accepted by the user on 2026-08-12. This accepts the visual design only;
each product-code slice still requires separate proposal approval and a second
human acceptance after the packaged desktop result is captured.

## Source Type

reference-app

## Design Intent

Redesign the existing Happy packaged-desktop main conversation with Codex's
validated visual language while keeping Happy's functional map authoritative.
The result may substantially change proportions, density, component geometry,
surface treatment, and micro-layout, but it must not remove, relocate between
major regions, or simplify away Happy functionality.

This is a new exploratory successor to the accepted v1. It does not overwrite
or revoke v1 and does not authorize product-code implementation.

## Target Screens / States

- One populated light-mode packaged macOS desktop conversation at exactly
  1470×870 pt.
- Same functional state represented by the private current-Happy baseline:
  window controls/navigation, new session, archive visibility, Todo entry,
  grouped session list with rich metadata, conversation title/actions, prose,
  command/tool records, online status, permission mode, and full composer.
- Out of scope: settings, empty/new-chat, popovers, modals, command palette,
  side chat, dark mode, hover/focus, responsive variants, mobile, standalone web.

## Inputs

- Product contract: `docs/specs/codex-visual-theme.md`
- Codex adoption: `docs/design/system/studio-desktop-adoption.md`
- Accepted predecessor: `docs/design/studio-main-window-v1.pen/png`
- Current Happy private baseline:
  `/Users/myartings/Sync/tmp/happy-studio-v2/happy-current-window.png`
- Baseline metadata:
  `/Users/myartings/Sync/tmp/happy-studio-v2/happy-current-window.capture.json`
- Codex producer package:
  `/Users/myartings/workspace/reference-app-assets/apps/macos/codex-desktop/`
- Codex private baseline:
  `/Users/myartings/Sync/reference-app-assets/raw/macos/codex-desktop/screenshots/codex-main-current.png`

## Reference Strength

High-fidelity for Codex visual grammar; high-fidelity for Happy functional
coverage; open redesign for component geometry that reconciles both.

## Functional Skeleton — Must Preserve

- Left persistent navigation/session region and right conversation region.
- macOS traffic lights plus existing zen/back/forward navigation area.
- New-session action, archive action/state, Todo/project utility.
- Session grouping and scrolling, selected session, archived/older grouping.
- Each visible session's title plus branch, project/device/provider/status
  metadata represented in a compact but legible hierarchy.
- Conversation title/breadcrumb and existing right-side actions.
- Assistant content, command/tool activity, headings, lists, status and
  permission indicators.
- Bottom composer with text input, settings/permission/attachment controls and
  voice/send affordance.

## Visual Redesign Freedom

- Sidebar may move from Happy's current 360 pt reference width toward
  approximately 300–320 pt if rich session metadata remains readable.
- Session rows may be reduced from the current approximately 88 pt to a
  deliberately compact 58–66 pt family, using two or three restrained text
  lines instead of deleting metadata.
- Header, reading measure, and composer may be re-proportioned to create a
  clearer centered conversation column.
- Cards, borders, radii, padding, icon size, typography, selected states,
  dividers, and shadows may be redesigned boldly using the Codex system.
- Ordinary assistant prose should be unboxed; containers are reserved for
  selection, user content, tools, and interaction.

## Visual Direction

- Quiet near-white sidebar against a white canvas with one hairline boundary.
- Compact navigation and rich session rows; no mobile-sized stacked cards.
- Neutral proportional typography with stronger hierarchy and less synthetic
  bold than current Happy.
- Fill-only selected session, approximately 8–10 pt radius.
- Narrower centered reading measure around 760–820 pt depending on preserved
  Happy controls.
- Command/tool activity presented as compact structured rows, not oversized
  cards; semantic success/warning/diff colors remain intact.
- Composer around 760–820 pt wide and 104–116 pt high, with approximately
  20 pt radius; it is the only persistent elevated surface.
- Preserve Happy product name/content and Happy-owned icons; no Codex/OpenAI
  branding or proprietary assets.

## Required Components

- `DesktopShell`
- `HappySidebar`
- `DesktopNavigationControls`
- `NewSessionAction`
- `ArchiveAction`
- `TodoAction`
- `SessionSectionHeader`
- `RichSessionRow` default, selected, older variants
- `ConversationHeader`
- `AssistantMessage`
- `ToolActivityRow`
- `SectionHeading`
- `OnlineStatus`
- `PermissionMode`
- `HappyComposer`

## Content Examples

Use the current Happy baseline's information density with privacy-safe generic
content. Project/session examples may include `happy`, `ios-coding-template`,
`ai-coding-template`, `main`, `dev`, `macOS`, `Windows`, `Codex`, and status
labels. Do not reproduce private conversation text verbatim.

## Constraints

- Packaged desktop only.
- No functional removal, feature relocation, navigation rewrite, protocol/data
  change, or mobile/standalone-web adaptation.
- Preserve accessible click targets even when visible rows are denser.
- Geometry at 1470×870 is a design reference, not permission to hard-code one
  fixed width in implementation; later code must remain responsive.
- No large gradients, glass-heavy surfaces, dark rails, decorative nested
  cards, or repeated shadows.

## Output

- `docs/design/studio-main-window-v2.pen`
- `docs/design/studio-main-window-v2.png`

## Acceptance Criteria

- Entire canvas is exactly 1470×870 pt with no clipping or overlap.
- A user familiar with Happy can find every named function in its existing
  major region without relearning the product.
- The screen is visibly more Codex-like than current Happy in density,
  proportion, type hierarchy, surface restraint, and composer elevation.
- Rich Happy session metadata remains present and readable after row compaction.
- Sidebar/content/composer proportions feel intentionally redesigned rather
  than merely recolored.
- Ordinary content is not card-heavy; semantic status and diff meaning remain.
- This PNG is presented for explicit human acceptance before any new code proposal.
