# Validation: `studio-conversation-layout`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run sources/features/studio-conversation-layout/studioConversationLayout.test.ts` | failed (expected RED) | Resolver module did not yet exist; test failed at the intended missing public seam. |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run sources/features/studio-conversation-layout/studioConversationLayout.test.ts` | passed | GREEN: 1 file, 2 resolver behavior tests. |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run sources/features/studio-conversation-layout/studioConversationLayout.test.ts sources/features/studio-visual-style/studioVisualStyle.test.ts` | passed | 2 files, 15 tests; includes the read-only shared activation seam. |
| `2026-08-13` | `pnpm --filter happy-app typecheck` | passed | TypeScript compilation completed with no errors. |
| `2026-08-13` | `python3 scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption valid. |
| `2026-08-13` | `python3 scripts/test-workflow-core.py` | passed | 14 tests. |
| `2026-08-13` | `python3 scripts/test-workflow-ci.py` | passed | 14 tests. |
| `2026-08-13` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 activation and resolver geometry | verified | 15 focused tests cover Studio, Default, and non-Tauri paths. |
| AC2 header host seam | verified | Whole-diff inspection plus Happy app typecheck; native render branch is unchanged. |
| AC3 scroll-column host seam | verified | Whole-diff inspection plus Happy app typecheck; scroll handlers and virtualization props are unchanged. |
| AC4 deterministic checks and review | verified | Focused tests, typecheck, three Happy workflow checks, diff check, and whole-diff review passed. |
| AC5 human visual acceptance | accepted gap | User explicitly deferred the packaged screenshot and visual decision to the main integration session. |

## Remaining gaps

- Packaged screenshot and human visual acceptance belong to the integration stage.
