# Happy Studio Desktop Visual Specification

## Status

- Stage: Codex-led Pencil design in progress; product implementation blocked on human acceptance
- Primary reference: current Codex Desktop main conversation, light appearance
- Supporting reference: Otty Desktop only for restrained, low-noise visual character
- Product target: packaged Happy Desktop on macOS and Windows only
- Change class: optional visual style; no product-function or macro-layout change
- Evidence confidence: Codex evidence is high for the light main-window shell
  and supporting Windows popovers but incomplete for dark appearance,
  modal treatment, and interaction motion

## Intent

Add a selectable, neutrally named `Studio` visual style to packaged Happy
Desktop. Codex is the primary reference because its project/session sidebar,
conversation stream, tool-result surfaces, and composer are structurally close
to Happy. Otty is a supporting reference only for restraint and low visual noise.

Both reference applications are visual evidence only. Happy's remote-agent
purpose, information, navigation, responsive behavior, actions, and workflows
remain authoritative.

The supporting Codex observation is:

> Codex uses quiet component decoration inside an explicit, multi-level spatial
> hierarchy. It is not visually flat; it is low-noise and strongly layered.

Codex evidence is translated rather than cloned: Happy's information density,
actions, remote-agent states, and product identity remain authoritative.
Otty-specific geometry must not override the Codex-led main-window structure.

## Evidence model

### Runtime evidence

The screenshots contain private session text and remain local-only. They must
not be committed.

| Evidence | Environment | What it establishes |
| --- | --- | --- |
| `/Users/myartings/Sync/tmp/codex-reference/codex-desktop-current.png` | macOS, light, known 2x scale | Main shell, sidebar, conversation, user bubble, composer |
| Windows full-window screenshot | Windows, light, unknown scale | Platform chrome, three-pane state, shared content surfaces |
| Windows session metadata popover | Windows, light, unknown scale | Compact floating information surface |
| Windows thread action menu | Windows, light, unknown scale | Long action menu, shortcuts, groups, downward placement |
| Windows account menu | Windows, light, unknown scale | Upward placement, surface translucency, account/action grouping |

The existing records below are the primary Codex evidence. Otty remains
supporting evidence and does not gate Codex-led product-code slices. Each slice
still requires an exact reference/Happy comparison and explicit user approval;
unobserved values remain `unknown`, not inferred from memory.

Validated evidence records:

- `/Users/myartings/Sync/tmp/codex-reference/codex-desktop-visual-evidence.json`
- `/Users/myartings/Sync/tmp/codex-reference/codex-desktop-cross-platform-light-2026-08-10.json`
- `/Users/myartings/Sync/tmp/codex-reference/codex-windows-popover-family-light-2026-08-10.json`

### Supporting static evidence

- `packages/codium/sources/theme/presets.ts` identifies the default UI stack as
  `Geist, Inter` and the code stack as `Geist Mono`, then platform monospace.
- `packages/codium/sources/theme/derive.ts` records a reverse-engineered neutral
  overlay model and a light elevated-primary surface of white at `0.96` alpha.

`packages/codium` is supporting visual evidence. Its runtime must not be coupled
to `happy-app`.

### Evidence precedence

1. Same-environment runtime screenshots control visible color and geometry.
2. Repeated runtime occurrences establish component families.
3. Static evidence resolves facts not provable from pixels, such as the Latin
   font stack, and supports—not replaces—runtime observations.
4. Values without runtime or static evidence are implementation candidates and
   must remain labeled as proposals until Happy comparison screenshots pass.

Windows screenshots have no embedded color profile and use an unknown display
scale. Their measurements remain screenshot pixels and subtle RGB differences
must not be overinterpreted.

## Product boundaries

### Preserve

- Existing route and navigation hierarchy.
- Existing responsive sidebar-width calculation and main-content width.
- Existing session metadata, status dots, project groups, tool calls,
  permissions, diffs, composer actions, side chat, and keyboard shortcuts.
