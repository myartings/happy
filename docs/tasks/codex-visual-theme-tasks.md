# Codex Visual Theme Tasks

## Plan

- [x] Capture a lossless current Codex Desktop light reference.
- [x] Extract a validated visual-evidence record.
- [x] Inspect Happy theme, typography, appearance settings, and core components.
- [x] Define the low-change visual theme contract.
- [x] Compare macOS and Windows platform chrome.
- [x] Establish a recurring Windows popover family from three runtime examples.
- [x] Rewrite the contract around explicit surface and elevation levels.
- [x] Review and accept the specification.
- [ ] Capture missing dark and interactive Codex states.
- [ ] Implement theme selection and token registration.
- [ ] Apply theme-aware typography and core component mappings.
- [ ] Run deterministic checks and visual comparison.

## Verify

- The specification preserves Happy functionality and macro layout.
- Every exact visual claim is sourced from runtime or static evidence.
- Screenshot-derived estimates are labeled as estimates.
- Proposed interaction and shadow values are not presented as observed facts.
- The implementation plan is token-first and keeps `packages/codium` decoupled.
- Persistent regions, contained content, composer, popovers, and modals have
  distinct and testable hierarchy rules.
- Popovers share one shell, use no visible scrim, and preserve adaptive placement.

## Progress

- 2026-08-10: Light reference and evidence record completed.
- 2026-08-10: Happy theme architecture and core component styles inspected.
- 2026-08-10: Initial visual theme specification authored.
- 2026-08-10: Cross-platform and popover-family evidence incorporated; the
  specification was rewritten around a seven-level hierarchy model.

## Finish

The visual hierarchy specification and implementation plan are accepted as the
completed documentation slice. Product implementation and remaining evidence
capture are deferred to a separate follow-up workflow.
