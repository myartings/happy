# Studio Desktop Visual Convergence

## Goal

Bring Happy's packaged macOS Studio main window materially closer to the
evidence-backed Codex visual system while preserving Happy's functional
information architecture. Add desktop split-panel resizing and deepen the
conversation's semantic rich-text presentation. Otty is supporting evidence
for native density and code typography; Codex is the primary measurable visual
baseline.

## Baseline and evidence

- Integration base: `b0307c71` (`feature/studio-interaction-batch`).
- Codex baseline: metadata-backed 1470×870pt, 2×, light capture at
  `/Users/myartings/Sync/reference-app-assets/raw/macos/codex-desktop/screenshots/codex-main-current.png`.
- Happy reproduction: packaged 1470×875pt, 2× captures under
  `/Users/myartings/Sync/tmp/happy-studio-interaction-batch-2026-08-13/`.
- Gap audit: `/Users/myartings/Sync/tmp/happy-codex-gap-audit-2026-08-14/`.
- Codex values inferred from screenshots remain estimates, not claimed source
  constants.

## Scope

### A. Resizable desktop panels

- The persistent left navigation and open right workspace panel expose a narrow
  desktop resize affordance in packaged Studio.
- Dragging updates panel width continuously without changing panel function.
- Each side has bounded minimum and maximum width and protects a usable main
  conversation width.
- The last accepted width persists locally, survives restart, collapse, and
  re-open, and is shared across sessions on the device.
- Double-clicking the separator restores that side's default width.
- The resting separator is visually quiet; hover, focus, and dragging expose a
  visible affordance and an appropriate horizontal-resize cursor.
- At 1470pt, the left default is 275pt. The right default may retain a bounded
  Happy-appropriate value because the Codex reference does not provide matched
  right-panel geometry.

### B. Sidebar density and hierarchy

- Ordinary Session titles use regular or medium weight and no longer appear as
  uniformly bold, high-emphasis labels.
- Selection is communicated primarily through the neutral selected surface.
- Happy-only branch, repository, platform, and machine metadata remains
  available but uses tighter vertical rhythm and quieter contrast.
- New Session, Archive, and Todo preserve their actions and order but use
  transparent resting navigation-row grammar instead of persistent outlined
  cards.
- The default left width is owned by the resize-layout slice, not this slice.

### C. Conversation rich-text presentation

- A deterministic fixture covers paragraphs, H1–H6, bold, italic,
  strikethrough, trusted links, nested ordered and unordered lists,
  blockquotes, horizontal rules, inline code, fenced code with language label
  and copy action, tables, commands, paths, numbers, success, warning, error,
  tool output, and diff content.
- Studio maps those meanings to a restrained but visibly differentiated light
  and dark presentation: type size, weight, line height, spacing, foreground,
  contained surfaces, borders, and code typography.
- Color communicates links, code/diff semantics, and state; ordinary prose does
  not become decoratively multicolored.
- Unsupported Markdown constructs are added only when they can be parsed,
  rendered, and tested without changing message transport or stored content.
- Existing link safety, selection/copy, code copy, horizontal scrolling,
  Mermaid, options, images, and mobile behavior remain intact.

## Compatibility boundaries

- Product overrides apply only to packaged Tauri Desktop with Studio selected.
- Default visual style, standalone Web, iOS, and Android retain current values
  and behavior.
- No session protocol, backend, authentication, synchronization, command,
  message persistence, or navigation behavior changes.
- Preserve Happy's functional layout and metadata; do not clone reference-app
  product features or proprietary assets.

## Acceptance criteria

- AC1: Three writer slices use isolated branches/worktrees from the same shared
  Batch 0 commit and remain within exclusive file boundaries.
- AC2: At a 1470pt Studio window, the left panel defaults to 275pt; left and
  right resizing clamp safely, persist, restore after collapse/reopen, and
  double-click reset.
- AC3: Resizing either panel leaves the conversation and Composer usable and
  does not change open/close, navigation, file, issue, or side-chat behavior.
- AC4: Session titles are not bold by default; selected, hover, focus, status,
  metadata, and section hierarchy remain legible in light and dark appearance.
- AC5: Top sidebar actions have transparent resting presentation and preserve
  order, labels, callbacks, keyboard/accessibility semantics, and hit targets.
- AC6: The fixture deterministically exercises every accepted rich-text role
  and its parser/render presentation has focused behavioral coverage.
- AC7: Studio rich text differentiates all accepted roles in light and dark,
  while preserving trusted-link handling, copy/selection, tables, code
  scrolling/copy, tools, and diffs.
- AC8: Every child passes focused tests, Happy App typecheck, workflow checks,
  diff check, and whole-diff review before parent integration.
- AC9: The parent merges in dependency order, runs full applicable checks,
  builds the packaged macOS client, and captures: default geometry; left/right
  resized and reset states; light rich-text fixture; dark rich-text fixture.
- AC10: User visual acceptance happens only after the complete batch is ready.
  No remote push occurs.

## Accepted uncertainty

- Exact Codex internal tokens and Otty SwiftUI constants are unavailable.
- The first candidate uses evidence-backed estimates and requires packaged
  human review rather than claiming pixel identity.
- User-bubble color and Composer shell correction are explicitly deferred to a
  later high-area surface batch.

## Rollback

The parent can revert the integration commit. Each Studio-only feature module
and narrow host seam can also be reverted by child slice without affecting
Default or mobile paths.