- Existing standalone Web, iOS, and Android appearance and behavior.
- Existing mobile safe-area, minimum touch-target, accessibility, and native
  interaction behavior.
- Existing `adaptive`, `light`, and `dark` appearance behavior.

### May change

- Theme-dependent colors, font families, icon treatment, radii, borders,
  shadows, opacity, and micro-spacing inside existing components.
- Decorative surfaces that can become transparent without removing a usable
  affordance.
- Component styling needed to make hierarchy levels distinct and consistent.
- Platform-specific window and sidebar material when it has a safe opaque
  fallback.

### Must not change

- Feature placement, command behavior, session protocol, or stored content.
- Sidebar/main/side-chat proportions merely to reproduce one screenshot state.
- Happy's information-rich rows by forcing Codex's simpler row geometry.
- Status colors that communicate connection, permission, warning, success,
  destructive actions, or diff semantics.
- Any styling, font loading, selector, or interaction on standalone Web, iOS,
  or Android merely to imitate a desktop reference application.

## Theme model

Visual style and light/dark appearance are independent:

```text
visualStyle: default | studio
appearance:  adaptive | light | dark
```

- Changing `visualStyle` applies immediately and does not alter `appearance`.
- Changing `appearance` does not reset `visualStyle`.
- The choice persists with the same scope as the existing local appearance
  preference.
- `studio` is effective only in identified packaged macOS and Windows clients.
  Standalone Web, iOS, Android, and unknown runtimes resolve to `default` and do
  not expose a Studio selector.
- A development-only Studio light preview may precede dark completion.
- Studio must not be presented as complete until both light and dark appearances
  pass visual verification and the user explicitly accepts them.

## Visual principles

1. **Explicit zones, quiet components.** Large functional regions must remain
   distinguishable even when individual components are visually restrained.
2. **Depth is relational.** A component's level is defined relative to its
   parent and neighbors, not by adding a shadow in isolation.
3. **Each boundary has one primary job.** Background separates zones, hairlines
   define edges, fill contains content, and shadow communicates elevation.
4. **Elevation is scarce.** Persistent elevation belongs primarily to the
   composer; temporary elevation belongs to popovers, menus, and modals.
5. **Signals accumulate with height.** Higher layers may combine surface,
   border, radius, occlusion, and shadow. Lower layers use fewer signals.
6. **No decorative card nesting.** Internal hierarchy should prefer alignment,
   typography, spacing, and sparse dividers over multiple rounded containers.
7. **Platform chrome may vary; content grammar does not.** Windows and macOS may
   differ in backdrop, titlebar, CJK fallback, and system controls while sharing
   conversation, component, and elevation rules.
8. **Function wins over imitation.** Preserve Happy information and controls;
   translate the visual grammar instead of copying Codex functionality.

## Canonical layer model

Studio uses seven conceptual levels. These are semantic surface roles,
not a mandate for seven nested views.

| Level | Role | Purpose | Primary separation | Typical Happy examples |
| ---: | --- | --- | --- | --- |
| L0 | `Backdrop` | Platform/window environment | Native material or fallback color | Window chrome behind app regions |
| L1 | `Canvas` | Primary reading/work surface | Opaque base background | Main conversation, side-chat body |
| L2 | `Region` | Persistent functional zone | Background shift and/or hairline | Sidebar, top toolbar, side-chat boundary |
| L3 | `Contained` | Content grouping within a region | Quiet fill or hairline; no shadow | User bubble, tool result, code block, selected row |
| L4 | `PersistentElevated` | Always-available primary interaction | Surface + border + restrained shadow | Main composer, side-chat composer |
| L5 | `Floating` | Temporary contextual interaction | Near-opaque surface + border + radius + broad shadow + occlusion | Popover, dropdown, action menu, autocomplete |
| L6 | `Modal` | Blocking task or decision | Elevated container and optional scrim | Alert, command palette, sheet |

### Layer adjacency rules

