# Studio Conversation Layout

## Status

Accepted for implementation as the first parallel conversation-layout batch on
2026-08-13. Visual acceptance remains a separate human gate after the packaged
desktop screenshot is available.

## Scope

Apply the accepted Studio v2 main-window geometry to the existing Happy
conversation region without changing its functional map, message semantics, or
mobile presentation.

This batch owns only:

- the packaged-desktop Studio conversation header geometry;
- the centered scrolling conversation column and its surrounding whitespace;
- a Studio-owned pure resolver and deterministic tests.

## Requirements

1. Activation is limited to the Tauri desktop runtime when the resolved visual
   style is `studio`. Default, standalone web, iOS, and Android retain their
   existing layout.
2. The Studio header is a quiet full-width 54 pt region with 20 pt horizontal
   padding and the existing title, navigation, connectivity, and action
   behavior unchanged.
3. The Studio scrolling message viewport is centered and capped at 832 pt so
   the existing 16 pt message insets yield the accepted 800 pt content measure.
4. The first message begins below the header with a 28 pt breathing interval;
   the newest content retains 16 pt of bottom breathing room before the
   separately-owned composer region.
5. Existing target-message navigation, inverted-list anchoring, pagination,
   scroll callbacks, virtualization, tool grouping, and message rendering are
   unchanged.
6. The implementation must not modify semantic text components, composer,
   sidebar, overlays, menus, settings, mobile chrome, session protocol, or data.

## Acceptance Criteria

- AC1: Pure resolver tests prove Studio geometry is returned only for Tauri +
  Studio and Default geometry preserves existing null/unchanged values.
- AC2: `ChatHeaderView` applies the resolved Studio header height and padding
  without changing its child controls or native path.
- AC3: `ChatList` applies the resolved 832 pt centered content container, 28 pt
  header gap, and 16 pt bottom gap without changing scroll behavior.
- AC4: Focused tests, Happy app typecheck, workflow checks, and whole-diff review
  pass.
- AC5: A packaged 1470×870 screenshot is presented to the user; only the user
  may accept or reject visual parity.

## Rollback

Revert the feature commit. The Default resolver path is intentionally a no-op,
and no persisted data or protocol is introduced.
