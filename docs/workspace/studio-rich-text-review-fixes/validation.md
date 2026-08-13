# Validation: `studio-rich-text-review-fixes`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/components/markdown/parseMarkdown.test.ts sources/features/studio-semantic-text/semanticTextFixtures.test.ts` | RED, 1 expected failure | Default parser produced a blockquote/strikethrough instead of legacy plain text; 8 other assertions passed. |
| `2026-08-14` | same parser/fixture command after explicit parser option | passed | 2 files, 9 tests; legacy default and enabled Studio extension paths both pass. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/features/studio-semantic-text/studioSemanticTextPresentation.test.ts` | RED, 1 expected failure | Parsed command/path/number/status spans returned only inlineCode/emphasis, proving declared roles were not in production resolution; 6 other assertions passed. |
| `2026-08-14` | same semantic presentation command after conservative classifiers | passed | 7 tests; observable parse-to-role mapping and negative ordinary-prose behavior pass. |
| `2026-08-14` | semantic presentation test after review | RED, 1 expected failure | New parsed-role-to-final-style behavior test failed because composition was still inline in MarkdownView; 7 assertions passed. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/components/markdown sources/features/studio-semantic-text` | passed | Final focused family: 8 files, 35 tests, including real parsed span → roles → concrete presentation styles. |
| `2026-08-14` | `pnpm --filter happy-app typecheck` | passed | No TypeScript errors. |
| `2026-08-14` | `git diff --check` | passed | No whitespace errors. |
| 2026-08-14 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-14 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| 2026-08-14 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-14 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Parsed Markdown commands, paths, numbers, success/error statuses receive their declared roles through the production resolver | verified | `studioSemanticTextPresentation.test.ts` feeds real `parseMarkdown` spans through `resolveMarkdownSpanRoles` and the same `resolveMarkdownSpanPresentationStyles` function consumed by MarkdownView, proving roles plus concrete styles. |
| Ordinary prose is not decoratively classified | verified | Negative parse-to-role behavior returns no roles for unformatted status/path/number-like prose. |
| Blockquote/strikethrough parse only when Studio extensions are explicitly enabled | verified | Parser tests prove default literal output and enabled semantic output. |
| MarkdownView ties the extension option only to packaged Tauri + Studio presentation | verified | Existing runtime resolver tests prove presentation is null for Default/non-Tauri; wiring test proves parser option derives solely from non-null Studio presentation; typecheck passes. |
| No MessageView/tool/diff or other excluded scope changes | verified | Incremental diff contains only Markdown, semantic-text, workflow evidence, and archive bookkeeping. |

## Remaining gaps

- Packaged visual acceptance remains parent-owned after incremental integration.