- Adjacent functional zones must differ through at least one stable cue:
  background, hairline, or spatial gap.
- `Contained` surfaces may use fill or border. They should not routinely use
  shadow.
- `PersistentElevated` surfaces may combine border and shadow because their
  persistent action role must remain visible over scrolling content.
- `Floating` surfaces must occlude their parents, may cross region boundaries,
  and must not inherit clipping from the anchor's region.
- Non-blocking `Floating` surfaces do not dim the application. A transparent
  hit-target may close them, but it must not render a visible scrim.
- `Modal` is the only level allowed to dim or otherwise suppress the whole
  application, and its exact Codex treatment remains pending modal evidence.
- A child may rise one or more levels, but ordinary content must not visually
  outrank its parent region or the composer.

### Allowed visual signals by level

| Level | Surface shift | Hairline | Large radius | Shadow | Cross-region occlusion | Scrim |
| --- | --- | --- | --- | --- | --- | --- |
| L0 Backdrop | yes | no | no | no | no | no |
| L1 Canvas | yes | optional structural | no | no | no | no |
| L2 Region | yes | yes | rarely | no | no | no |
| L3 Contained | optional | optional | scoped | no | no | no |
| L4 PersistentElevated | yes | yes | yes | restrained | no | no |
| L5 Floating | near-opaque | yes | yes | broad | yes | no |
| L6 Modal | yes | yes | yes | strongest | yes | optional |

## Light surface and color system

Runtime samples are marked **Observed**. Static or implementation-derived
values are marked **Supported**. Unresolved values remain **Candidate**.

### Shared content colors

| Role | Value | Status | Use |
| --- | --- | --- | --- |
| `canvas` | `#FFFFFF` | Observed on macOS and Windows | Main and side-chat work surfaces |
| `textPrimary` | `#1A1C1F` | Observed on macOS and Windows | Primary text and primary icons |
| `surfaceSubtle` | `#F3F3F4` | Observed on macOS and Windows | User bubble and quiet contained fill |
| `divider` | `#E4E4E5` family | Observed | Persistent structural boundaries |
| `controlBorder` | `#DDDDDE` family | Observed | Composer and necessary control borders |
| `elevatedPrimary` | `rgba(255,255,255,0.96)` | Supported by repeated popovers and static evidence | Floating shell |
| `buttonPrimary` | `#1A1C1F` | Candidate supported by static theme | Primary action fill |
| `buttonPrimaryText` | `#FFFFFF` | Candidate | Text/icon on primary action |

### Navigation and platform chrome

| Environment | Runtime observation | Theme rule |
| --- | --- | --- |
| macOS | Sidebar approximately `#F4F5F6`, visually uniform in the captured state | Use a cool neutral sidebar; platform vibrancy is optional and must be visually verified |
| Windows | Upper sidebar/titlebar approximately `#F0F3F9`; lower area picks up a warm environmental tint | Prefer a Windows backdrop/material adapter when available; use `#F0F3F9` as opaque fallback; do not hard-code the observed warm gradient |

The exact Windows mechanism—Mica, Acrylic, alpha overlay, or another material—is
blocked by still-only evidence. API selection remains an implementation choice,
not a reference fact.

### Selection and state colors

| Role | Value | Status |
| --- | --- | --- |
| macOS selected row | `#E8EAEA` | Observed |
| Windows selected row | `#E5E8EA` family | Observed; spatially variable over backdrop |
| neutral hover | `rgba(26,28,31,0.05)` | Supported by static evidence; interaction capture pending |
| neutral pressed | `rgba(26,28,31,0.10)` | Candidate; interaction capture pending |
| secondary foreground | `rgba(26,28,31,0.70)` | Supported by static evidence |
| tertiary foreground | `rgba(26,28,31,0.50)` | Supported by static evidence |

Selected and hovered navigation rows use fill only: no border and no shadow.
Where a platform backdrop is active, prefer a neutral overlay model over a fixed
opaque selected color.

