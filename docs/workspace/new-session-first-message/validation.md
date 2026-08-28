# Validation: `new-session-first-message`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/hooks/useStartSessionFromDraft.test.ts` | RED | New regression failed because the launch returned `true`, cleared, and navigated when enqueue returned `false`. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/hooks/useStartSessionFromDraft.test.ts` | RED | Cancellation regression failed because Start remained blocked while first-message enqueueing was pending. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/hooks/useStartSessionFromDraft.test.ts` | RED | Exception regression failed because an enqueue exception left the empty session running. |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run sources/hooks/useStartSessionFromDraft.test.ts sources/sync/sync.realtimeRecovery.test.ts` | passed | 2 files, 33 tests. Covers success, rejection, exception, cancellation, cleanup, and unavailable-session enqueue result. |
| 2026-08-28 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-28 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| `2026-08-28` | `pnpm --filter happy-app exec vitest run --reporter=dot` | failed (unrelated) | 187 files/1623 tests passed; 5 files/16 tests failed only in untouched Studio/flat-list wiring suites. |
| `2026-08-28` | `git diff --check` | passed | No whitespace errors; Git reported only configured LF-to-CRLF checkout warnings. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Successful enqueue clears and opens | verified | `useStartSessionFromDraft` success test; send precedes navigation. |
| Rejected enqueue preserves draft and cleans up | verified | Hook tests cover `false`, throw, and cancellation; `Sync` test covers a session that never becomes locally available. |
| Dedicated new-session screen follows the same ordering | verified | Whole-diff review plus Happy App typecheck: send result is awaited before clear/navigation and false/throw uses stop → kill → archive cleanup. |

## Remaining gaps

- The repository-wide Happy App suite has 16 unrelated failures in five untouched files: `flatSessionListPreferenceWiring.test.ts`, `ToolViewStudioPresentation.test.ts`, `StudioMarkdownOptions.test.ts`, `studioRichTextWiring.test.ts`, and `studioSidebarWiring.test.ts`. The complete in-scope new-session/sync family passes.
