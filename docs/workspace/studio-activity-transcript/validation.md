# Validation: `studio-activity-transcript`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-14` | repository trace: Codex app-server completion → mapper → Happy Wire/App schemas → reducer → Studio transcript | passed | `exec_command_end` contains output/exit/duration/status, but current `tool-call-end` drops all except call id; existing activity category/localization is reusable. |
| `2026-08-14` | `pnpm --filter @slopus/happy-wire exec vitest run src/sessionProtocol.test.ts` (RED) | failed as expected | 1/11 failed because enriched fields were stripped; legacy event passed. |
| `2026-08-14` | same Happy Wire focused command (GREEN/final) | passed | 11/11 passed; legacy/enriched/malformed behavior covered. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/sync/typesRaw.spec.ts --testTimeout=15000` (RED) | failed as expected | 1/64 failed because enriched completion normalized to null content. |
| `2026-08-14` | same App normalization command (GREEN) | passed | 64/64 passed; later suite includes malformed enriched rejection as test 65. |
| `2026-08-14` | `pnpm --filter happy exec vitest run src/codex/__tests__/sessionProtocolMapper.test.ts` (RED) | failed as expected | 1/27 failed because live command completion emitted call id only. A preliminary `happy-coder` filter matched no package and was discarded as setup error. |
| `2026-08-14` | same CLI mapper command after rebuilding `happy-wire` | passed | 27/27; then historical replay RED proved output still emitted as hidden thinking; final 28/28 passed after using enriched completion for live and history. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run sources/features/studio-execution-transcript/studioExecutionTranscript.test.ts` (RED/GREEN) | passed | RED showed timestamp duration 100 instead of provider 1250; final 7/7 passed. |
| `2026-08-14` | Studio activity resolver and mounted ToolGroup tests (RED/GREEN) | passed | Initial mounted setup missed a layout mock and was not counted as RED; valid RED 2/2 proved generic gray wiring, final 2 files/6 tests passed with Studio semantics and Default fallback. |
| `2026-08-14` | focused final App data/presentation suite | passed | 5 files / 138 tests passed. |
| `2026-08-14` | `pnpm --filter happy-app typecheck`; `pnpm --filter @slopus/happy-wire typecheck`; CLI build/typecheck | passed | All changed TypeScript graphs passed. |
| `2026-08-14` | `pnpm --filter @slopus/happy-wire test` | passed | 4 files / 26 tests passed. |
| `2026-08-14` | `pnpm --filter happy test` | passed | 85 files / 805 tests passed. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run --testTimeout=15000` | passed | Serial rerun passed 139 files / 1239 tests. Earlier parallel run had 135/139 files pass and 4 package-resolution failures while `happy-wire test` deleted/rebuilt `dist`; classified as verified build race, not product failure. |
| `2026-08-14` | `git diff --check`; `python3 scripts/validate-happy-workflow.py` | passed | Diff integrity and Happy selective workflow adoption passed. |
| `2026-08-14` | independent producer-to-renderer whole-diff review | failed | 1 high and 3 medium findings: contradictory/non-zero exit status could normalize as success; truncation marker exceeded the shared bound and was re-truncated; historical MCP compatibility drifted; activity `successColor` had no consumer. |
| `2026-08-14` | review-follow-up RED: Wire/App/CLI/transcript/MCP focused tests | failed as expected | Wire accepted contradictory `exitCode: 2/isError: false`; App derived completed for non-zero exit; CLI treated string/fractional exits as success and emitted 100018 code units; Studio lost the explicit marker; historical MCP omitted its legacy thinking output. One unsupported Chai matcher was corrected and not counted as product RED. |
| `2026-08-14` | review-follow-up GREEN: Wire 11; App 5 files / 140; CLI 29 | passed | Structured failure derivation and contradiction rejection, fail-closed malformed producer metadata, total 100k producer bound with marker preserved, legacy MCP output restoration, category-colored completion contract, and envelope→normalizer→reducer→transcript coverage pass. |
| `2026-08-14` | second independent whole-diff review | failed | 2 medium findings: reliable zero exit plus malformed auxiliary fields could throw during envelope validation; top-level PRD still named a uniform activity success role. |
| `2026-08-14` | CLI zero-exit malformed auxiliary RED/GREEN | passed | RED reproduced throws for malformed duration/status/output with `exit_code: 0`; GREEN keeps reliable zero exit authoritative, discards malformed auxiliary values, and passes 29/29 mapper tests. Invalid string/fractional exits remain fail-closed errors. |
| `2026-08-14` | final independent whole-diff review | passed | No blocking/high/medium findings; all first- and second-round findings closed; Wire/App/CLI/typecheck/diff evidence independently rechecked. |
| `2026-08-14` | complete final package suites | passed | Happy Wire 4 files / 26 tests; Happy CLI 85 files / 806 tests; Happy App 139 files / 1241 tests with bounded 15s test budget. |
| `2026-08-14` | `pnpm --filter happy-app tauri:build:dev` | partially passed | Cache-clear Expo export and optimized Rust binary completed; configured Developer ID identity was unavailable, so the signed bundle step failed without a product compilation failure. |
| `2026-08-14` | `pnpm --filter happy-app exec tauri build --config src-tauri/tauri.dev.conf.json --config '{"build":{"beforeBuildCommand":""}}' --no-sign --bundles app` | passed | Reused the immediately preceding cache-clear export, rebuilt optimized source, and produced a complete unsigned `Happy (dev).app` without replacing `/Applications`. |
| `2026-08-14` | initial metadata-backed packaged window capture | invalid | The export omitted `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio`. Because the persisted visual-style preference was `default`, the package exercised the Default renderer and visibly retained the old card-based sidebar. `packaged-current.png` must not be used as Studio acceptance evidence. Source hash, bundle timestamp, and process identity checks were insufficient because runtime visual-mode selection was not verified. |
| `2026-08-14` | `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio pnpm --filter happy-app exec tauri build --config src-tauri/tauri.dev.conf.json --no-sign --bundles app` | passed | Cache-cleared Expo export emitted `index-9c231cdba49f7943927c9798e3f44ea1.js`; optimized Rust build produced a fresh unsigned worktree-local `Happy (dev).app` at 20:45 without replacing `/Applications`. |
| `2026-08-14` | corrected metadata-backed packaged window capture | partially passed | Fresh worktree process PID 99929/window 23001 captured at 1470×874pt / 2940×1748px. Visible Studio evidence includes the unboxed sidebar controls/groups, regular-weight session titles, compact spacing, and Studio panel geometry. No session was restored, so this capture proves the corrected runtime visual path but not the activity transcript body; dark and expanded transcript states still require direct inspection. |
| `2026-08-14` | T5 initial `CodexPatchStudioPresentation.test.ts` RED attempt | invalid setup | Test file omitted the `afterEach` import, so collection failed before product behavior ran; corrected and not counted as RED. |
| `2026-08-14` | T5 mounted Studio default-expanded/non-Studio-collapsed RED | failed as expected | 1/2 failed because Studio initially rendered zero `ToolDiffView` instances; non-Studio compatibility passed. |
| `2026-08-14` | T5 mounted disclosure GREEN | passed | Studio initially renders the real diff adapter, remains collapsible/reopenable, exposes path/kind/+/- stats in the compact row, removes the duplicate Studio file header/border, and preserves non-Studio initial collapse. |
| `2026-08-14` | first independent T5 review | failed | High: default `compactToolCalls=true` suppressed CodexPatch in the real `ToolView` before reaching the tested view. Medium: direct component test mocked the diff adapter without proving unified patch materialization/multi-file/footer behavior. |
| `2026-08-14` | real `ToolView` compact=true Studio CodexPatch RED/GREEN | passed | Valid RED rendered zero specific views; GREEN lets Studio CodexPatch bypass generic compact suppression while a mounted non-Studio CodexPatch remains on the existing compact path. |
| `2026-08-14` | T5 expanded mounted behavior coverage | passed | Hunk-only patch receives deterministic file headers; pair input reaches `ToolDiffView`; two files render two diffs; move path is visible; permission footer appears only under the final file. |
| `2026-08-14` | T5 focused renderer suite after final malformed-input fix | passed | 3 files / 19 tests passed: Studio tool tokens, real ToolView host wiring, CodexPatch disclosure/materialization, and safe fallback for missing/empty/null/empty-patch/empty-pair inputs. |
| `2026-08-14` | `pnpm --filter happy-app typecheck`; `git diff --check` after T5 | passed | Changed renderer and tests typecheck; diff integrity passed. |
| `2026-08-14` | second independent T5 review | failed | Original High/Medium closed; new Medium found that empty or malformed Studio CodexPatch data could bypass compact fallback and yield blank activity or unsafe entry reads. |
| `2026-08-14` | malformed/empty Studio CodexPatch real-host RED/GREEN | passed | Valid RED reproduced five unsafe bypass cases across missing changes, empty map, null entry, empty patch, and empty old/new pair. GREEN filters object/array entries through the renderable patch contract and uses compact fallback unless at least one valid entry remains. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run --testTimeout=15000` after final T5 review fixes | passed | 139 files / 1250 tests passed, including the bounded large-blob test. |
| `2026-08-14` | malformed nested patch-content RED/GREEN | passed | Real-host cases for non-string `modify`, `add`, and `delete` payloads first reproduced unsafe structured-diff entry, then fell back to the compact generic tool path without invoking the diff renderer. |
| `2026-08-14` | malformed `move_path` RED/GREEN with real metadata and path utilities | passed | RED reproduced the production `path.toLowerCase` exception for a numeric move path. GREEN accepts move paths only when string-valued and preserves valid move rendering. |
| `2026-08-14` | final T5 focused renderer suite | passed | 3 files / 24 tests passed after source freeze: Studio tokens, real `ToolView` compact-host routing, valid object/array/hunk/pair/multi-file/move/footer rendering, disclosure state, and malformed-input fallbacks. |
| `2026-08-14` | final T5 independent whole-diff review | passed | No blocking/high/medium findings. The reviewer traced target/rendered paths with real metadata and independently reran the focused suite, App typecheck, and diff integrity. |
| `2026-08-14` | `pnpm --filter happy-app exec vitest run --testTimeout=15000` after all T5 fixes | passed | 139 files / 1255 tests passed. |
| `2026-08-14` | final explicit-Studio unsigned package build | passed | `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio pnpm --filter happy-app exec tauri build --config src-tauri/tauri.dev.conf.json --no-sign --bundles app` produced a fresh worktree-local bundle at 23:14; exported JS resources were timestamped 23:13. `/Applications/Happy (dev).app` was not replaced. |
| `2026-08-14` | final worktree bundle launch identity | passed | The running process resolves to the new worktree bundle (`PID 12767` at launch), not the installed application. |
| `2026-08-14` | final inline-diff window capture attempt | unavailable | Window inventory returned the 1470×872 on-screen app window, but two explicit-window captures failed with macOS `could not create image from window`. The package remains open for direct user inspection; no green/red visual acceptance is claimed from this attempt. |
| `2026-08-14` | `python3 scripts/workflow-check.py --record studio-activity-transcript` after T5 | blocked (1/8) | Both typechecks, Happy Server 14 files/102 tests, and all four workflow checks passed. The only failure was the unchanged 1MB blob encryption case at the configured 5s Vitest default (about 5.06s); the complete App suite passes 1255/1255 under the already-recorded bounded 15s budget. Check is not represented as fully passed. |
| `2026-08-15` | direct user inspection of the running explicit-Studio worktree bundle | passed | User confirmed the real inline file-edit state is visible and accepted the result. This closes the green/red diff visual-acceptance gap; no automated screenshot claim substitutes for the user's inspection. |
| `2026-08-15` | final `python3 scripts/workflow-check.py --record studio-activity-transcript` after user acceptance | blocked (1/8) | The same unchanged 1MB blob encryption test exceeded the configured 5-second default (about 7.32s). The other 1254 App tests, 102 Server tests, both typechecks, and all four workflow checks passed. The feature-specific and bounded complete App evidence remains green; Finish/Archive is intentionally not claimed without explicit acceptance of this named check gap or a green configured check. |
| 2026-08-14 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-14 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-14 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-14 | `pnpm --filter happy-server test` | passed | test |
| 2026-08-14 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-14 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| 2026-08-14 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-14 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-14 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-14 | `pnpm --filter happy-server test` | passed | test |
| 2026-08-14 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-14 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| 2026-08-14 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-14 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-14 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-14 | `pnpm --filter happy-server test` | passed | test |
| 2026-08-14 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-14 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-14 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| 2026-08-15 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-15 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-15 | `pnpm --filter happy-app exec vitest run` | failed (1) | test |
| 2026-08-15 | `pnpm --filter happy-server test` | passed | test |
| 2026-08-15 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-15 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-15 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-15 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 | verified | Happy Wire 11 tests plus App normalization 66 tests cover legacy, enriched, contradictory, and malformed completion. |
| AC2 | verified | Codex mapper 29 tests cover live/history, zero/non-zero/malformed exit, auxiliary metadata, 100k bound, surrogate boundary, and legacy MCP playback. |
| AC3 | verified | Real session envelope normalization plus reducer integration asserts matching error ToolCall and structured result. |
| AC4 | verified | Transcript resolver 8 tests proves provider output/ANSI/duration/error state and preserved truncation marker with no fabricated absent content. |
| AC5 | verified | Resolver plus mounted ToolGroup tests prove light/dark tokens, category/state priority, actual wiring, and Default fallback. |
| AC6 | verified | Legacy events/history, Default mounted fallback, complete App/Wire/CLI suites, and three independent semantic reviews preserve non-Studio and old-consumer behavior. |
| AC7 | verified | Focused/typecheck/complete suites, strict review, corrected Studio-mode unsigned packaged build, light shell capture, and direct user inspection pass. |
| AC8 | verified | Mounted Studio/non-Studio and real compact-host tests pass, including unified patch materialization, multiple files, move path, toggle, counts, final permission footer, malformed-input fallback, and real path normalization. Final independent review passed and the user accepted the real green/red edit state in the explicit-Studio worktree bundle. |

## Remaining gaps

- Automated deterministic expanded-transcript capture remains unavailable, but the user directly inspected and accepted the real edit state on `2026-08-15`; this is no longer a visual-acceptance blocker.
- Invalid capture: `/Users/myartings/Sync/tmp/happy-studio-activity-transcript-2026-08-14/packaged-current.png`. It exercised the Default visual path and is retained only as failure evidence.
- Corrected Studio shell capture: `/Users/myartings/Sync/tmp/happy-studio-activity-transcript-2026-08-14/packaged-studio-corrected.png` with adjacent `.capture.json` metadata. It proves Studio runtime selection and shell geometry, but the blank restored state does not prove transcript rendering.
- Final explicit-Studio worktree bundle is running from `packages/happy-app/src-tauri/target/release/bundle/macos/Happy (dev).app`. macOS window capture failed despite successful inventory, so direct user inspection is the recorded acceptance evidence.