### Accent discrepancy

Runtime screenshots differ:

- macOS link sample: approximately `#4781CC`
- Windows link sample: approximately `#2E82D2`
- supporting static default: `#339CFF` in the captured reverse-engineered state

Do not promote any one value as a universal cross-platform constant yet. Use a
semantic `accent` role and resolve the final value through matched, color-managed
Happy comparisons. Accent remains reserved for links, focus, selection controls,
and primary interactive emphasis; it is not a decorative icon color.

Semantic success, warning, destructive, permission, connection, and diff colors
remain separate from this neutral hierarchy.

## Typography

### Families

- Latin UI: `Geist`, then `Inter`, then platform sans-serif.
- Code: `Geist Mono`, then `ui-monospace`, `SFMono-Regular`, then platform
  monospace.
- CJK: platform-native fallback after the shared Latin stack. Windows and macOS
  are allowed to differ in Chinese glyph shape, weight, and rasterization.
- Happy logo: Bricolage Grotesque may remain where it is part of brand identity;
  it must not appear in ordinary UI text.

Packaged Desktop may load Geist explicitly after a user-approved typography
slice. Standalone Web, iOS, and Android must not load Studio-specific fonts.

### Scale

| Role | Size | Weight | Line height |
| --- | ---: | ---: | ---: |
| Main body | `14` | `400` | `20` |
| Navigation/action row | `14` | `400` or `500` | `20` |
| Compact metadata | `12` | `400` | `16` |
| Small label | `11` | `500` | `16` |
| Compact heading | `16` | `600` | `22` |
| Page heading | `20` | `600` | `28` |
| Inline/code text | `13` | `400` | `19` |

Use regular for body and menu labels, medium for selected navigation and
controls, and semibold for headings or strong emphasis. Avoid synthetic bold.
Keyboard shortcuts and timestamps use secondary or tertiary foreground rather
than smaller containers.

## Spacing and density

Keep Happy's existing base spacing scale: `4, 8, 12, 16, 20, 24`.

### General rules

- Sidebar horizontal inset: `12–16`, respecting existing structure.
- Compact icon/text gap: `8`.
- Related control gap: `8–12`.
- Message-block vertical gap: `16–20`.
- Section separation: `20–24`.
- Preserve native minimum touch targets when visible fills are smaller.
- Do not hard-code the macOS screenshot's `275pt` sidebar width.
- Do not force Happy's information-rich session rows into the observed Codex
  selected-fill height.

### Floating menu grid

Three Windows instances establish a recurring family. At the unknown Windows
display scale, the two action menus show:

- approximately 50 screenshot pixels per action row;
- icon center approximately 35–37 pixels from the panel edge;
- label start approximately 59–60 pixels from the panel edge;
- section-divider inset approximately 23–24 pixels.

These are proportional evidence, not logical constants. Happy's packaged
desktop renderer currently uses a menu row height of `48` logical units; it may
remain only if the user accepts the matched screenshot. Keep one stable grid
for icons, labels, shortcuts, and submenu chevrons across every popover variant.

## Shape system

| Role | Target radius | Level |
| --- | ---: | --- |
| Inline code / small badge | `4–6` | Contained |
| Compact icon button | `8` | Region/Contained |
| Selected navigation surface | `8` | Contained |
| Ordinary contained panel | `10–12` | Contained |
| User message bubble | `16` | Contained |
| Composer shell | `20` | PersistentElevated |
| Popover/menu shell | `16–18` candidate | Floating |
| Circular control | `50%` | Any appropriate level |

The Windows popover screenshots show approximately 18–20 physical-pixel radii,
but display scale is unknown. Happy must validate the logical `16–18` candidate
instead of copying screenshot pixels.

Large radius is a level signal. Do not apply composer or floating radius to
ordinary grouped rows.

## Borders and shadows

### Border rules

