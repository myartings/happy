# Studio Sidebar Unboxed Rows Follow-up Tasks

## Batch 0 — failure evidence and root cause

- [x] Record the failed packaged screenshot as reproduction evidence.
- [x] Trace visual-style resolution from sidebar frame to both row renderers.
- [x] Record the delegated writer boundary and parent-owned integration order.

## Batch 1 — stable row-chrome contract

- [x] Add RED tests for ordinary Studio row surfaces, position radii, clipping,
  dividers, selected local fill, and Default/non-Tauri compatibility.
- [x] Add a pure row-chrome decision consumed by compact and historical rows.

## Batch 2 — authoritative style propagation

- [x] Propagate the resolved sidebar visual style through the narrow host seam
  into `SessionsList`.
- [x] Remove independent sidebar-list style drift while preserving phone and
  standalone paths.

## Batch 3 — verification and return

- [x] Run focused tests, Happy App typecheck/test family, workflow checks, and
  whole-diff review.
- [x] Prepare the archived atomic scope for one local parent cherry-pick commit.
- [ ] Parent reintegrates, rebuilds, captures, and requests user acceptance.
