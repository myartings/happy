# Validation: `client-performance-bounded-state`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| 2026-08-24 | `HAPPY_PRINT_PERFORMANCE_BASELINE=1 pnpm --filter happy-app exec vitest run sources/features/client-performance/clientPerformanceBaseline.test.ts` | passed | 3 fixtures; 2,000 Sessions: 2,000 baseline reads / 1 changed projection; 5,000 messages: 20,000 baseline reads / 1 changed turn projection |
| 2026-08-24 | 13-file focused performance/Session/grouping/copy/target/ChatList/cache test command | passed | 74 tests passed; later equivalence additions passed as 19 tests across the two changed suites |
| 2026-08-24 | `pnpm --filter happy-app typecheck` | passed | Repeated after final changes |
| 2026-08-24 | `pnpm --filter happy-server typecheck` | passed | Configured compatibility check |
| 2026-08-24 | `pnpm --filter happy-app exec vitest run` | baseline failures | 1489 passed, 3 failed: two unchanged Studio source-string assertions and one flaky 1 MiB blob test; blob test passed alone |
| 2026-08-24 | `pnpm --filter happy-server test` | baseline failure | 101 passed, 1 unchanged local attachment-download fixture failed with 404; no server files changed |
| 2026-08-24 | `python scripts/validate-happy-workflow.py` | passed | Configured repository check |
| 2026-08-24 | `python scripts/test-workflow-core.py` | passed | Configured repository check |
| 2026-08-24 | `python scripts/test-workflow-ci.py` | passed | 14 tests in 53.503s; the aggregate runner's earlier 120s timeout was not a test failure |
| 2026-08-24 | `git diff --check` | passed | Line-ending conversion warnings only; no whitespace errors |
| 2026-08-24 | `pnpm --filter happy-app web -- --port 8087` | passed | Metro bundled and listened on localhost:8087; process tree was then stopped and the port closed |
| 2026-08-24 | `agent-browser open http://localhost:8087` / `npx --yes agent-browser ...` | unavailable | CLI absent; npx fallback did not become usable within 60s, so interactive/IME smoke was not claimed |
| 2026-08-24 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-24 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-24 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-24 | `pnpm --filter happy-server test` | failed (1) | test |
| 2026-08-24 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-24 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-24 | `python3 scripts/test-workflow-ci.py` | failed (120) | check |
| 2026-08-24 | `python3 scripts/workflow-audit.py --strict` | failed (120) | check |
| 2026-08-25 | `.\\devtools\\happyctl.ps1 doctor` | passed | Windows desktop prerequisites verified: isolated Node 20, pnpm, Rust/MSVC, WebView2, repository identity, and pre-push guard |
| 2026-08-25 | `.\\devtools\\happyctl.ps1 build-desktop` | passed | Built the current feature branch as `Happy (dev)`; Expo export and embedded `dist/index.html`/main-bundle checks passed; produced fresh x64 NSIS, MSI, and `app.exe` artifacts without installing them |
| 2026-08-25 | `.\\devtools\\happyctl.ps1 update-desktop` | passed | User authorized replacement; recoverable backup/registry rollback flow ran, and installed `app.exe` matched the build artifact SHA-256 `26F628D4E1668BC2F2F5F846CB73AEB84910D41F4555C53FD285EAD706F24240` |
| 2026-08-25 | `.\\devtools\\happyctl.ps1 verify-desktop` | passed | Installed `Happy (dev)` 0.1.0 launched from the expected path and passed process verification |
| 2026-08-25 | Installed Windows/Tauri Computer Use smoke | passed with human gap | Real installed window rendered the Session list, opened the active long performance Session, loaded its transcript, scrolled upward while streaming without snapping to bottom, exposed the return-to-bottom affordance, and returned to the live tail; no messages or drafts were created |
| 2026-08-25 | 7-file focused client-performance test command | passed | 7 files, 36 tests passed after installed-client verification |
| 2026-08-25 | `pnpm --filter happy-app typecheck` | passed | Final pre-commit app typecheck |
| 2026-08-25 | `python scripts/validate-happy-workflow.py` | passed | Final pre-commit workflow validation |
| 2026-08-25 | `python scripts/test-workflow-core.py` | passed | 14 tests passed in 30.680s |
| 2026-08-25 | `python scripts/test-workflow-ci.py` | passed | 14 tests passed in 53.182s |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| 1–3 performance evidence | verified | Deterministic 100/500/2,000 Session and 100/1,000/5,000 message fixture output |
| 4–8 Session index | accepted gap | 2,000-row projection test rebuilds exactly one changed row; existing flat/group/order/visibility tests pass. User accepted the residual top-level categorization/sort scan. |
| 9–14 conversation cache | verified | Cache-policy tests cover LRU, 500-message and 10 MiB hidden limits; code inspection verifies send/queue/outbox protection and cursor-consistent whole-cache eviction |
| 15–18 message derivation | verified | Turn-cache, grouping equivalence, copy equivalence/on-demand, and message-target tests pass; no target skips display-item indexing |
| 19–22 rendering/input | accepted gap | ChatList test verifies window 9, 32ms throttle, anchoring, and older-reading behavior; the installed Windows/Tauri client loads the active long transcript and preserves older-reading position during streaming. User accepted the remaining real-IME human confirmation gap. |
| Compatibility | accepted gap | App/server typechecks pass and all changed-scope tests pass; user accepted the unrelated baseline-suite failures listed above. |

## Remaining gaps

- The installed Windows/Tauri client passed automated launch, long-transcript
  load, scroll-during-streaming, and return-to-tail smoke. Human perceptual
  performance and real IME composition still need user confirmation because
  injected automation text does not exercise the user's IME path.
- Two pre-existing Happy App Studio string-contract tests and one pre-existing
  Happy Server attachment fixture remain red; changed-scope tests are green.
- Session categorization/sorting and turn-boundary detection still perform a
  lightweight linear scan. Expensive row/group/copy projection work is reused,
  but a runtime profile after installation is still needed before deciding on
  a deeper normalized index.
- A double-ended active-transcript window remains protocol-gated; the current
  backward-only cursor cannot safely recover an evicted middle/newer boundary.
