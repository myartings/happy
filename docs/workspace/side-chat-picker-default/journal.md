# Journal: `side-chat-picker-default`

## `2026-08-12`

- Started workflow.
- Traced automatic creation to `getSideChatQuickPanelToggleAction`, which
  returns `create` when the quick sidebar is collapsed with zero side sessions.
- Chose to reuse the existing `FilesSidebar` null-active-panel picker.
- Added session-local picker visibility, changed the empty toggle decision from
  `create` to `pick`, and kept existing-session restore/collapse behavior.
- Targeted tests, full Happy App tests, and app typecheck passed.
- User authorized commit, push, integration into `dev`, and desktop installation.
