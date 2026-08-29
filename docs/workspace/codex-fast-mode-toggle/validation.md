# Validation: `codex-fast-mode-toggle`

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | Focused app suite: model options, composer chips, message metadata, schemas, and session storage | passed | 93 tests |
| `2026-08-30` | Focused CLI suite: remote mode state, app-server client, and prompt hashing | passed | 47 tests; the later prompt-only rerun passed 10 tests after adding tier-hash coverage |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | passed | TypeScript |
| `2026-08-30` | `pnpm --filter happy typecheck` | passed | TypeScript |
| `2026-08-30` | `pnpm test` in `packages/happy-cli` | passed | Build plus 93 files / 873 unit tests |
| `2026-08-30` | `pnpm --filter happy-server typecheck` | passed | Repository configured check |
| `2026-08-30` | `pnpm --filter happy-server test` | passed | 15 files / 107 tests |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run` | failed (1) | 188 files / 1632 tests passed; 4 files / 15 tests failed in pre-existing, unmodified Studio rich-text/tool-presentation suites |
| `2026-08-30` | `python3 scripts/validate-happy-workflow.py` | passed | Repository workflow validation |
| `2026-08-30` | `python3 scripts/test-workflow-core.py` | passed | 14 tests |
| `2026-08-30` | `python3 scripts/test-workflow-ci.py` | passed | 14 tests |
| `2026-08-30` | `python3 scripts/workflow-audit.py --strict` | passed | The command itself passed; future gates were pending at execution time |
| `2026-08-30` | `git diff --check` | passed | No whitespace errors |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 capability/model-gated native control | verified | `modelModeOptions.test.ts`; `desktopComposerModeChips.test.ts`; accessible switch semantics in desktop/mobile controls |
| AC2 synced session selection | verified | `storage.sessionDraft.test.ts`; metadata schema test; existing optimistic metadata-push path extended field-for-field |
| AC3 outbound metadata reassertion | verified | `messageMeta.test.ts` verifies every Codex message emits `fast` or `default` and non-Codex behavior is unchanged |
| AC4 validated CLI state | verified | `remoteModeState.test.ts` accepts only `default`/`fast`, retains state, and ignores malformed values |
| AC5 app-server transport | verified | `codexAppServerClient.test.ts` observes `serviceTier: 'fast'` in `turn/start` |
| AC6 unsupported/default behavior | verified | capability/model support tests and model-switch normalization tests |

## Remaining gaps

- Accepted by the user on `2026-08-30` for this feature's completion:
- The repository-wide app suite is not green because 15 tests in four unmodified
  Studio rich-text/tool-presentation files fail on the current branch. The Fast
  focused suites and every changed package typecheck are green, and none of the
  failing files overlap this feature. Per workflow policy this remains an
  unaccepted verification gap until the user accepts it or the unrelated suite
  is repaired separately.
- No device/simulator visual pass was run. Component presentation and
  accessibility wiring are deterministic-test covered, but pixel-level layout
  is not runtime-proven.
