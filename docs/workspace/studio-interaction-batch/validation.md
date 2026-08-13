# Validation: `studio-interaction-batch`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-13` | `pnpm --filter happy-app exec vitest run` | pass | 131 files / 1181 tests. |
| `2026-08-13` | `pnpm --filter happy-app typecheck` | pass | Happy App TypeScript check. |
| `2026-08-13` | `cargo check --manifest-path packages/happy-app/src-tauri/Cargo.toml` | pass | Tauri native shell check after removing the temporary runtime probe. |
| `2026-08-13` | `python3 scripts/validate-happy-workflow.py` | pass | Selective Happy workflow adoption valid. |
| `2026-08-13` | `python3 scripts/test-workflow-core.py` | pass | 14 tests. |
| `2026-08-13` | `python3 scripts/test-workflow-ci.py` | pass | 14 tests. |
| `2026-08-13` | `python3 scripts/workflow-audit.py --strict --require-active` | pass-with-gaps | Only expected pending lifecycle gates before this ledger update. |
| `2026-08-13` | `git diff --check` | pass | No whitespace errors. |
| `2026-08-13` | `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio devtools/happyctl build-desktop` | pass | Real packaged Tauri build; `beforeBuildCommand` visibly ran Expo export with `--clear`. |
| `2026-08-13` | fresh signed install, exact executable PID replacement, Computer Use `super+k`, metadata-backed window capture | pass | Real shortcut path produced a dark Studio Palette in the newly installed WKWebView process. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 isolated writers | verified | Three child commits were produced in exclusive worktrees and integrated locally in A/B/C order. |
| AC2 tool semantics | verified | Child focused/full tests and parent full Happy App suite pass; no tool execution/parsing callbacks changed. |
| AC3 Composer semantics | verified | Child state tests plus parent full suite/typecheck pass; control order and callbacks remain intact. |
| AC4 interaction states | verified | Packaged light/dark evidence exists; dark Command Palette was reverified through the real keyboard shortcut after the cache fix. |
| AC5 platform gating | verified | Studio resolvers remain Tauri-gated; complete App suite covers Default/mobile seams. |
| AC6 deterministic quality | verified | 131 files / 1181 tests, typecheck, workflow core/CI, Rust check, diff check, and whole-diff semantic inspection pass. |
| AC7 packaged evidence | verified | Stable signed recoverable install; final dark capture is 1470x874 pt / 2940x1748 px with SHA-256 metadata. |
| AC8 explicit user acceptance | verified | On `2026-08-13`, the user confirmed the corrected packaged dark Palette was fixed. |
| AC9 local-only | verified | No push or local `dev` merge performed. |

## Remaining gaps

- The batch is intentionally not merged to local `dev` and not pushed.