- Structural region boundaries use one hairline.
- Selected and hovered rows use fill only.
- User messages use fill only.
- Contained tools use either a quiet fill or hairline, not both by default.
- Composer and floating surfaces may combine border and shadow because the
  border defines shape while shadow communicates height.
- Floating borders must remain visible over both white canvas and tinted
  sidebar backdrops.

### Shadow roles

| Role | Evidence-backed behavior | Candidate implementation |
| --- | --- | --- |
| `none` | Sidebar, header, selected row, messages, ordinary tools | No shadow |
| `persistent` | Composer is visibly lifted but quieter than menus | `0 6 20 rgba(0,0,0,0.08)` |
| `floating` | Popovers show a broad, soft, neutral shadow; strongest below, no colored halo | `0 8 24 rgba(0,0,0,0.10)` |
| `modal` | Not yet captured | Keep separate; do not infer from popovers |

Exact source offsets, blur radii, and opacity are not available from screenshots.
Candidates must be tuned against matched captures.

## Iconography

- Use monochrome outline icons in ordinary navigation, toolbar, and menu states.
- Visible glyph target: `16–18`; optical slot: `28–32`.
- Default stroke target: approximately `1.5` where the library permits it.
- Resting icons use primary, secondary, or tertiary foreground.
- Do not add colored tiles behind ordinary menu or navigation icons.
- Preserve semantic color for warning, destructive, permission, connection,
  success, and diff status.
- Initial implementation may retain Ionicons to minimize scope, but it must use
  outline variants and consistent optical sizing.

## Component specifications

### App shell — L0 to L2

- Main conversation and side-chat bodies use `Canvas`.
- Sidebar uses a platform-adapted `Region` surface.
- Main/side-chat and sidebar/main boundaries use a single hairline.
- No ambient shadow separates persistent regions.
- Windows native title/menu controls remain platform chrome; they are not copied
  to macOS.
- Side chat is a stateful Happy feature and does not define a platform-default
  third-column proportion.

### Sidebar — L2 with L3 selection

- Default rows are transparent over the region surface.
- Hover uses a quiet neutral overlay; selection uses a stronger quiet overlay.
- Selected rows have radius `8`, no border, and no shadow.
- Top actions should read as quiet controls rather than persistent white cards
  where affordance remains clear.
- Preserve project labels, session metadata, status dots, git state, archive
  actions, keyboard hints, and scrolling behavior.
- Active anchor controls may gain a subtle contained fill before a menu opens,
  creating `Region → ActiveAnchor → Floating` depth.

### Header and toolbars — L2

- Header surface follows its parent region: canvas over main content and region
  surface over the sidebar.
- Prefer a bottom hairline to elevation.
- Toolbar icons use transparent resting backgrounds and quiet hover/pressed
  fills.
- Keep existing Happy title, path, avatar, navigation, and actions.

### Conversation — L1 with L3 content

- Agent messages remain unbubbled on the canvas.
- User messages use `surfaceSubtle`, radius `16`, and no border or shadow.
- Message columns are separated from the canvas through width and whitespace,
  not an outer card.
- Inline code uses a quiet contained fill and radius `4–6`.
- Reactions and metadata use secondary/tertiary hierarchy.

### Tool calls, diffs, and code — L3

- Outer tools use a quiet fill or hairline without persistent shadow.
- Nested sections use alignment, typography, and sparse dividers before adding
  another container.
- Preserve code and diff semantic colors.
- Avoid colored icon tiles and large tinted headers unless color communicates
  state.
- An expanded tool may grow spatially, but it does not become `Floating` unless
  it leaves normal content flow.

### Composer — L4

- Use a white or near-white shell in light appearance.
- Radius `20`, control hairline, and restrained persistent shadow.
- Keep every Happy action, attachment, permission, model, effort, voice, and
  submit state.
- Secondary icon controls remain transparent at rest with neutral hover/pressed
  fills; the primary action may use the primary button surface.
- Preserve current responsive width and positioning. Do not copy the measured
  macOS `738 x 105pt` geometry as a fixed layout constant.
