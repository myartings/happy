# Studio Desktop Design Adoption — Codex Main Window

## Scope

This is the consumer-side adoption decision for the first Happy Desktop Pencil
design. It covers one populated light-mode main conversation at 1470×870 pt.
It does not authorize implementation.

## Evidence

- Producer package: `/Users/myartings/workspace/reference-app-assets/apps/macos/codex-desktop/`
- Visual system: `design-system.md`
- Screen/component contract: `screen-component-spec.md`
- Validated evidence: `visual-evidence/main-conversation-light.json`
- Review baseline: private Shared Directory screenshot referenced by the package

## Adopt

| Codex observation | Happy design decision |
| --- | --- |
| ~275 pt project/session sidebar | Use 275 pt at the 1470 pt reference canvas; preserve Happy responsive rules later |
| ~46 pt compact conversation header | Use a quiet 46 pt main header with Happy's existing actions |
| ~740–750 pt centered reading measure | Use a 750 pt conversation and composer measure |
| ~260×30 pt active session row | Use compact 30–32 pt rows with low-contrast fill-only selection |
| Assistant prose is mostly unboxed | Remove decorative outer cards from ordinary assistant messages in the design |
| Surfaces reserved for user/tool/composer | Keep containers only where they clarify speaker, tool state, or interaction |
| Composer is primary elevation | Use one rounded, softly elevated bottom composer; minimize other persistent shadows |
| Near-neutral white/gray hierarchy | Use white canvas, near-white sidebar, and neutral contained surfaces |

## Adapt

- Keep Happy's project/session metadata, status signals, tool calls, permissions,
  diffs, model state, and remote-agent actions even when Codex is simpler.
- Keep the neutral product label `Studio`; do not introduce Codex branding.
- Allow Happy's composer controls to differ in count and labeling while matching
  Codex's hierarchy and density.
- Use Happy-owned icons and fonts. Match visual metrics, not proprietary assets.
- Treat macOS outer chrome as system-owned; Windows chrome will use its own adapter.

## Reject

- Codex-specific global navigation destinations and copy.
- Any functional relocation solely to match the screenshot.
- Copying Codex icons, assets, fonts, branding, or packaged source.
- Otty's 220 pt terminal sidebar, 9 pt terminal content inset, and terminal-specific canvas layout.
- Dark-mode, hover, focus, motion, and responsive assumptions without evidence.

## Accepted Light Tokens for Implementation Proposals

These values were accepted with the first Pencil design on 2026-08-12. They may
be used only inside separately approved implementation slices; acceptance here
does not authorize a batch implementation.

| Role | Proposal |
| --- | --- |
| canvas | `#FFFFFF` |
| sidebar | `#FCFCFC` |
| selectedRow | `#EFF0F0` |
| containedSubtle | `#F3F3F4` |
| textPrimary | `#1A1C1F` |
| textSecondary | `rgba(26,28,31,0.70)` |
| divider | `#E4E4E5` family |
| composerBorder | `#DDDDDE` family |
| rowRadius | 8 pt |
| toolCardRadius | 12 pt |
| composerRadius | 20 pt |
| sidebarWidth | 275 pt at reference canvas |
| headerHeight | 46 pt |
| readingMeasure | 750 pt |
| sessionRowHeight | 30–32 pt |
| composerHeight | 108 pt |

## Acceptance Boundary

The Pencil PNG must be reviewed by the user before any code work. Acceptance of
this adoption note does not imply acceptance of the rendered design.

The user accepted `studio-main-window-v1.png` on 2026-08-12. The next gate is
approval of exactly one bounded product-code proposal.
