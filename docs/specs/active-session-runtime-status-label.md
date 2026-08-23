# Active Session Runtime Status Label

## Goal

Make the deterministic runtime status added by `session-runtime-status` visible
on the default compact rows used for active sessions in Happy Desktop.

## Accepted behavior

- Every compact active-session row renders a localized runtime status label.
- Thinking displays Running, waiting displays Idle, a pending permission request
  displays Permission required, and disconnected displays last seen.
- The Idle label uses the same secondary text color as the existing waiting
  indicator; other labels retain their runtime-state colors.
- The label is visible with the default local settings and does not depend on
  the optional active-session runtime metadata setting.
- Existing status-dot, unread-attention, project grouping, and navigation
  behavior remain unchanged.

## Boundaries

- Reuse the existing `SessionRowData.state`, translations, colors, and
  `formatLastSeen` helper.
- Do not change protocol, presence/thinking derivation, persistence, or row
  grouping.

## Verification

- Add a wiring regression test proving the compact row renders all four labels.
- Run the focused test, Happy App typecheck, full applicable App tests, workflow
  checks, and an installed-client smoke.