- Side-chat composer repeats the same level and component grammar at a narrower
  width.

### Popover and menu family — L5

All non-blocking contextual overlays should consume one shared floating shell.
Variants may change content, width, height, and placement—not surface language.

Required shell behavior:

- `elevatedPrimary` near-opaque surface;
- continuous neutral hairline;
- floating radius candidate `16–18`;
- broad neutral floating shadow;
- no visible full-window scrim;
- no pointer arrow unless future evidence establishes one;
- ability to cross region boundaries without clipping;
- collision handling and automatic upward/downward placement;
- transparent outside hit-target for dismissal;
- consistent content padding and optical alignment.

Required menu behavior:

- one stable icon, label, shortcut, and submenu-chevron grid;
- regular-weight primary labels;
- secondary shortcuts, timestamps, and chevrons;
- group dividers only between semantic sections, not after every row;
- no nested row cards or icon tiles;
- destructive color only for destructive actions;
- active anchor remains visible beneath the floating layer.

Observed variants:

- compact metadata popover with title, timestamp, project, and branch;
- long thread action menu with shortcuts and submenu chevrons;
- account menu with account summary, grouped actions, and upward placement.

### Modal, palette, and sheet — L6 provisional

- Modal treatment remains a separate tier from popovers.
- Do not reuse a popover shadow unchanged for a large command palette.
- A visible scrim is allowed only when interaction is genuinely blocking.
- Current hard-coded command-palette colors and strong shadow must become
  theme-aware before Studio is considered complete.
- Final radius, scrim opacity, and shadow require matched Codex modal evidence.

### Settings and grouped lists — L2/L3

- Packaged Desktop may expose a separate visual-style choice: `Default` and
  `Studio`; unsupported runtimes expose no Studio entry.
- Keep `Automatic`, `Light`, and `Dark` as the appearance choice.
- Grouped settings may remain contained, but should use no shadow in the Studio
  style; rely on shared background, outer radius, and internal dividers.
- A theme preview should communicate region, selection, text, and accent without
  introducing a new settings layout.

## Interaction states

### Observed

- Active ellipsis trigger uses a quiet rounded fill below its menu.
- Popovers automatically open above or below anchors based on available space.
- Non-blocking popovers leave the background undimmed.

### Candidate pending matched captures

- Hover: 5% primary-ink overlay.
- Pressed: 10% primary-ink overlay.
- Focus: `2px` accent ring with `2px` offset on packaged Desktop.
- Transition: `120–160ms` for color/opacity; no decorative bounce.
- Disabled: reduce foreground contrast without lowering an entire composite
  below accessible text contrast.

Opening/closing motion, hovered rows, keyboard focus, and nested submenu motion
remain evidence gaps and must not be described as reference facts.

## Happy implementation audit

The specification maps to existing seams and identifies current hierarchy drift.

| Happy surface | Current evidence | Studio requirement |
| --- | --- | --- |
| `theme.ts` / Unistyles | Semantic colors exist, but no independent visual-style dimension | Add Studio variants without coupling to reference-app runtime code |
| `SidebarView` / session rows | Multiple bordered white controls and rounded containers | Move ordinary navigation toward Region + fill-only selection |
| `AgentInput` | Already uses a large rounded shadowed shell | Tune to PersistentElevated rather than redesigning structure |
| `SessionActionsPopover` desktop renderer | Visible 12% full-window scrim, no Web border, divider after each item | No visible scrim, floating hairline, semantic group dividers |
| `FloatingOverlay` desktop renderer | Radius `12` and small `3.84` shadow radius differ from session menu | Consume the same shared Floating shell |
| `ItemGroup` desktop renderer | Uses a small elevation/shadow | Contained group with no shadow |
| `CommandPalette` | Hard-coded white, border, and strong `0.25/40` shadow | Theme-aware provisional Modal tier |
| suggestion rows | Some icons use circular filled tiles | Monochrome outline grid without decorative icon tiles |
| side-chat panel | Own canvas, tabs, and composer already form separate regions | Preserve structure; align surfaces and shared composer hierarchy |

