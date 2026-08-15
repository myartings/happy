# Validation: `studio-rich-text`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-14` | `pnpm install --frozen-lockfile` | passed | Restored isolated-worktree dependencies; initial Vitest attempt was setup drift (`vitest` missing) and is not counted as RED. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/components/markdown/parseMarkdown.test.ts sources/features/studio-semantic-text/semanticTextFixtures.test.ts sources/features/studio-semantic-text/studioSemanticTextPresentation.test.ts sources/features/studio-semantic-text/studioRichTextWiring.test.ts` | RED, 5 expected failures | Missing blockquote/strikethrough parser output, complete fixture, light/dark surfaces, and renderer wiring. 10 pre-existing assertions passed. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/components/markdown sources/features/studio-semantic-text` | passed | GREEN/refactor: 8 files, 31 tests; parser, fixture, resolver, link safety, ANSI semantics, and renderer wiring. |
| `2026-08-14` | `pnpm --filter happy-app typecheck` | passed | TypeScript compile completed with no errors after final refactor. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run` | failed outside changed scope | 1186/1187 passed; unchanged `sources/encryption/blob.test.ts` 1MB test exceeded its fixed 5s timeout. Isolated reproduction also took about 5.4s. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run --testTimeout=15000` | passed | Full Happy App family: 132 files, 1187 tests. The unchanged 1MB crypto test passed in about 10.4s, confirming timeout sensitivity rather than a Track C correctness failure. |
| `2026-08-14` | `git diff --check` | passed | No whitespace errors. |
| 2026-08-14 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-14 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Deterministic fixture covers every accepted Markdown construct and semantic role | verified | `semanticTextFixtures.test.ts` proves all 12 semantic roles and all 26 accepted rich-text constructs; the pasteable fixture parses into all expected block types and six headings. |
| Parser supports H1-H6, emphasis, strikethrough, trusted links, nested lists, blockquotes, rules, inline/fenced code, tables, options, Mermaid, and images without transport changes | verified | Focused Markdown suite passed; only parser types and presentation changed, with no protocol/storage seam. |
| Studio light/dark presentation differentiates restrained typography, surfaces, borders, code chrome, tables, quotes, rules, and state roles | verified | Resolver tests cover light/dark tokens and Studio-only runtime gating; renderer wiring test covers consumption. Final aesthetic judgment remains parent-owned. |
| Link safety, selection/copy, horizontal code/table scrolling, Mermaid/options/images, Default/web/mobile behavior remain intact | verified | Focused link and wiring tests, full Happy App suite with bounded timeout, typecheck, and source review. Resolver remains null outside packaged Studio. |

## Remaining gaps

- Exact color/spacing values are evidence-backed estimates because Codex/Otty
  internal tokens are unavailable. Packaged light/dark visual judgment remains
  parent-owned after child integration.
- Tool output and diff rows retain their existing real renderers; the pasteable
  Markdown fixture names those states while the parent integration capture must
  include actual tool/diff content.
- The default full-suite command remains susceptible to an unrelated 5-second
  crypto performance timeout on this machine; the complete family passes with
  a 15-second per-test limit.
