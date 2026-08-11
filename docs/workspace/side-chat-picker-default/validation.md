# Validation: `side-chat-picker-default`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-12` | `pnpm --filter happy-app exec vitest run sources/utils/sideChatQuickPanel.test.ts` | passed | 1 file, 15 tests passed. |
| `2026-08-12` | `pnpm --filter happy-app typecheck` | passed | `tsc --noEmit` completed successfully. |
| `2026-08-12` | `pnpm --filter happy-app exec vitest run` | passed | 111 files, 1096 tests passed. Expected malformed-protocol stderr fixtures were unchanged. |
| `2026-08-12` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Opening a collapsed quick sidebar with no side sessions shows the existing picker and does not create a session. | verified | Toggle regression expects `pick`; layout regression verifies `pickerOpen` renders the sidebar; `SessionView` no longer calls `createSideChat` from the toggle. |
| Selecting New side chat remains the only empty-state path that invokes the existing creation action. | verified | Existing `FilesSidebar` picker continues to own `onCreateSideChat`; app typecheck passed. |
| Opening with existing side sessions restores the Side Session panel. | verified | Existing-session toggle regression expects `open`; complete app tests passed. |
| Clicking the toggle while the picker or a panel is expanded collapses it without closing sessions. | verified | Expanded toggle regression expects `collapse`; `collapseSidebar` only clears picker/active presentation state. |

## Remaining gaps

- Manual desktop interaction remains to be checked in the installed personal client; installation is outside this request.
