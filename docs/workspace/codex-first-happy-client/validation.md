# Validation: `codex-first-happy-client`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | expected RED | Module did not exist; the first packaged-macOS default contract failed at import as intended |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | GREEN, 1 test | Packaged macOS resolves to the `Happy Codex` project-first contract |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | expected RED, 1 passed / 1 failed | Contract did not yet expose packaged Studio versus standalone Default presentation |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts sources/features/studio-visual-style/studioVisualStyle.test.ts` | GREEN, 17 tests | Packaged macOS/Windows reuse Studio primitives while standalone clients retain Default |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | expected RED, 2 passed / 1 failed | Native host-platform resolver was not implemented |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | GREEN, 3 tests | macOS, Windows, Linux, and non-desktop platform signals resolve deterministically |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | expected RED, 3 passed / 1 failed | Explicit development rollback environment parser was not implemented |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | GREEN, 4 tests | `EXPO_PUBLIC_HAPPY_CODEX_FIRST=0` projects a data-migration-free legacy-shell rollback |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | expected RED, 4 passed / 1 failed | Codex-first Happy destination family was not yet part of the contract |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | GREEN, 5 tests | Contract owns the truthful New Session, Tasks, Issues, Artifacts, and Machines/Agents order |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopRuntime.test.ts` | expected RED | Runtime signal-composition module did not exist |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopRuntime.test.ts sources/features/codex-first-shell/codexFirstDesktopContract.test.ts sources/features/studio-visual-style/studioVisualStyle.test.ts` | GREEN, 21 tests | Pure runtime composition passes after isolating the React Native environment adapter; original parse failure is resolved |
| `2026-08-30` | `pnpm exec expo start --offline --clear` then `pnpm typecheck` | GREEN | Refreshed ignored Expo typed-route cache after the new `dev` base; Happy App typecheck passes without changing the personal-settings implementation |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` | expected RED, 5 passed / 1 failed | Codex-first region contract did not yet expose accepted panel geometry |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell sources/features/studio-visual-style sources/features/studio-overlays/studioDesktopBuildConfiguration.test.ts sources/features/studio-panel-resize/studioPanelResizePolicy.test.ts sources/sync/localSettings.test.ts` | GREEN, 65 tests | T01 runtime, platform, identity, destination, panel-geometry, rollback, Studio reuse, build, and settings compatibility suite passes |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | passed | Happy App TypeScript passes after ignored Expo route types were regenerated |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstSidebarNavigation.test.ts` | expected RED | T02 Happy route projection module did not exist |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstSidebarNavigation.test.ts` | GREEN, 1 test | Enabled Happy destinations project in the accepted Codex-first order |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstSidebarNavigation.test.ts` | expected RED, 1 passed / 1 failed | Nested-route selection projection was not implemented |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstShellWiring.test.ts` | expected RED, 2 failed | Navigator has no Codex-first contract injection and the dedicated sidebar shell does not exist yet |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstCommandAccess.test.ts` | expected RED | Command-palette access policy did not exist; Codex-first search could not yet override the legacy opt-in |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstShellWiring.test.ts sources/features/codex-first-shell/codexFirstCommandAccess.test.ts sources/features/codex-first-shell/codexFirstSidebarNavigation.test.ts` | GREEN, 7 tests | T02 host injection, product controls, route projection/selection, and Codex-first search availability pass |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell sources/features/studio-visual-style/studioSidebarWiring.test.ts` | GREEN, 20 tests | Complete T01–T02 contract and sidebar compatibility suite passes |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | passed | T02 shell, command launcher, and host composition typecheck cleanly |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstSessionNavigation.test.ts sources/features/codex-first-shell/codexFirstSearchIndex.test.ts sources/features/codex-first-shell/codexFirstAttention.test.ts sources/hooks/useVisibleSessionListViewData.test.ts` | expected RED, 3 missing modules and 1 behavior failure | T03 projections did not exist and `input_required` Sessions were not promoted into attention |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstSessionNavigation.test.ts sources/features/codex-first-shell/codexFirstSearchIndex.test.ts sources/features/codex-first-shell/codexFirstAttention.test.ts sources/hooks/useVisibleSessionListViewData.test.ts` | GREEN, 28 tests | Project/flat presentation, complete local search index, deduplicated attention count, and Agent-input promotion pass |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstNavigationWiring.test.ts` | expected RED, 3 failed | T03 projections were not yet connected to Sidebar, SessionsList, ProjectGroup, or command palette |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstNavigationWiring.test.ts sources/features/codex-first-shell/codexFirstSearchIndex.test.ts sources/features/codex-first-shell/codexFirstAttention.test.ts sources/features/codex-first-shell/codexFirstSessionNavigation.test.ts sources/hooks/useVisibleSessionListViewData.test.ts` | GREEN, 31 tests | T03 UI/index/attention wiring passes |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/utils/flatSessionList.test.ts sources/utils/flatSessionListPreferenceWiring.test.ts sources/hooks/useVisibleSessionListViewData.test.ts sources/components/CommandPalette sources/features/codex-first-shell` | GREEN, 64 tests | T03 deterministic project grouping, reversible flat preference, local command/search, and shell suites pass |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/utils/notificationRouting.test.ts sources/sync/sessionAttentionMarkers.test.ts sources/utils/sessionRuntimeStatus.test.ts sources/utils/flatSessionRowPresentation.test.ts` | GREEN, 20 tests | Existing notification targeting, read markers, and Session attention presentation remain correct |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | passed | T03 project/search/attention composition typechecks cleanly |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstHomeState.test.ts sources/features/codex-first-shell/codexFirstNewSessionWiring.test.ts sources/utils/newSessionSidebarLayout.test.ts` | expected RED, 1 missing module / 3 failed / 5 passed | T04 home-state model, packaged-runtime wiring, and default wide contextual rail did not exist |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstHomeState.test.ts sources/features/codex-first-shell/codexFirstNewSessionWiring.test.ts sources/utils/newSessionSidebarLayout.test.ts` | GREEN, 17 tests | Eight distinct home states, Home/New Session runtime wiring, legacy gating, and wide Codex-first rail pass |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/hooks/useNewSessionDraft.test.ts sources/hooks/useStartSessionFromDraft.test.ts sources/utils/newSessionAgentSelection.test.ts sources/utils/newSessionModeSelection.test.ts sources/utils/newSessionPickerInteraction.test.ts sources/utils/newSessionPickerItems.test.ts sources/utils/newSessionSidebarLayout.test.ts sources/utils/workspaceProjectDiscovery.test.ts sources/components/newSessionProgress.test.ts sources/features/codex-first-shell` | GREEN, 106 tests | T04 preserves draft, attachment, Machine/Agent, model, effort, permission, worktree, discovery, idempotency, failure recovery, spawn handoff, and prior Codex-first behavior |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | passed | T04 home, localization, and New Session composition typecheck cleanly |
| `2026-08-30` | `git diff --check` | passed | T04 introduced no whitespace errors |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/studio-conversation-layout/studioConversationLayout.test.ts sources/features/studio-composer/studioComposerStyle.test.ts sources/features/codex-first-shell/codexFirstConversationPresentation.test.ts sources/features/codex-first-shell/codexFirstConversationWiring.test.ts` | expected RED, 1 missing module / 4 failed / 7 passed | T05 measured Codex-first geometry, user-bubble projection, and host wiring were absent |
| `2026-08-30` | same focused T05 command | GREEN, 14 tests | 46pt header, 750pt Composer/content alignment, compact neutral/default and preserved custom bubbles, and runtime host wiring pass |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/studio-conversation-layout sources/features/studio-semantic-text sources/features/studio-composer sources/components/ChatListStudioScroll.test.ts sources/components/agentInputLayout.test.ts sources/components/agentInputPrimaryAction.test.ts sources/features/codex-first-shell` | failed, 2 failed / 106 passed | Two pre-existing stale Markdown assertions expected no button role and the pre-`externalCopyHandler` selection expression; `git show HEAD` proved production behavior already differed and no Markdown production file was modified |
| `2026-08-30` | same complete T05 command after correcting stale assertions | GREEN, 108 tests | Conversation geometry, semantic text/ANSI/Markdown/CJK fixtures, option payloads, scroll anchoring, Composer layout/actions/states, and all Codex-first slices pass |
| `2026-08-30` | `pnpm --filter happy-app typecheck && git diff --check` | passed | T05 host seams typecheck and the complete diff has no whitespace errors |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDecisionLifecycle.test.ts` | expected RED | The shared pending/submitting/resolved/expired/disconnected lifecycle and exact-once submission gate did not exist |
| `2026-08-30` | same focused T06 lifecycle command after implementation | GREEN, 3 tests | Lifecycle priority, synchronous duplicate suppression, success hold, failure retry, and new-request reset pass |
| `2026-08-30` | expanded T06 tool/decision/Composer regression command | failed, 13 failed / 172 passed | Every failure was the same stale compact-tool margin assertion (`1`); both worktree production and `git show HEAD` proved the unchanged authoritative value is `2` |
| `2026-08-30` | expanded T06 command after correcting the stale assertions | GREEN, 186 tests | Terminal/read/search/edit/task/neutral activity, ANSI/transcript, running/failure previews, disclosure/copy/full output, patches, groups, Composer states, exact provider permission payloads, inline/modal Agent answers, duplicate prevention, disconnect, expired, and retry behavior pass |
| `2026-08-30` | `pnpm --filter happy-app typecheck && git diff --check && test -z "$(git diff --name-only -- packages/happy-app/sources/sync/ops.ts packages/happy-app/sources/sync/storageTypes.ts packages/happy-server packages/happy-cli)"` | passed | T06 typechecks without whitespace errors and does not modify Session RPC operations/types, Happy Server, or Happy CLI |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstWorkspaceChrome.test.ts` | expected RED | The Codex-first workspace action, panel, Settings, and keyboard projection module did not exist |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/utils/sideChatQuickPanel.test.ts sources/features/codex-first-shell/codexFirstWorkspaceWiring.test.ts` | expected RED, 2 failed / 17 passed | A file-capable Session without Side Chat lost the Changes/Files launcher, and the action-capability projection was not yet wired into the host |
| `2026-08-30` | T07 deterministic command plus `sources/utils/sideChatQuickPanel.test.ts`, `sources/utils/personalFeaturesSettingsWiring.test.ts`, and `sources/sync/localSettings.test.ts` | GREEN, 205 tests | Shared Changes/files/Issues/side-chat capability gating, panel geometry/resize, overlay positioning and menu keyboard lifecycle, command/search, complete Settings route inventory, GitHub flag behavior, and settings compatibility pass |
| `2026-08-30` | `pnpm --filter happy-app typecheck && git diff --check && test -z "$(git diff --name-only -- packages/happy-app/sources/sync/ops.ts packages/happy-app/sources/sync/storageTypes.ts packages/happy-server packages/happy-cli)"` | passed | T07 typechecks, has no whitespace errors, and leaves protected operation/protocol/Server/CLI paths unchanged |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopHardening.test.ts sources/features/codex-first-shell/codexFirstHardeningWiring.test.ts` | expected RED, missing responsive module / 3 host-wiring failures | The configured 720pt packaged desktop projection, appearance/motion evidence, and host accessibility seams did not yet exist |
| `2026-08-30` | same focused T08 command after implementation | GREEN, 10 tests | 720/1100/1470 tiers, right-first collapse, persistent navigation, zen restoration, standalone gating, appearance evidence, contrast, reduced motion, and host wiring pass |
| `2026-08-30` | T08 deterministic command | GREEN, 177 tests | Complete Codex-first, panel-resize, overlay, Studio visual-state, keyboard, and Command Palette responsive/accessibility matrix passes |
| `2026-08-30` | T07 cross-task regression command after T08 | GREEN, 215 tests | Workspace panels, GitHub Issues, palette, Settings/local settings, side-chat capability gates, and every Codex-first slice remain green |
| `2026-08-30` | `pnpm --filter happy-app typecheck && git diff --check` plus protected-path audit | passed | T08 typechecks, has no whitespace errors, and leaves Session operations/types, Server, and CLI unchanged |
| `2026-08-30` | `pnpm --filter happy-app typecheck` | passed | Current complete feature worktree typechecks after packaged-candidate review fixes |
| `2026-08-30` | `pnpm --filter happy-server typecheck` | passed | Server remains type-safe although this feature has no Server implementation diff |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run` | GREEN, 215 files / 1736 tests | Full applicable Happy App regression suite passes on the packaged-candidate source |
| `2026-08-30` | `pnpm --filter happy-server test` | GREEN, 15 files / 107 tests | Full Server suite passes with no Server implementation diff |
| `2026-08-30` | `python3 scripts/validate-happy-workflow.py` | passed | Selective Happy workflow adoption is valid |
| `2026-08-30` | `python3 scripts/test-workflow-core.py` | GREEN, 14 tests | Workflow core regression suite passes |
| `2026-08-30` | `python3 scripts/test-workflow-ci.py` | GREEN, 14 tests | Workflow CI regression suite passes |
| `2026-08-30` | `python3 scripts/workflow-audit.py --strict --require-active` | pass-with-gaps | The active workflow is structurally valid; only the deliberately future `implementation`, `review`, and `finish` gates remain pending |
| `2026-08-30` | `devtools/happyctl build-desktop` | passed | Produced the release macOS bundle at `packages/happy-app/src-tauri/target/release/bundle/macos/Happy (dev).app` |
| `2026-08-30` | safe development-client sign, backup, install, and launch flow | passed | Replaced only `/Applications/Happy (dev).app`; retained the prior candidate at `Happy Devtools/backups/Happy (dev)-20260830-052008.app` |
| `2026-08-30` | bundle metadata, `codesign --verify --deep --strict`, architecture, and executable SHA-256 comparison | passed | Built and installed bundles are `com.slopus.happy.dev` version `0.1.0`, arm64, stably signed, and byte-identical at the executable boundary (`bd4cf22…e4c`) |
| `2026-08-30` | `devtools/happyctl verify-desktop` and `devtools/happyctl launch-desktop` | passed | The verifier confirms the exact installed development client and stable Team identity; the launched process resolves to `/Applications/Happy (dev).app/Contents/MacOS/app` |
| `2026-08-30` | `bash -n devtools/happyctl devtools/tests/happyctl-macos-signing-smoke.sh` and signing smoke | passed | Fixed a real `pipefail`/SIGPIPE false failure caused by early-exit `awk` parsing of long `codesign` output; the regression fixture now consumes the complete stream |
| `2026-08-30` | remaining applicable `devtools/tests/*.sh` smokes | passed, 4/4 | Official-baseline, refresh-guard, iOS-release, and main-push-guard fixtures pass; `devtools-layout-smoke.sh` is intentionally inapplicable on a personal product feature branch because it asserts that `HEAD` differs from `upstream/main` only in main-allowlisted infrastructure |
| `2026-08-30` | private-evidence and protected-path inspection | passed | Generated bundles remain ignored; captures stay under `/Users/myartings/Sync/tmp/`; no private runtime content or credentials were added to tracked source; Session operations/types, Server, and CLI implementation paths remain unchanged by this feature |
| `2026-08-30` | packaged window capture and interaction attempt | unavailable while locked | `CGSSessionScreenIsLocked = 1`; WindowServer returns black/failed captures and prevents trustworthy interaction. The installed App remains alive without error-level unified-log entries. No unlock attempt was made |
| `2026-08-30` | focused Composer RED/GREEN checks | GREEN, 12 tests after expected 2-test RED | A packaged dark-theme review exposed a white Session Composer. Theme-aware shell/action/attachment/autocomplete colors now resolve through the existing Composer presentation contract |
| `2026-08-30` | `pnpm --filter happy-app typecheck` and `git diff --check` after packaged-review fixes | passed | The dark Composer correction and Codex-first Settings footer typecheck without whitespace errors |
| `2026-08-30` | second safe development-client sign, backup, install, verify, and launch flow | passed | Installed the corrected Codex-first candidate only at `/Applications/Happy (dev).app`; executable SHA-256 is `52e9c115b9c857bff0150a2c8a52fba9d3b03e133c8cc9a774f4565571618c27`; prior candidate is recoverable at `Happy Devtools/backups/Happy (dev)-20260830-141636.app` |
| `2026-08-30` | `devtools/happyctl verify-desktop` after corrected install | passed | Bundle id `com.slopus.happy.dev`, stable Team signature, exact install path, version `0.1.0`, and arm64 architecture pass |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run` | GREEN, 215 files / 1737 tests | Final source, including the packaged-review fixes, passes the complete applicable Happy App suite |
| `2026-08-30` | Happy App/Server typechecks and `pnpm --filter happy-server test` | passed; Server 15 files / 107 tests | The final source remains type-safe and the unchanged Server suite remains green |
| `2026-08-30` | workflow validator/core/CI rerun | passed; core 14 tests, CI 14 tests | Durable workflow machinery remains green after final source changes |
| `2026-08-30` | `EXPO_PUBLIC_HAPPY_CODEX_FIRST=0 devtools/happyctl build-desktop`, stable sign, and private copy | package prepared | Produced a recoverable legacy-shell probe at `/Users/myartings/Sync/tmp/codex-first-happy-client/rollback/Happy (dev)-legacy-20260830-142935.app`, SHA-256 `62144cd66b6e43a4ca456feb96fabe074994d2d0e84cb31a4acbd226e1f1ee5c`; runtime smoke still requires an unlocked console |
| `2026-08-30` | normal `devtools/happyctl build-desktop` and stable sign after rollback build | passed | Restored the ignored build output to the normal Codex-first configuration; the installed corrected candidate was not replaced |
| `2026-08-30` | `bash -n devtools/happyctl` and all applicable devtools smoke scripts | passed | Stable-signing, official-baseline, refresh guards, iOS release, and main-push guard pass; the main-only layout assertion remains intentionally inapplicable on this product branch |
| `2026-08-30` | exact frontmost-application inspection after the user resumed the Goal | locked again | macOS returned `com.apple.loginwindow`; the new candidate had a live WebView and no crash receipt, while the current export rendered in Chromium and an older already-painted package remained capturable. This is strongly consistent with a lock-state first-paint suspension, but remains provisional until an unlocked rerun. A temporary `caffeinate -dimsu` guard is running for the next unlock |
| `2026-08-30` | offline-Machine Command Palette wiring RED/GREEN | expected 1-test RED, then GREEN 5 tests | Whole-diff review found that the palette subscribed only to active Machines even though the accepted local-search contract includes offline Machine names. The provider now uses `useAllMachines({ includeOffline: true })`; the pure index and host-wiring regressions pass |
| `2026-08-30` | final post-review `devtools/happyctl build-desktop`, stable signing, recoverable install, and exact hash comparison | passed | Installed the reviewed candidate at `/Applications/Happy (dev).app`; bundle `com.slopus.happy.dev`, Apple Development Team `MJS6V7A44A`, executable SHA-256 `9393c471dea2fe2b512a3a807c1a2a554f6f6be92fa86c09f5b91f2c045cde5e`, and byte identity with the signed build output pass. The immediately previous candidate remains recoverable at `/Users/myartings/Library/Application Support/Happy Devtools/backups/Happy (dev)-20260830-144500.app` |
| `2026-08-30` | final post-review `pnpm --filter happy-app exec vitest run` | GREEN, 215 files / 1737 tests | The complete Happy App regression suite passes after the offline-Machine search correction |
| `2026-08-30` | hidden Side Chat search wiring RED/GREEN | expected 1-test RED, then GREEN 3 tests | Whole-diff review found that indexing every raw Session would expose Side Chat child Sessions that Happy intentionally hides from global lists. Codex-first search now excludes `metadata.isSideChat` while leaving the legacy palette branch unchanged |
| `2026-08-30` | localized Settings search inventory RED/GREEN | expected 1-test RED, then GREEN 12 tests | Newly exposed Settings search entries no longer carry hard-coded English title/subtitle data; their display copy and category resolve through existing localization keys |
| `2026-08-30` | `pnpm --filter happy-app typecheck`, `git diff --check`, and `pnpm --filter happy-app exec vitest run` after whole-diff corrections | passed; GREEN 215 files / 1737 tests | Final reviewed source is type-safe, whitespace-clean, and passes the complete applicable Happy App suite |
| `2026-08-30` | final reviewed normal/rollback build, stable signing, recoverable install, and hash comparison | passed | Installed normal bundle and restored normal build output are byte-identical at SHA-256 `c11e0b0c0eaca7b1743a6bc0cb656796a8d19a9a1fe25e99bfe2cacfe091731c`; the previous App is recoverable at `/Users/myartings/Library/Application Support/Happy Devtools/backups/Happy (dev)-20260830-150027.app`; synchronized signed rollback package SHA-256 is `f09105cd4ddbef37d96172ce963253b6c97dc99ccd1144abbf01b070bbfe71f9` at `/Users/myartings/Sync/tmp/codex-first-happy-client/rollback/Happy (dev)-legacy-final-20260830-150327.app` |
| `2026-08-30` | Windows relay reconstruction from `tracked.patch` plus `untracked.zip` in a fresh detached worktree at `a269068a` | passed | Reconstructed 59 tracked changes and 64 untracked files; all 123 transferred file hashes matched, `git diff --check` passed, the ZIP integrity test reported no errors, and the temporary verification worktree was removed after success |
| `2026-08-30` | `pnpm install --offline --frozen-lockfile` | failed after linking 2638 packages | The upstream `@shopify/react-native-skia` postinstall invokes Unix `rm` under native Windows. The generated dependency links remain ignored; `vitest` is available and the focused six-test baseline passes, so this setup gap does not substitute for or block the targeted RED evidence |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` before the Windows test edit | GREEN, 1 file / 6 tests | Native Windows can execute the restored public contract suite before the behavior change |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts` after the Windows test edit | expected RED, 1 file / 6 passed / 1 failed | Packaged Linux and non-Tauri standalone expectations remain legacy; only packaged Windows fails because the current macOS-only predicate returns `legacy-happy`, `Happy`, and rollback unavailable instead of the required Codex-first contract |
| `2026-08-30` | same Windows contract command before the GREEN edit | expected RED, 1 file / 6 passed / 1 failed | The owning Root reconfirmed that the restored RED still failed only at the macOS-only packaged availability predicate before changing production code |
| `2026-08-30` | same Windows contract command after the minimal platform-eligibility edit | GREEN, 1 file / 7 tests | Packaged macOS and Windows resolve Codex-first with rollback available; packaged Linux and non-Tauri standalone clients remain legacy |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts sources/features/codex-first-shell/codexFirstDesktopRuntime.test.ts sources/features/codex-first-shell/codexFirstDesktopHardening.test.ts sources/features/codex-first-shell/codexFirstHardeningWiring.test.ts` | GREEN, 4 files / 18 tests | Windows eligibility composes with native host detection, rollback, responsive tiers, standalone layout gating, and host wiring |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell` | GREEN, 19 files / 67 tests | Every Codex-first shell contract, navigation, home, conversation, execution, workspace, decision, responsive, and host-wiring test passes |
| `2026-08-30` | first `pnpm --filter happy-app typecheck` after GREEN | failed: 5 unresolved `@slopus/happy-wire` imports | Diagnosis proved the workspace symlink was correct but this fresh worktree lacked the ignored `packages/happy-wire/dist` targeted by the package exports; no product source was changed in response |
| `2026-08-30` | `pnpm --filter @slopus/happy-wire build` then `pnpm --filter happy-app typecheck` | passed | Generated the ignored local wire-package dist and reran the original reproduction successfully on native Windows |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run` | GREEN, 215 files / 1738 tests | The complete Happy App suite passes with packaged Windows Codex-first eligibility; the new contract test is the only added test count |
| `2026-08-30` | `git -c core.autocrlf=false diff --check` plus protected operation/protocol/Server/CLI path audit | passed | The restored 59 tracked / 64 untracked path shape remains unstaged, whitespace-clean, and has no protected-path product diff |
| `2026-08-30` | workflow validator, core tests, CI tests, and `python3 scripts/workflow-audit.py --strict --require-active codex-first-happy-client` after Windows GREEN | passed; core 14 tests / CI 14 tests / audit pass-with-gaps | Durable workflow machinery remains valid; only the existing future implementation, review, and finish gates remain pending |
| `2026-08-30` | exact-worktree `.\devtools\happyctl.ps1 doctor` before package generation | initial prerequisite failure, then passed | The first run bound to `codex-first-happy-client-windows` and passed isolated Node 20.20.2, pnpm 10.11.0, MSVC 2022 Community, stable `x86_64-pc-windows-msvc` Rust 1.95.0, Git Unix tools, and WebView2 153.0.4234.8, but found the configured shared-clone push-guard file missing. The project-declared safe, idempotent `install-git-guards` command copied the tracked hook into `.git/happy-hooks`; the unchanged reproduction then passed |
| `2026-08-30` | exact-worktree `.\devtools\happyctl.ps1 build-desktop` | passed | Native Windows dependency setup and postinstall completed, Expo exported 7347 modules / 591 assets, Rust finished the optimized x64 MSVC release, and Tauri CLI 2.9.6 produced `app.exe`, MSI, and NSIS artifacts for `Happy (dev)` 0.1.0. Tauri warned that the binary lacks `__TAURI_BUNDLE_TYPE`; this is retained as an updater-plugin compatibility gap and is not treated as a package failure, install result, or release clearance |
| `2026-08-30` | Windows artifact identity, PE, hash, and Authenticode inspection | passed as unsigned local package evidence | x64 `app.exe` is 26,550,784 bytes with SHA-256 `af18d94139109ebf2fe7b90237f7c5213705210e508f26b4b0ba2854c9416236`; x64 MSI is 16,642,048 bytes with SHA-256 `a6ea0a98d8316832862f6574fce09a7a68da7d0968e488b2b5004933f39dd301`; x64-target NSIS is 15,032,958 bytes with SHA-256 `4d023f8d9aa05078ff5351d012fe6c002f8a07d97f5f8520c7ea894ce37ba90a`. All report `NotSigned`, as expected without signing authority; the NSIS outer bootstrapper is an x86 PE stub while its artifact name and Tauri target are x64 |
| `2026-08-30` | exact-worktree `.\devtools\happyctl.ps1 update-desktop -DryRun` | passed, no changes made | Selected the new NSIS candidate, inspected the exact `Happy (dev)` install/uninstall entry, live PID 87032, registry rollback plan, and three retained Windows backups, then ended with `No changes made.` The running installed executable remained SHA-256 `ddff65b6ec6bed0ddcd32c7ee066b8df96d4e7c57a4a945373a1810abac759f6`, distinct from the candidate, proving the package was not installed or launched |
| `2026-08-30` | exact pre/post package-and-dry-run Git content snapshot | passed | Root, branch, and HEAD remained exact; all 59 tracked and 64 untracked path/content hashes were identical, staged count remained zero, and generated dependency/export/Tauri outputs stayed ignored |
| `2026-08-30` | final shared-clone Git push-guard drift audit and exact-worktree doctor rerun | repaired and passed | After package checks, the common installed hook had CRLF bytes matching the primary checkout rather than the owning worktree's LF tracked source. The scheduled refresh last ran at 09:00 before this session and no concurrent `happyctl` process was present, so the exact writer is not proven. A final idempotent exact-worktree `install-git-guards` restored matching SHA-256 `925eeaf87154601d261886f4ded9aa6ee10415355ffcffbf61b8b9abaf9bcdcc`; doctor then passed again. This is retained as shared machine-state drift, not a product/package result |
| `2026-08-30` | whole-diff focused review command plus `pnpm --filter happy-app typecheck` | GREEN, 24 files / 110 tests; typecheck passed | Runtime, responsive, New Session, decision-lifecycle, and device-calculation suites remain locally green; their isolated projections do not cover the cross-component failures below |
| `2026-08-30` | `pnpm --filter happy-app exec vitest run` after the authorized Windows install | GREEN, 215 files / 1738 tests | The complete Happy App regression family passes on the exact installed-candidate source |
| `2026-08-30` | `pnpm --filter happy-server typecheck` and native-Windows `pnpm --filter happy-server test` | typecheck passed; tests failed, 2 failed / 105 passed | Both failures are unchanged local-file fixtures: their mocks strip POSIX `/tmp/.../` prefixes, while Windows `path.join`/`path.resolve` supplies backslashes or a drive prefix. The two files pass outside this Windows-only mismatch in prior evidence, and `git diff -- packages/happy-server` is empty; this remains a range-external Windows test-harness red, not a Codex-first Server diff |
| `2026-08-30` | workflow validator, workflow core/CI, strict active audit, `git -c core.autocrlf=false diff --check`, protected-path and secret-pattern scans | passed; core 14 / CI 14; audit pass-with-gaps | Workflow structure, whitespace, protected boundaries, and credential screening pass; before recording this review the only future gates were `review` and `finish` |
| `2026-08-30` | `bash -n devtools/happyctl`; PowerShell parse of the Windows relay; macOS-signing smoke under Git Bash with temporary `uname=Darwin` | passed | The new full-stream `awk` regression passes in a simulated Darwin shell. This is shell-logic evidence only and does not replace native macOS signature or authenticated GUI evidence |
| `2026-08-30` | whole-diff semantic acceptance review | blocked, 3 P1 / 1 P2 | Existing green tests miss notification-target truth, composed panel-width budgeting, narrow-shell Header ownership, and duplicate recent-project disambiguation. No product code was changed during review |

## Whole-diff acceptance review

Result: **blocked**. The packaged Windows build/install/hash/launch evidence remains
valid, but the candidate does not yet satisfy the complete accepted behavior.

1. **P1 — Notification attention opens the wrong surface.**
   `codexFirstAttention.ts` counts unread, permission-required, and
   input-required Sessions, while `SidebarView.tsx` routes the corresponding
   button unconditionally to `/inbox`. `InboxView.tsx` renders feed and friend
   data, not those Sessions, so the user cannot select the affected Session
   from the notification surface. This blocks AC-009.
2. **P1 — New Session violates the standard-tier main-width contract.**
   At the exact 1100-point threshold, the route-level rail is 330 points and
   the default persistent left panel is 275 points, leaving only 495 points for
   the main New Session canvas even though the accepted standard tier and panel
   policy require 600. The global panel projector cannot see this route-local
   rail because only `SessionView` publishes right-panel visibility. This
   blocks AC-024 across the supported 1100–1234-point range at default widths.
3. **P1 — The 720 x 480 packaged shell has two Header owners.**
   Codex-first forces the persistent desktop Header at every supported width,
   but the legacy `useIsTablet` calculation classifies 720 x 480 web as a
   phone. New Session consequently enables its Stack Header when its rail is
   hidden, and Inbox renders its own phone Header, both underneath the global
   `PersistentHeader`. This violates the one-control-owner contract and blocks
   narrow responsive acceptance.
4. **P2 — Recent projects are ambiguous across Machines.**
   `collectCodexFirstRecentProjects` discards Machine/path identity and
   `CodexFirstHomeCanvas` renders and names each row only with `project.name`.
   Two required fixture projects with the same name on different Machines are
   visually and accessibly indistinguishable, despite having different IDs and
   Session targets.

Still unavailable on this Windows host: authenticated macOS daily-loop
interaction, matched 720/1470/wide and light/dark captures, native VoiceOver
and focus containment inspection, a native macOS signing run, and execution of
the prepared rollback package. These remain gaps, not passes.
| 2026-08-30 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-30 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-30 | `pnpm --filter happy-app exec vitest run` | passed | test |
| 2026-08-30 | `pnpm --filter happy-server test` | failed (1) | test |
| 2026-08-30 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-30 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-30 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-30 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| 2026-08-30 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-30 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-30 | `pnpm --filter happy-app exec vitest run` | passed | test |
| 2026-08-30 | `pnpm --filter happy-server test` | failed (1) | test |
| 2026-08-30 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-30 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-30 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-30 | `python3 scripts/workflow-audit.py --strict` | passed | check |
| 2026-08-31 | `pnpm --filter happy-app typecheck` | passed | typecheck |
| 2026-08-31 | `pnpm --filter happy-server typecheck` | passed | typecheck |
| 2026-08-31 | `pnpm --filter happy-app exec vitest run` | passed | test |
| 2026-08-31 | `pnpm --filter happy-server test` | failed (1) | test |
| 2026-08-31 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-31 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-31 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-31 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC-001 | verified | The installed native Windows package opens as one authenticated `Happy Codex` shell across the inspected Session, New Session, Settings, and navigation surfaces; runtime gating tests require packaged Tauri Windows and preserve the legacy branch elsewhere. |
| AC-002 | accepted gap | Happy's final Windows package proves the required compact shell/region hierarchy at matched target sizes, but automated current-Codex pixels are prohibited because the installed Appx manifests as `ChatGPT.exe`. The reference identity and limitation are recorded; no pixel-parity claim is fabricated. |
| AC-003 | verified | Packaged UIA exposes search and notifications. Mouse launch, keyboard Escape/Enter reopen, focus restoration, deterministic attention routing, and command-palette interaction tests pass; no naturally counted notification was opened because that would change read state. |
| AC-004 | verified | The packaged shell and command palette expose New Session, enabled Todo/Issues, Artifacts, Machines/Agents, Settings, account, terminal connection, usage/about, and sign-out/restore paths behind their existing flags and auth boundaries. |
| AC-005 | verified | Project-first grouping is the packaged default; the existing flat preference remains reversible. Grouping/collision tests pass and packaged navigation disambiguates repeated project names with Machine identity. |
| AC-006 | verified | Selection, running/idle, unread, permission, failure, reconnect, archive, pin, favorite, attention, and shortcut-order projections pass the applicable App regression; packaged Session/navigation inspection found no lifecycle regression. |
| AC-007 | verified | Eight deterministic Home states are actionable, and the final installed Home rendered connected content without the former false-offline defect after its RED→GREEN socket-state fix. |
| AC-008 | verified | Local-only search indexes commands, destinations, all Sessions, projects, paths, and Machines. The final packaged palette filtered the exact worktree and opened this owning Session without remote query logging. |
| AC-009 | verified | Pure routing tests prove attention opens the correct Session with Inbox only as the no-attention fallback; packaged Inbox remained reachable. A naturally absent counted-attention state was not manufactured or read-mutated. |
| AC-010 | verified | Packaged New Session shows prompt-first composition plus truthful Machine/project/path, Agent, model, effort, permission, worktree, attachment, and prompt controls across wide through narrow fixtures. |
| AC-011 | verified | Representative backend/start-hook matrices preserve the existing `machineSpawnNewSession(spawnOptions)` boundary; operation and protocol diffs are zero. |
| AC-012 | verified | Discovery tests cover Machine changes, stale-result rejection, errors, recents, filtering, and manual path fallback; packaged New Session exposed the current discovered selection without mutation. |
| AC-013 | verified | Start-hook tests prove duplicate prevention, full draft/attachment preservation on failure, and successful Session navigation. Runtime inspection deliberately stopped before spawning a Session. |
| AC-014 | verified | The installed owning Session uses the shared Codex-first header, centered transcript, message/tool grammar, and floating Composer while preserving truthful backend controls. |
| AC-015 | verified | Send/stream/stop/completion/failure/reconnect/optimistic/retry/scroll behavior remains covered by the full App suite and packaged read-only daily-loop inspection; no transport or Session protocol changed. |
| AC-016 | verified | Terminal, read/search, edit/patch, task, and neutral tool states retain truthful running/success/failure/truncation/disclosure/copy/legacy-result coverage; packaged transcript/tool actions were inspected. |
| AC-017 | verified | Codex/Claude permission and Agent-question choices retain existing payload calls, enforce exact-once success with retry after failure, and expose pending/submitting/resolved/expired/disconnected accessibility states in focused lifecycle tests. |
| AC-018 | verified | Multiline input, attachments, mentions/autocomplete, backend controls, send/stop, validation, and focus seams pass regression; packaged Composer and New Session controls were inspected without sending. |
| AC-019 | verified | Markdown, ANSI, links, lists, code, tables, diffs, CJK/Unicode, selection/copy, wrapping, long lines, truncation, and scroll anchoring pass the applicable regression family. |
| AC-020 | verified | Changes, All Files, feature-gated Issues, and capability-gated Side Chat use one quiet workspace grammar. The final package exposed each truthful surface without claiming unsupported PR operations. |
| AC-021 | verified | Overlay placement/clamping, keyboard selection, Escape/outside dismissal, focus return, and destructive-confirmation contracts pass; the installed palette's click → Escape → Enter loop directly proves focus restoration. |
| AC-022 | verified | The bounded no-query palette plus searchable index covers daily destinations, recent/all Sessions, projects/paths/Machines, Settings, shortcuts, account/system actions, and flagged developer/usage routes. |
| AC-023 | verified | Packaged Settings shows explicit `Happy Codex` identity and retains account, appearance, feature, voice/language, Machine/Agent, connection, usage, changelog/about, privacy, and update routes under existing authorization. |
| AC-024 | verified | Deterministic narrow/standard/wide composition and packaged 1682/1469/1199/1099/719 × 479 smoke preserve navigation, transcript, Composer, panels, resize bounds, and right-before-left collapse. |
| AC-025 | verified | Adaptive → Light → Dark → Adaptive was exercised and visibly restored in the installed client; light is reference-backed and dark/adaptive-dark remain explicitly labeled Happy adaptations. |
| AC-026 | verified | Focus roles/names/states, contrast tokens, selection, reduced motion, workspace keyboard handling, and focus return pass focused tests; final Windows UIA directly proves localized panel/editor names and palette focus restoration. |
| AC-027 | verified | Runtime and wiring tests enable Codex-first only for packaged Tauri Windows/macOS eligibility while packaged Linux, standalone Web, iOS, and Android retain the legacy presentation path; the complete App suite passes. |
| AC-028 | verified | No migration or schema change exists. Auth, authorization payloads, encryption, sync operations, Server, Machine RPC, Session protocol, Happy CLI, and mobile protected paths have zero diff. |
| AC-029 | accepted gap | The development rollback variable deterministically restores legacy presentation and nine hash-bound backups plus registry snapshots exist. Intentional installed rollback execution was outside the authorized risk boundary and is documented, not performed. |
| AC-030 | verified | All retained Happy-specific adaptations are mapped in `deviation-ledger.md` to deterministic and packaged Windows receipts, including the final workspace-label and accessibility/focus evidence. |
| AC-031 | accepted gap | App/Server typechecks, Happy App 220 files/1761 tests, workflow validator, 14 core tests, 14 CI tests, strict audit, exact Windows build/install/hash/launch, and bounded daily loop pass. The configured check is 7/8 only because two unchanged native-Windows POSIX `/tmp` Server fixtures remain 105/107 with no Server diff. |
| AC-032 | accepted gap | The unsigned installable Windows app, responsive/theme/UIA/daily-loop evidence, deviation closure, limitations, nine-backup recovery inputs, and rollback instructions are complete. Same-state current-Codex pixel automation remains policy-blocked; macOS adaptation is explicitly deferred and does not block Windows acceptance. |

## Risk-control plan

| Control | Status | Planned evidence |
| --- | --- | --- |
| Approval and Agent-question payloads remain exact and submit once | passed at client boundary | T06 provider/action component matrices assert every existing argument and synchronous exact-once submission; protocol files are unchanged |
| Backend controls remain truthful | passed in focused suites | T04 spawn plus T05/T06 Composer and provider lifecycle matrices pass without changing capability selection or payload construction |
| Drafts and current selections survive failure/navigation | passed for New Session | 106-test T04 suite covers persisted draft, attachment, failure, idempotency, and success navigation; in-Session composer remains T06 |
| Web/mobile presentation does not change | passed at projection boundary | Runtime and responsive tests keep non-Tauri clients on the legacy device-layout decision; full applicable regression remains T10 |
| Settings remain parseable without migration | passed in focused suite | Existing default, old-state, normalization, and round-trip local-settings fixtures pass; T07 adds no schema or migration |
| Auth, sync, Server, Machine RPC, and Session protocols remain unchanged | passed in protected-path diff | T06–T08 protected-path audits are empty; final review repeats this control |
| Private runtime/reference content remains outside tracked source | passed | Generated bundle is ignored, private captures are routed to `/Users/myartings/Sync/tmp/`, and the tracked diff contains no captured Session content or credentials |
| Development App replacement is recoverable and exact | passed | Built/installed executable hashes match; bundle ID/version/architecture/signature and installed process path pass; prior App remains as the dated devtools backup |
| Development rollback works without data migration | pending | Packaged rollback smoke |

Risk result and stop conditions: `risk-assessment.md`.

## Remaining gaps

- T09–T10 and final packaged runtime evidence remain pending. The current
  external blocker is the locked macOS console; WindowServer cannot produce
  truthful App pixels or accept interaction until the user session is unlocked.
- Current Codex interaction surfaces that could not be captured remain grammar
  adaptations as listed in the specification.

## Windows authorized install validation plan — 2026-08-30

The user explicitly authorized the exact local `Happy (dev)` install and
verification slice. Planned proof is intentionally split by operation:

| Target | Owning host | Goal | Command/evidence | Required result | Claim boundary |
| --- | --- | --- | --- | --- | --- |
| Windows x64 | Native Windows 11 owning worktree | preinstall audit | exact root/branch/HEAD, candidate hashes, current install/process/registry/backups, guard, and doctor | all identities exact; no ambiguous target | permission to proceed only |
| Windows x64 | Native Windows 11 owning worktree | install | `.\devtools\happyctl.ps1 update-desktop -KeepBackups 4` after matching dry-run | backup plus registry snapshot, silent NSIS success, installed/build hash equality, four retained backups | installer works for this per-user development target |
| Windows x64 | Native Windows 11 owning worktree | launch | `.\devtools\happyctl.ps1 verify-desktop` | exact installed path observed alive, then verifier-created process cleanup | initial process launch only; no authenticated or visual-flow claim |
| Windows x64 | Native Windows 11 owning worktree | postinstall audit | installed/candidate/backup/registry/process/Git/protected-path/workflow checks | exact evidence retained, no source/staged drift | recoverability and bounded workflow integrity |

Signing remains `Unsigned`; release, publication, official-baseline replacement,
and destructive functional testing remain out of scope.

### Outcomes

| Target | Owning host | Goal | Result | Artifact/evidence | Signing / gap consequence |
| --- | --- | --- | --- | --- | --- |
| Windows x64 | Native Windows 11 owning worktree | preinstall audit | passed | Exact root/branch/HEAD; 59 tracked / 64 untracked / 0 staged; candidate app SHA-256 `af18d94139109ebf2fe7b90237f7c5213705210e508f26b4b0ba2854c9416236`; NSIS SHA-256 `4d023f8d9aa05078ff5351d012fe6c002f8a07d97f5f8520c7ea894ce37ba90a`; prior installed SHA-256 `ddff65b6ec6bed0ddcd32c7ee066b8df96d4e7c57a4a945373a1810abac759f6`; doctor passed against the exact worktree | Candidate remains unsigned; preflight alone proves no install |
| Windows x64 | Native Windows 11 owning worktree | install dry-run | passed | `.\devtools\happyctl.ps1 update-desktop -DryRun -KeepBackups 4` selected the exact NSIS, exact per-user `Happy (dev)` target, PID 87032, registry snapshot plan, and three existing backups; ended `No changes made.` | No installation claim from dry-run |
| Windows x64 | Native Windows 11 owning worktree | install | passed | `.\devtools\happyctl.ps1 update-desktop -KeepBackups 4` stopped only PID 87032, captured the uninstall entry, backed up the prior install, silently installed NSIS, and internally matched installed/build SHA-256 `af18d941…16236` | Unsigned local development install only; no signing or release claim |
| Windows x64 | Native Windows 11 owning worktree | recoverability | passed as backup evidence | New backup `Happy (dev)-windows-20260830-181430` retains old app SHA-256 `ddff65b6…59f6` and `uninstall-registry.json`; all three earlier backups remain, for four total | Rollback inputs are proven; an executed rollback smoke was not authorized or performed |
| Windows x64 | Native Windows 11 owning worktree | launch | passed | `.\devtools\happyctl.ps1 verify-desktop` validated install/uninstall identity and observed PID 76952 at the exact installed path before stopping the verification process; final installed-process count is zero | Initial launch only; no authenticated daily-loop, pixels, keyboard, or accessibility claim |
| Windows x64 | Native Windows 11 owning worktree | postinstall integrity | passed | Installed/build hashes are identical; uninstall entry is `Happy (dev)` 0.1.0 at the exact target; pre/post Git content digests are identical; protected status is empty; push guard matches tracked source; temporary config was removed | Tauri bundle-marker warning and unsigned state remain gaps |
| Cross-platform contract | Native Windows 11 owning worktree | focused behavior | passed, 1 file / 7 tests | Packaged macOS and Windows resolve Codex-first; packaged Linux and non-Tauri clients remain legacy | Deterministic contract proof, not GUI acceptance |

## TDD remediation and repeat whole-diff review — 2026-08-30

### Result

The four actionable findings from the preceding whole-diff review are repaired
at the source contract and host-wiring boundaries. Repeat semantic review found
**no remaining actionable code finding** in the accepted remediation scope.
The repository check result remains **pass-with-gaps** and its machine gate is
blocked because the complete configured family still contains one unchanged
Windows-only Server fixture failure group and because the remediated source has
not been packaged or run on an owning acceptance host.

### RED → GREEN evidence

| Behavior | RED | GREEN |
| --- | --- | --- |
| Session-derived notification target | `codexFirstAttention.test.ts`: 1 failed / 2 passed because `resolveCodexFirstNotificationTarget` did not exist; wiring test then failed 1 / 3 because Sidebar still had no Session target | Pure target 3 / 3; target plus Sidebar wiring 2 files / 6 tests |
| Composed New Session width | `newSessionSidebarLayout.test.ts`: 1 failed / 6 passed because 1100pt still returned a visible 330pt rail; wiring test then failed 1 / 2 because the rendered left width was not supplied | Layout 7 / 7; layout plus host wiring 2 files / 9 tests; composed `projectPanelWidth` matrix 4 / 4 at 1100, 1200, 1470, and maximum-left inputs |
| Narrow Header ownership | Pure test suite failed to load because the ownership projection did not exist; wiring test then failed 1 / 4 because shared Header, New Session, and Inbox did not consume it | Pure ownership 1 / 1; ownership plus three host seams 2 files / 5 tests |
| Duplicate Recent Project identity | `codexFirstHomeState.test.ts`: 1 failed / 9 passed because both duplicate rows lacked `machineLabel`; wiring test then failed 1 / 2 because the canvas did not supply Machine choices or render the label | Home state 10 / 10; projection plus canvas wiring 2 files / 12 tests |

The combined focused remediation family passed 7 files / 30 tests before the
additional 4-case composition matrix. Happy App typecheck passed at every
integration boundary.

### Complete check and review evidence

- `python scripts/workflow-check.py --record codex-first-happy-client` ran all
  eight configured commands. Happy App and Happy Server typechecks passed;
  Happy App passed 217 files / 1747 tests; workflow validation, 14 core tests,
  14 CI tests, and strict audit passed.
- Happy Server repeated the unchanged native-Windows result: 105 / 107 tests
  passed. The attachment-download and project-avatar local-file fixtures still
  expect POSIX `/tmp` mock paths while the Windows runtime resolves native
  paths. `git diff -- packages/happy-server` remains empty, so this is not a
  Codex-first product regression and Server edits remain outside the accepted
  risk boundary.
- `git -c core.autocrlf=false diff --check` passes after normalizing the
  machine-written `ACTIVE.md` line endings. The protected auth/sync/protocol/
  Server/CLI diff and repository-declared protected paths are empty.
- Repeat caller/state/error/test tracing closes all four prior findings: the
  notification action selects the first visible attention Session; the New
  Session rail reserves the projected persistent-left width; packaged Header
  ownership suppresses duplicate route/phone back controls while legacy
  tablet/phone behavior remains; duplicate Recent Projects receive existing
  Machine identity only on name collision.

### Remaining acceptance gaps

- The current remediated Windows source is now rebuilt, recoverably installed,
  launched, and inspected at the named responsive sizes. This additive Windows
  receipt does not substitute for the required macOS reference acceptance.
- Intentional rollback execution, signing, commit, push, PR, publication, and
  release remain unauthorized and were not performed.
- Authenticated macOS daily-loop interaction, matched responsive/appearance
  captures, native accessibility inspection, native signing rerun, and
  rollback execution remain unavailable. The Windows package also opened with
  a transient `无法连接` state before local New Session navigation; no backend-
  dependent or read-state-changing action was used to manufacture evidence.

## Current remediated Windows rebuild/install plan — 2026-08-30

The user selected `授权 Windows 重建安装验证（推荐）`. Pre-action inspection
confirmed the exact owning root/branch/HEAD, empty index, strict audit
`pass-with-gaps` only for future `finish`, the historical installed app SHA-256
`AF18D94139109EBF2FE7B90237F7C5213705210E508F26B4B0BA2854C9416236`, a valid
per-user uninstall entry, no running target process, and four existing Windows
backups. The new flow uses `KeepBackups=5` so none of those recovery points is
removed. Build, package, dry-run, install, launch, and named functional smoke
will be recorded as separate outcomes. Signing, intentional rollback execution,
commit, push, PR, publication, release, account/permission mutation, Agent
execution, protected path changes, and macOS acceptance claims remain excluded.

## Current remediated Windows rebuild/install outcomes — 2026-08-30

### Result

**Passed within the authorized Windows boundary.** The unsigned x64 candidate
was built from the exact owning worktree, selected by a no-change dry-run,
installed with all prior recovery points retained, launched from the exact
per-user path, and inspected without sending content or changing account,
permission, attention, settings, or external state.

| Stage | Result | Evidence | Claim boundary |
| --- | --- | --- | --- |
| Source verification | passed | Remediation family: 8 files / 34 tests; Happy App: 217 files / 1747 tests; Happy App and Server typechecks passed | Server implementation remained out of scope |
| Exact-worktree doctor | passed | Node 20.20.2, pnpm 10.11.0, Visual Studio 2022 Community MSVC, rustc/cargo 1.95.0 stable `x86_64-pc-windows-msvc`, WebView2 153.0.4234.8, and the tracked pre-push guard all passed | Prerequisite proof only |
| Native build | passed | `app.exe` SHA-256 `CEBB6EBE86F4A2663DECA94F76E050FD7712ECEA358A153F508B243B99C046F1`; MSI `B27461956BF18B99A6401B3104CFE4C09040E8698798AC669D5128288FFD7719`; NSIS `380C01FCE6E3099F86B1AC1958865B1F5356E6CF6FA7D65D81462B0AB88BA846`; all report `NotSigned` | Local development artifacts, not a signed release |
| Update dry-run | passed | `update-desktop -DryRun -KeepBackups 5` selected the exact NSIS/install/uninstall targets, found four backups, planned no backup removal, and ended `No changes made.` | No install claim from dry-run |
| Install and recoverability | passed | Silent NSIS update produced installed/build app hash equality at `CEBB6EBE…046F1`; uninstall entry remains `Happy (dev)` 0.1.0 at the exact per-user target; new backup `Happy (dev)-windows-20260830-203518` contains historical app SHA-256 `AF18D941…6236` plus `uninstall-registry.json`; five complete backups remain | Recovery inputs proven; rollback was not executed |
| Exact launch | passed | `verify-desktop` observed PID 101488 at `C:\Users\myartings\AppData\Local\Happy (dev)\app.exe` and stopped only its verifier-created process | Initial launch/path proof |
| Packaged shell smoke | passed with named gap | The separately launched installed App rendered `Happy Codex`, New Session, Todo, GitHub Issues, Artifacts, Machines, Settings, Session/Machine metadata, and the prompt-first New Session route. Actual sizes 1682 x 1081, 1469 x 1081, 1199 x 1081, 1099 x 1081, and 719 x 479 retained a usable composer and exactly one back/forward owner; the narrow tiers stacked configuration above the composer. Repeated `agent-skill-registry` context exposed distinct macOS/Windows Machine labels | No prompt/send/start, attention click, settings change, permission action, or backend-dependent daily loop; initial main canvas reported `无法连接` |
| Postinstall integrity | passed | Inspection PID 114236 was path-checked and stopped; target process count is zero; installed/build hashes remain equal; five backups and snapshots remain; pre/post build content digest stayed `7BCD7190DAD2EEFBC76232D66FA0F26C68FE4A4D88BA639256F9AC6B1B4691B8`; index and protected-path counts are zero; installed/tracked guard hashes both equal `925EEAF87154601D261886F4DED9AA6EE10415355FFCFFBF61B8B9ABAF9BCDCC`; temporary config was removed | Subsequent workflow-evidence edits are intentional and remain unstaged |
| Complete configured check | blocked by known external family | App/Server typechecks, Happy App 217/1747, workflow validator, 14 core tests, 14 CI tests, and strict audit passed. Happy Server repeated 105/107 with only the unchanged native-Windows POSIX `/tmp` fixture mismatches in attachment/project local-file tests | No Server edit is authorized or implied |

The Tauri build continues to warn that `__TAURI_BUNDLE_TYPE` is unavailable;
updater compatibility and unsigned state remain explicit package gaps. The
Windows receipt closes the stale-candidate gap only. Under the then-current D10
contract, final T09/T10 acceptance still required the owning macOS interaction/
appearance/accessibility and authorized rollback evidence. Decision D11
supersedes that current-platform prerequisite as recorded below.

## Windows owning acceptance contract reconciliation — 2026-08-30

### Result

The user's persistent Goal is now the authoritative current outcome. Decision
D11, the product requirements, specification, task list, scope, risk gate, and
task ownership have been reconciled so that native Windows—not macOS—is the
complete current acceptance platform. Historical macOS and earlier bounded
Windows receipts remain valid only for the claims they actually proved; neither
is silently promoted into fresh Windows matched-runtime evidence.

No product code changed in this reconciliation. T09 is reopened for fresh
native Windows Codex identity/state capture, same-size/theme/state Happy
comparison, the complete named surface inventory, keyboard/UI Automation
inspection, responsive light/dark evidence, a bounded real daily-use loop, and
fresh package identity if any source defect is repaired. T10 is pending those
receipts plus deviation/limitation closure, rollback documentation, whole-diff
review, and final workflow evidence.

The current stop boundary remains explicit: no commit, push, PR, signing,
publication, release, official-baseline replacement, protected auth/sync/
protocol/Server/Machine RPC/data-migration implementation change, or
intentional rollback execution is authorized. The unchanged native-Windows
Server fixture mismatches remain a named out-of-scope check gap rather than a
reason to misclassify the Windows product result.

## Packaged Home false-offline TDD tracer — 2026-08-30

### Runtime reproduction and root cause

The installed pre-fix Windows candidate rendered cached/current Sessions whose
rows truthfully reported connected Machines while the unselected Home Canvas
simultaneously rendered `无法连接`. Activating its Retry action refreshed
Machines/Sessions but returned to the same error state. Source tracing proved
the canvas consumed `useRealtimeStatus()`, which is the optional voice-session
status and defaults to `disconnected`, instead of the primary synchronization
`useSocketStatus()` already used by the existing connection UI. Retry could
never change the voice status, so this was a deterministic client projection
defect rather than evidence that the Happy service was offline.

### RED → GREEN evidence

- RED: new public component behavior test
  `CodexFirstHomeCanvasConnection.test.ts` rendered sync socket `connected`,
  voice realtime `disconnected`, one online Machine, and one visible Session.
  The targeted run failed 1/1 because the canvas showed
  `homeConnectionErrorTitle` instead of `homeReadyTitle`.
- GREEN: `CodexFirstHomeCanvas` now consumes the existing socket status and
  passes it to the Home state resolver. The resolver input was then renamed
  from ambiguous `realtimeStatus` to `connectionStatus` while green.
- Focused result: 2 files / 11 tests pass. Complete Codex-first shell result:
  22 files / 76 tests pass. Happy App typecheck passes. The complete Happy App
  regression passes 218 files / 1748 tests.

Post-GREEN `git -c core.autocrlf=false diff --check`, workflow validation, and
strict active audit pass; the audit remains `pass-with-gaps` only for future
implementation/check/review/finish receipts at that point. The staged index and
protected auth/encryption/sync/Server/CLI diff remain empty.

The currently installed candidate predates this source fix and is no longer
eligible for final product acceptance. It may support further defect discovery
only; final runtime claims require a fresh exact-worktree build/install/hash
receipt and a rerun of the original Home reproduction.

### Native reference and automation boundary

Read-only package inspection identifies the current Windows reference as
`OpenAI.Codex_26.825.4187.0_x64__2p2nqsd0c76g0`, version `26.825.4187.0`, x64,
status `Ok`. Its manifest display name is `ChatGPT` and executable is
`app/ChatGPT.exe`. The Computer Use policy therefore forbids driving this
reference UI, and that boundary was not bypassed. Fresh Codex runtime pixels
remain pending an existing private Windows capture or a user-prepared matched
state; static identity alone does not close visual parity.

## Fresh false-offline-fixed Windows package receipt — 2026-08-31

### Exact build, install, and recovery result

The post-GREEN source was rebuilt and recoverably installed from the exact
owning worktree. Doctor passed the native Windows toolchain and guard checks.
The generated x64 app/MSI/NSIS hashes are respectively
`CE248FA7EEC8D64DAB87D5D9E5617480B0385DFE833A7C3EA88C81AE1B0F6A6D`,
`3397775A3356FD5DA63DEDC47AD059F8B33A5AC6C164D4580D3226A18492EABE`,
and `A29DE8711B2CF90A7161E7A7349E7EBC14FC88D9D1064461E23DF848006C90A9`;
all are `NotSigned`.

`update-desktop -DryRun -KeepBackups 6` selected the exact candidate and
per-user `Happy (dev)` target, planned no backup removal, and made no changes.
The matching actual update passed, retained all six dated backups and registry
snapshots, and produced byte-identical built/installed app hashes. The newest
backup is `Happy (dev)-windows-20260831-001032`; it retains the previous app
hash `CEBB6EBE86F4A2663DECA94F76E050FD7712ECEA358A153F508B243B99C046F1`.
`verify-desktop` proved the exact installed process path. Intentional rollback
execution, signing, commit, push, publication, and release were not performed.

### Original runtime defect recheck

Fresh installed-state inspection at 1682 x 1081 passed the original tracer:
visible Sessions and connected Machines now coexist with the ready Home copy
`你想构建什么？`, `开始新任务，或继续最近的项目。`, and `新建会话`;
the former `无法连接` projection is absent. This closes only the false-offline
runtime defect. It does not yet close the full surface, responsive, dark/light,
keyboard/UIA, bounded daily-loop, or matched current-Codex acceptance.

The current Windows Codex Appx identity is proven read-only, but its manifest
routes to prohibited `ChatGPT.exe`, so Computer Use cannot produce current
Codex runtime pixels. A user-owned always-on-top WeChat window subsequently
obscured Happy's center canvas; it was not modified, and further coordinate
input was paused. The Tauri `__TAURI_BUNDLE_TYPE` updater warning and unsigned
state remain explicit package limitations.

## Final reviewed Windows candidate and recovery inputs — 2026-08-31

### Candidate identity and install receipt

The post-whole-diff, post-focus-return source passes Happy App typecheck and the
complete 220-file / 1761-test App suite. Exact-worktree doctor passed Node
20.20.2, pnpm 10.11.0, Visual Studio 2022 MSVC, Rust 1.95.0, WebView2
153.0.4234.8, and the installed tracked push guard. The native x64 artifacts
are:

| Artifact | Bytes | SHA-256 | Signature |
| --- | ---: | --- | --- |
| `target/release/app.exe` | 26,554,880 | `E248B306CCA795EEF406A4CD814516243F76F460B1738016355A4CDF0EFE07D1` | `NotSigned` |
| `Happy (dev)_0.1.0_x64_en-US.msi` | 16,646,144 | `A8F1F2E41E25A4BD7CF5DF6EDCF9E7F512FEBC2A497904068F55EAD8569F4A38` | `NotSigned` |
| `Happy (dev)_0.1.0_x64-setup.exe` | 15,034,282 | `00CB3DE017CA5955EF9D74193A32DF69583028F5CA798230FF02006DCC7503AC` | `NotSigned` |

`update-desktop -DryRun -KeepBackups 8` selected the exact NSIS, per-user
install directory, uninstall key, and only the exact installed PID `16132`; it
planned no removals and ended `No changes made.` The identical actual update
captured the uninstall registry, stopped only that path-confirmed process,
retained all eight backups, and proved the installed executable is byte-equal
to the reviewed build at `E248B306…07D1`. `verify-desktop` then observed PID
`68860` at the exact installed path and stopped only that verifier-created
process.

### Verified rollback inputs and non-executed procedure

The immediately preceding complete installation is retained at
`C:\Users\myartings\AppData\Local\Happy Devtools\backups\Happy (dev)-windows-20260831-011637`.
Its `app.exe` is 26,554,880 bytes with SHA-256
`7E4536CCC58204E8BFA9F8C3D6D359998AF43A27BC23F6F598DA6296B1F76F82`;
the directory also contains `uninstall.exe` and the 446-byte
`uninstall-registry.json` naming only `Happy (dev)` 0.1.0 at
`C:\Users\myartings\AppData\Local\Happy (dev)`. Seven older dated backups
remain untouched.

Rollback is deliberately **not executed** under the current authority. If it
is separately authorized, the recovery operator must:

1. Reconfirm the selected backup path and hashes, exact install/uninstall
   identity, and that every running target process resolves to the exact
   installed `app.exe`; stop on any mismatch.
2. Stop only those exact-path processes and move the current install into a new
   timestamped quarantine under the external Happy Devtools state directory;
   do not delete it.
3. Copy the selected complete backup to the exact per-user install directory,
   then restore the `Happy (dev)` HKCU uninstall values from that backup's JSON
   snapshot without touching any other uninstall key.
4. Verify the restored executable hash, uninstall path/version, and one
   exact-path launch. If any check fails, stop the restored process, remove only
   the failed copied directory, and move the quarantined current install back.

The existing updater already performs this same backup/install/registry
restoration automatically when a replacement fails before success. Neither
the documented manual procedure nor the development-only legacy presentation
rollback changes account, Session, Machine, sync, protocol, or Server data.

### Remaining claim boundaries

- The Tauri `__TAURI_BUNDLE_TYPE` warning remains, so updater compatibility is
  not claimed. The local development candidate is unsigned and is not a public
  release.
- Current Windows Codex static identity is proven, but its `ChatGPT.exe`
  manifest makes automated reference-UI interaction prohibited; no Happy
  pixels are relabeled as matched Codex pixels.
- The two unchanged native-Windows Server POSIX `/tmp` fixture mismatches remain
  outside this client-only risk boundary. No Server change was made to force a
  green result.
- macOS adaptation and native acceptance remain later work and do not qualify
  or block this Windows result.

## Final owning Windows package and UI acceptance — 2026-08-31

### Last RED → GREEN and regression receipts

| Command / observation | Result | Notes |
| --- | --- | --- |
| `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstWorkspaceWiring.test.ts` before implementation | expected RED, 1 failed / 4 passed | Changes/Files collapse still used Side Chat-specific accessible copy |
| same focused workspace command after implementation | GREEN, 5/5 | Generic localized workspace-panel copy is wired without renaming the compatibility key |
| `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstHardeningWiring.test.ts` before implementation | expected RED, 1 failed / 4 passed | Packaged Simplified-Chinese New Session still used the legacy English placeholder |
| same focused hardening command after implementation | GREEN, 5/5 | Codex-first desktop localizes the placeholder; legacy desktop preserves exact English |
| `pnpm --filter happy-app typecheck` | passed | Final source typechecks |
| `pnpm --filter happy-app exec vitest run` | GREEN, 220 files / 1761 tests | Complete applicable App regression after both runtime findings |

### Artifact, install, and recovery receipt

| Artifact / action | Result | Evidence |
| --- | --- | --- |
| exported JS | passed | 8,905,474 bytes; SHA-256 `8C4D87BAB1672E7B746C359B92AC86155FB7D51B809838251E81AE0B5BC53E41`; both localization keys/values present, with Chinese compressed as Unicode escapes |
| `target/release/app.exe` | passed, `NotSigned` | 26,554,880 bytes; SHA-256 `0E89BAA43909EB90882A23F216CBE72E1F9AE4A6EC47B9648D1211FACDCBC20C` |
| MSI | passed, `NotSigned` | 16,646,144 bytes; SHA-256 `86D3A7DFF6BE023873894A7F946D625A705D84D3C1982EB1A38FA109DC6CC9D6` |
| NSIS | passed, `NotSigned` | 15,037,062 bytes; SHA-256 `CE489211A2534107C596B9CB1CE2A6C61DACAEE2FD7804DB33AF4823FC4F2E4E` |
| `update-desktop -DryRun -KeepBackups 9` | passed, no changes | Selected exact NSIS/install/uninstall targets and only PID `107680`; eight existing backups, no planned removal |
| `update-desktop -KeepBackups 9` | passed | Stopped only exact-path PID `107680`, captured uninstall snapshot, installed byte-identical app `0E89BAA4…C20C`, retained nine backups |
| newest backup | passed | `Happy (dev)-windows-20260831-015534` contains predecessor app `E248B306…07D1`, `uninstall.exe`, and 446-byte `uninstall-registry.json` |
| `verify-desktop` | passed | Launched and stopped only PID `48584` at `C:\Users\myartings\AppData\Local\Happy (dev)\app.exe` |

### Installed-client interaction and accessibility receipt

- Broad read-only/bounded daily-loop inspection covered Home, bounded palette,
  owning Session, transcript/tool actions, Composer, Changes, All Files, Side
  Chat picker, Settings/About/Appearance, Machines/Agents, Todo, Issues,
  Artifacts, Inbox, and New Session. No prompt, Agent, permission, Issue, Todo,
  Artifact, or Side Chat mutation was submitted.
- Appearance was temporarily cycled Adaptive → Light → Dark → Adaptive and the
  original Adaptive value was visibly restored. Historical installed package
  smoke plus deterministic suites cover 1682/1469/1199/1099/719 x 479.
- Final exact-path PID `98340` UIA directly exposed the Changes-panel action
  `收起工作区面板` and New Session editor name/description `你想做什么？`.
  Clicking the command launcher, pressing Escape, and then Enter visibly
  reopened the palette, proving final-package focus restoration.
- Current Codex automation remains policy-blocked by its `ChatGPT.exe`
  manifest. This is retained as a visual-reference limitation; no matched
  pixels are fabricated. WeChat intermittently occluded screenshots and was
  not manipulated.

### Claim boundaries

- The Tauri `__TAURI_BUNDLE_TYPE` warning remains; updater compatibility is not
  claimed. The package is a local unsigned development client, not a release.
- Manual rollback is documented and recovery inputs are hash-bound, but
  intentional rollback execution remains unauthorized and was not performed.
- The unchanged native-Windows Server POSIX-path fixture result remains 105/107
  outside the protected client boundary. No Server code was changed.
- No commit, push, PR, signing, publication, release, official-baseline
  replacement, auth/permission payload, protocol, sync, Server/Machine RPC, or
  data-migration action occurred.

## Final configured check and whole-diff review — 2026-08-31

- `python scripts/workflow-check.py --record codex-first-happy-client` executed
  all eight configured commands against the final source. App and Server
  typechecks passed; Happy App passed 220 files / 1761 tests; workflow
  validation, 14 core tests, 14 CI tests, and strict audit passed.
- Happy Server repeated 105 / 107. Only the unchanged attachment-download and
  project-avatar local-file fixtures failed because their POSIX `/tmp` mocks do
  not match native Windows path resolution. `git diff -- packages/happy-server`
  is empty. The check gate is therefore `accepted_gaps`, not fabricated green.
- Whole-diff review covered 65 tracked and 72 untracked paths with zero staged
  paths. Repository-declared protected paths and the stricter auth/sync
  operation/protocol/Server/CLI boundary are empty; dependency, binary,
  secret-marker, and unfinished-code-marker scans found no new entry.
- The tracked and installed pre-push guards both hash to
  `925EEAF87154601D261886F4DED9AA6EE10415355FFCFFBF61B8B9ABAF9BCDCC`.
  Review found no remaining actionable source issue after the final two
  packaged RED→GREEN localization/wiring fixes.
- Acceptance coverage is complete: 28 criteria are `verified`; AC-002, AC-029,
  AC-031, and AC-032 use three accepted-gap families covering the exact
  policy/authority/unchanged-fixture claim boundaries.
- Final cleanup path-checked and stopped only installed PID `98340`. A
  subsequent read-only audit reports zero target processes, the exact temporary
  build config absent, installed SHA-256 still `0E89BAA4…C20C`, nine backups,
  and newest recovery point `Happy (dev)-windows-20260831-015534`.
