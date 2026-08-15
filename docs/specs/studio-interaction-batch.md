# Studio Desktop Interaction and State Batch

## Goal

Continue the accepted Codex-derived Studio desktop visual redesign through
three state-rich regions while preserving Happy's functional layout and all
existing interaction semantics.

## Scope

1. Tool presentation: command/tool shells, headers, status, errors, diffs, and
   code output inside the existing conversation structure.
2. Composer states: empty, typing, attachment, autocomplete, permission/mode,
   sending, and abort states inside the existing composer footprint.
3. Desktop interaction states: Studio light/dark surfaces plus sidebar and
   overlay hover, focus, selected, and keyboard-navigation presentation.

Only packaged Tauri Desktop using Studio visual style is in scope. Existing
Default, standalone Web, iOS, and Android presentation paths remain unchanged.

## Acceptance criteria

- AC1: Each writer uses an isolated worktree and edits only its exclusive
  product boundary; the integration branch owns merges and screenshots.
- AC2: Tool presentation improves semantic hierarchy without changing tool
  parsing, command execution, expansion, permission, error, or copy behavior.
- AC3: Composer state styling preserves control order, callbacks, keyboard
  semantics, attachment handling, permission/mode choices, send, and abort.
- AC4: Interaction styling preserves selection/navigation behavior and provides
  visible Studio states for light/dark, hover/focus, and keyboard selection
  where the current components expose those states.
- AC5: Every Studio override is packaged-Tauri gated; Default, standalone Web,
  iOS, and Android retain existing values and behavior.
- AC6: Each child passes focused tests, Happy App typecheck, workflow checks,
  and whole-diff review before integration.
- AC7: The integration owner builds, stably signs, recoverably installs, and
  captures real packaged states at a fixed window size. Tests do not constitute
  visual acceptance.
- AC8: The user explicitly accepts or rejects grouped screenshots before the
  integration is merged to local `dev`.
- AC9: No branch pushes to a remote.

## Evidence plan

- Tool presentation: one representative command/tool state plus error or diff
  state when locally reproducible without mutating external data.
- Composer: empty/typing, attachment, and autocomplete or mode surface states.
- Interaction: light and dark Command Palette/sidebar, plus a visible
  selected/focus/hover state supported by deterministic local interaction.
- Deterministic checks: focused tests, full applicable Happy App tests,
  typecheck, workflow validation, staged CI, and whole-diff review.

## Non-goals

- Moving or adding features, routes, commands, or controls.
- Mobile visual redesign.
- Backend, protocol, persistence, authentication, or synchronization changes.
- Declaring the entire application redesign complete after this batch.

## Acceptance record

- `2026-08-13`: The user confirmed the corrected packaged dark Command Palette
  was fixed, accepting the final visual result for this batch.
