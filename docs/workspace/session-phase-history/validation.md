# Validation: `session-phase-history`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-24` | `pnpm --filter happy-app typecheck` | pass | Pre-task `main -> dev` merge resolution baseline. |
| `2026-08-24` | focused merge suite (7 files / 66 tests) | pass | Pre-task official-update merge baseline. |
| `2026-08-24` | `pnpm --filter @slopus/happy-wire exec vitest run src/sessionProtocol.test.ts --reporter=dot` | expected fail | RED: parsed text stripped `phase: commentary`; 1 failed, 11 passed. |
| `2026-08-24` | same Happy Wire test | pass | GREEN: 12 passed. |
| `2026-08-24` | `pnpm --filter happy exec vitest run src/codex/__tests__/sessionProtocolMapper.test.ts --reporter=dot` | expected fail | RED: live and backfilled agent text both omitted supported phase; 2 failed, 29 passed. |
| `2026-08-24` | `pnpm --filter @slopus/happy-wire build` | pass | Refreshed workspace protocol build consumed by CLI. |
| `2026-08-24` | same Codex mapper test | pass | GREEN: 31 passed. |
| `2026-08-24` | `pnpm --filter happy-app exec vitest run sources/sync/typesRaw.spec.ts sources/sync/reducer/reducer.spec.ts --reporter=dot` | expected fail | RED: normalizer and reducer omitted phase; 2 failed, 126 passed. |
| `2026-08-24` | same App normalization/reducer test | pass | GREEN: 128 passed. |
| `2026-08-24` | `pnpm --filter happy-app exec vitest run sources/hooks/useGroupedMessages.test.ts --reporter=dot` | expected fail | RED: unphased text was inferred as final and mixed legacy text was collapsed; 2 failed, 13 passed. |
| `2026-08-24` | same grouped-message test | pass | GREEN: 15 passed. |
| `2026-08-24` | Wire, CLI, and App package typechecks | pass | All three `tsc --noEmit` commands passed. |
| `2026-08-24` | `pnpm --filter @slopus/happy-wire exec vitest run --reporter=dot` | pass | Full Wire suite: 27 passed. |
| `2026-08-24` | focused Codex App Server phase test | pass | Phase-bearing raw item mapped to `agent_message`; 1 passed, 19 skipped. |
| `2026-08-24` | focused App phase suites | pass | 3 files, 143 tests passed. |
| `2026-08-24` | full `codexAppServerClient.test.ts` | baseline failure | 18 passed; 2 unrelated sandbox mock tests failed because sandbox initialization mock was not called on Windows. Focused phase test passed. |
| `2026-08-24` | `pnpm --filter @slopus/happy-wire test` | unavailable | Package script uses shell-only `$npm_execpath`, unsupported by PowerShell; equivalent build, typecheck, and full Vitest suite passed directly. |
| 2026-08-24 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-24 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-24 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-24 | `pnpm --filter happy-server test` | failed (1) | test |
| 2026-08-24 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-24 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-24 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-24 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| `2026-08-24` | `git diff --check` | pass | No whitespace errors; line-ending warnings only. |
| `2026-08-24` | whole-diff semantic review | pass | No blocking findings; optional additive contract, conservative legacy handling, and non-mutating grouping verified. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 optional Wire phase | verified | Happy Wire protocol tests: 12 passed |
| AC2 Codex mapping | verified | Codex mapper tests: 31 passed; focused App Server phase test passed |
| AC3 App propagation | verified | normalization/reducer tests: 128 passed |
| AC4-AC7 grouping behavior | verified | grouped-message tests: 15 passed |

## Remaining gaps

- Formal check result: `accepted-gaps`; on 2026-08-24 the user explicitly accepted the configured full App/Server suites' two unrelated baseline failures.
- Whole-diff review passed with no findings.
- Existing Windows-only test harness gaps: Wire's `$npm_execpath` script and two Codex sandbox mock assertions.
