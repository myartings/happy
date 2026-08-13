# Studio Command Palette Density Revision

## Status and target

- Accepted source: user approval after reviewing the packaged Studio screenshot
  `integration-command-palette.png` on 2026-08-13.
- Parent contract: `docs/specs/codex-visual-theme.md`.
- Runtime: packaged Happy Desktop (`Tauri`) with `visualStyle=studio`.
- Visual acceptance: remains pending a new packaged screenshot and explicit user
  approval.

## Scope

Refine the existing Studio Command Palette without changing its information
architecture or behavior:

1. Reduce the maximum palette width from the current 800 pt presentation.
2. Reduce the visible light/dark scrim strength while retaining blocking-modal
   outside-click behavior.
3. Compress the search header, category spacing, command rows, icons, labels,
   and shortcut badges into the accepted desktop density family.
4. Keep all geometry in the Studio overlay presentation seam so Default style,
   standalone Web, iOS, and Android retain their existing metrics.

## Non-goals

- Changing commands, categories, copy, search, keyboard navigation, selection,
  hover, actions, dismissal, animation timing, or focus behavior.
- Changing other floating overlays, sidebar, conversation, composer, semantic
  text, shared theme tokens, routes, persistence, or native projects.
- Claiming an exact Codex modal clone; matched Codex modal evidence is still
  absent.

## Acceptance criteria and evidence

1. Studio Tauri resolves a 640 pt candidate maximum width, compact search and
   row metrics, and a lighter theme-aware scrim. Evidence: pure presentation
   resolver test.
2. Studio metrics remain disabled for Default style, standalone Web, and native
   paths. Evidence: resolver gating tests plus component conditional-style test.
3. Command Palette shell, modal scrim, input, results/category spacing, item,
   icon, label, and shortcut badge consume the Studio metrics. Evidence:
   component wiring test and whole-diff inspection.
4. Existing command data, keyboard/search hooks, callbacks, selection, hover,
   close behavior, and animation timings are unchanged. Evidence: bounded diff
   review and existing focused tests.
5. Existing light/dark Studio colors remain theme-aware and Default metrics are
   unchanged. Evidence: presentation tests and component conditional styles.
6. Focused tests, Happy App typecheck, workflow validation/audit/CI, and
   whole-diff review pass. Evidence: `validation.md` receipts.
7. Visual completion is not claimed until the parent builds the packaged client
   and the user accepts a new screenshot. Evidence: recorded remaining gap.

## Rollback

Remove the new Command Palette metric fields and their Studio-only conditional
component styles; the pre-existing static Default styles remain authoritative.
