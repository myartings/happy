# Validation: `worktree-fork-snapshot`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-10` | `pnpm --filter happy exec vitest run --project unit src/git/worktreeSnapshot.test.ts src/claude/utils/claudeSessionFork.test.ts src/api/apiMachine.codexFork.test.ts` | passed | 18 tests; real Git snapshot, Claude cross-directory copy, and RPC coverage. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run sources/sync/ops.codexFork.test.ts sources/keyboard/shortcuts.test.ts` | passed | 33 orchestration and shortcut tests. |
| `2026-08-10` | `pnpm --filter happy-app typecheck` | passed | Client UI, translations, and RPC types compile. |
| `2026-08-10` | `pnpm --filter happy build` | passed | CLI typecheck and bundle completed under isolated Node 20. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run --testTimeout=10000 --reporter=dot` | passed | 101 files, 1024 tests. Default 5-second run first exposed one unrelated 1 MB crypto performance timeout; the complete retry passed with a 10-second ceiling. |
| `2026-08-10` | `pnpm --filter happy test` | unavailable | Build passed; the Windows unit phase has 36 pre-existing POSIX-path/platform failures (path normalization, image cache, ripgrep, Homebrew detection, scanner timing, sandbox mock). Feature-targeted CLI tests pass. |
| `2026-08-10` | `git diff --check` | passed | No whitespace errors. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Existing fork and side chat stay unchanged | verified | New action calls `forkInWorktreeAndSpawn`; existing `forkAndSpawn` and `spawnSideChat` paths are unchanged and app suite passes. |
| Action eligibility matches existing fork support | verified | `useSessionQuickActions` places both actions under the existing `canFork` gate. |
| Clean and dirty sibling worktrees start at source HEAD | verified | `worktreeSnapshot.test.ts` clean, dirty, and subdirectory cases. |
| Dirty state preserves staged, unstaged, rename, delete, binary, and untracked layers | verified | Real Git status equivalence plus byte assertions in `worktreeSnapshot.test.ts`; ignored files excluded. |
| Unsafe Git state fails closed | verified | Machine module rejects conflicted indexes, sparse checkout, in-progress operations, and directory overlays such as nested repos/submodules. |
| Claude and Codex continue in target directory | verified | Claude target-project test and app orchestration tests for both providers. |
| Pre-spawn failures clean the owned worktree | verified | Provider-failure and spawn-failure rollback tests. |
| UI matches approved interaction | verified | Whole-diff inspection of `WorktreeForkSheet.tsx`, right-click action, Chinese/English copy, clean/dirty states. |

## Remaining gaps

- Full CLI unit suite is not portable to native Windows and retains unrelated POSIX-assumption failures; CLI build/typecheck and all affected targeted tests pass.
