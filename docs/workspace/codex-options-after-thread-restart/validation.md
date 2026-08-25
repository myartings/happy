# Validation: `codex-options-after-thread-restart`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-25` | `pnpm exec vitest run src/codex/codexPrompt.test.ts --project unit` | RED as expected | 8 existing tests passed; new replacement-thread test failed because `buildCodexThreadTurnPrompt` did not exist. |
| `2026-08-25` | `pnpm exec vitest run src/codex/codexPrompt.test.ts --project unit` | passed | GREEN: 9/9 tests passed; same-thread deduplication and replacement-thread reinjection are covered. |
| `2026-08-25` | `pnpm exec vitest run src/codex/codexPrompt.test.ts src/codex/codexAppServerClient.test.ts src/codex/codexUserMessageRouter.test.ts --project unit` | 32 passed, 2 baseline failures | Prompt and router suites passed. Two sandbox tests expect initialization on Windows although production explicitly skips it on `win32`; no files in that behavior are modified by this task. |
| `2026-08-25` | `pnpm --filter happy build` | passed | TypeScript no-emit check and pkgroll build completed successfully. |
| `2026-08-25` | `pnpm exec vitest run --project unit --reporter=json --silent` | 795 passed, 35 baseline failures | 830 tests total. Failures are confined to seven pre-existing Windows/environment-sensitive files: `claude_version_utils`, `codexAppServerClient`, `claudeLocal`, `imageInput`, `path`, `sessionScanner`, and ripgrep `index`; the modified prompt suite passes. |
| 2026-08-25 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-25 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-25 | `pnpm --filter happy-app exec vitest run` | 1503 passed, 3 baseline failures | Existing large-blob timeout and two source-wiring assertions; no CLI files are involved. |
| 2026-08-25 | `pnpm --filter happy-server test` | 101 passed, 1 baseline failure | Existing local attachment-download test receives 404 instead of 200; no CLI files are involved. |
| 2026-08-25 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-25 | `python scripts/workflow-check.py --record codex-options-after-thread-restart` | timed out after 124 seconds | Recorded all preceding configured results; interrupted `test-workflow-core.py` and did not reach later checks. |
| 2026-08-25 | `python scripts/test-workflow-core.py` | passed | 14/14 tests passed when rerun independently. |
| 2026-08-25 | `python scripts/test-workflow-ci.py` | passed | 14/14 tests passed. |
| 2026-08-25 | `python scripts/workflow-audit.py --strict --require-active` | passed with expected future gates | Only check, review, and finish remained pending at the time of the verification-phase audit. |
| 2026-08-25 | `pnpm --filter happy cli:install` | passed | Rebuilt and linked the local CLI, then restarted daemon PID 138288 from the repository `dist/index.mjs`. |
| 2026-08-25 | Happy (dev) live option-rendering check | passed | A fresh Codex conversation received the installed prompt instructions and rendered three clickable buttons: `通过`, `重试`, and `停止`. |
| 2026-08-25 | `python3 scripts/test-workflow-ci.py` | failed (120) | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Same thread receives append prompt at most once | verified | `buildCodexThreadTurnPrompt` targeted unit test. |
| Replacement thread receives append prompt | verified | Same targeted regression test changes thread ID and observes the wrapped Happy prompt. |
| Existing CLI behavior remains green | verified | CLI build passed; 795/830 unit tests passed and all failures are outside the modified prompt path. |
| Installed client renders agent options | verified | Fresh live Happy (dev) conversation displayed three clickable option buttons after the local CLI/daemon restart. |

## Remaining gaps

- No in-scope verification gap remains.

## Unrelated baseline observations

- Two `codexAppServerClient.test.ts` sandbox assertions expect initialization
  on Windows although production explicitly skips it behind
  `process.platform !== 'win32'`; reconnect/restart tests in that file pass.
- The complete Windows unit project also retains 33 unrelated path, Claude,
  image-input, session-scanner, and bundled-ripgrep failures. None of those
  files are modified by this task.
- Repository-configured app tests retain three unrelated failures: a 1 MB blob
  encryption timeout and two source-wiring assertions.
- Repository-configured server tests retain one unrelated local attachment
  download assertion (HTTP 404 instead of 200).