This audit authorizes no product-code change by itself. Implementation still
follows the repository workflow and must preserve existing behavior.

## Human-gated implementation loop

Implementation is deliberately serial and cannot be treated as a batch plan.
For every visible change:

1. Capture or identify one bounded Otty reference state and the matching current
   Happy Desktop state.
2. Propose exactly one visible improvement, including scope, non-goals, and the
   state that will be shown for acceptance.
3. Wait for explicit user confirmation before changing product code.
4. Create or resume a workflow limited to that accepted item and implement only
   the smallest coherent change needed for it.
5. Build the packaged desktop client and present the resulting state for human
   review. Automated tests are necessary but never substitute for this review.
6. If the user rejects the result, continue adjusting the same item or roll it
   back. Do not introduce a second improvement.
7. Only after the user explicitly says the item passes may the workflow finish
   and the next improvement be proposed.

Theme plumbing may be introduced only when it is the minimum support required
by the currently accepted visible item. Do not pre-build a complete token,
component, or selector system in anticipation of later items. Avoid broad
component rewrites and preserve small integration seams.

## Visual acceptance

### Structural hierarchy

- Sidebar, main canvas, and side chat read as distinct persistent regions.
- Message content reads as belonging to the canvas, not as a page-wide card.
- User bubbles and tool results remain below the composer in visual weight.
- Composer is the primary persistent elevated surface.
- Popovers clearly rise above both regions and composer-adjacent controls without
  dimming the entire application.
- Modals remain visually distinct from non-blocking popovers.

### Surface discipline

- Sidebar, header, selected rows, messages, settings groups, and ordinary tools
  show no unintended shadow.
- Contained surfaces use fill or border without repeated decorative nesting.
- Floating variants share surface, border, radius, shadow, and internal grid.
- Region and floating borders remain visible on both white canvas and tinted
  platform chrome.

### Visual system

- Shared content colors match the runtime samples without warm or branded tint.
- Windows environmental warmth is produced by platform backdrop behavior, not a
  hard-coded theme gradient.
- UI/code fonts resolve through the specified stacks; CJK uses platform fallback.
- Ordinary icons are monochrome, outline-based, and optically consistent.
- Semantic status and diff colors remain understandable.

### Behavior preservation

- Happy layout, information, actions, accessibility labels, keyboard shortcuts,
  and touch targets are unchanged.
- Floating placement still flips above/below and remains within viewport bounds.
- Outside-click dismissal remains available without a visible popover scrim.
- Switching `Default`/`Studio` is immediate and persistent on supported packaged
  Desktop clients only.
- Standalone Web, iOS, and Android remain on Default and expose no Studio entry.
- Existing light/dark/adaptive behavior remains correct.

### Human acceptance gate

- Each result is reviewed in a real packaged desktop client at a named state.
- Approval of a proposal authorizes only that item, not the remaining theme.
- Silence, automated checks, or acceptance of documentation never counts as
  acceptance of a visual result.
- No later item may begin until the user explicitly accepts the current result.

## Open evidence work

1. Capture matched macOS and Windows dark appearances.
2. Capture sidebar and menu hover, pressed, and keyboard-focus states.
3. Capture an open nested submenu.
4. Capture popover opening/closing motion.
5. Capture a true blocking modal or command palette.
6. Capture matched tool-call and diff surfaces.
7. Resolve the cross-platform accent discrepancy through color-managed matched
   captures.

These gaps block claims about exact dark values, modal elevation, motion, and a
universal accent constant. They do not block a scoped light hierarchy preview.

## Delivery boundary

This contract reset and its linked task plan are the only deliverables for the
current workflow. Product implementation remains blocked until the user accepts
this document, reviews one proposed visual item, and explicitly authorizes that
single item.
