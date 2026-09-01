# Journal: `codex-first-happy-client`

## `2026-08-30`

- Started workflow.
- Recorded accepted product direction: global Codex-first desktop shell, Happy
  functionality preservation, macOS-first delivery, complete daily-use loop,
  and one final user acceptance review.
- Updated `docs/PRD.md`; fresh runtime reference and Happy baseline evidence are
  required before specification generation.
- Identified the installed Codex reference as `com.openai.codex` version
  `26.820.60940` build `7119`; completed a facts-only current bundle inspection.
- Reused the latest valid populated Codex light baseline from 2026-08-12 and
  recorded the current-host limitation: Computer Use is prohibited for Codex
  and named-window capture of the current build failed.
- Captured the installed Happy development shell at 1470×873 pt and validated a
  product-side visual evidence record. The capture proves the current sidebar
  hierarchy but not a populated conversation state.
- Built the current worktree successfully as a Tauri release App bundle. Direct
  bundle launch and stable-signing probes were non-destructive; the installed
  development client was restored afterward.
- Replaced the attempted Web validation path with packaged-App validation at
  the user's request so existing login state and native desktop behavior remain
  authoritative.
- Added the complete daily-loop gap matrix and initial feature-preserving
  deviation ledger. The largest remaining product gap is the global shell and
  information architecture rather than the already implemented Studio
  conversation primitives.
- Generated `docs/specs/codex-first-happy-client.md` as the implementation-neutral
  contract for the authenticated packaged macOS daily loop. It defines 32
  verifiable acceptance criteria, preserves the existing protocol and
  cross-platform boundaries, and maps each criterion to planned proof.
- Generated `docs/tasks/codex-first-happy-client-tasks.md` with ten dependency-
  ordered slices from the packaged-desktop runtime contract through final App
  evidence and review. No external tracker item was created.
- Fast-forwarded `smooth-valley` to the current `dev` commit `a269068a` before
  product edits, preserving the newly integrated Codex Fast mode and personal
  feature settings as part of the functional baseline.
- Completed a risk assessment with controls. Client presentation and existing-
  route composition may proceed; permission payloads, authentication,
  authorization, encryption, sync, protocols, data migration, destructive
  verification, and public release remain outside the cleared boundary.
- Recorded a serial batch plan for T01–T10 in the existing worktree and a
  `ready` scoping result bounded initially to T01. The main Goal session owns
  all edits; no subagents, parallel writers, external tracker items, or PRs are
  used.
- Completed T01. A new pure Codex-first desktop contract and thin current-runtime
  adapter make packaged macOS default to `Happy Codex`, keep Windows on the
  pre-follow-up experience, preserve standalone Web/mobile, reuse Studio and
  panel primitives, define project-first/global-destination intent, and expose
  `EXPO_PUBLIC_HAPPY_CODEX_FIRST=0` as a data-migration-free development
  rollback.
- During T01, Vitest initially parsed React Native through the current-runtime
  adapter and failed on Flow syntax. Diagnosis isolated the pure resolver from
  the environment adapter; the original reproduction and nearby suites then
  passed. A separate stale Expo route-type cache from the new `dev` base was
  regenerated with an offline Expo start, after which Happy App typecheck
  passed without product changes.
- Completed T02. The authenticated packaged-macOS host now injects one
  Codex-first runtime contract into a dedicated `Happy Codex` sidebar shell.
  It exposes visible Search and Inbox controls, compact New Session / enabled
  Tasks / enabled Issues / Artifacts / Machines navigation, route selection,
  task counts, archived-Session visibility, and the existing Settings footer.
  The command palette is on by default only for the Codex-first desktop shell;
  the prior opt-in remains authoritative everywhere else. The legacy shell
  remains intact behind the T01 rollback. Twenty focused tests and Happy App
  typecheck pass.
- Completed T03. Codex-first desktop defaults to the existing project/workspace
  hierarchy while retaining the explicit flat chronological preference. It
  removes the redundant outer Machine header, hides the project Machine
  subtitle for a single Machine, and restores it for multi-Machine
  disambiguation. The command palette now indexes enabled destinations, every
  local Session, project, path, and Machine without a remote API. The Inbox
  affordance shows a deduplicated attention count, and `input_required` now
  joins permission/unread Sessions in the existing leading attention section.
  Notification routing and attention-marker regression suites remain green.
- Completed T04. The authenticated Codex-first home no longer leaves the main
  tablet canvas blank: it now resolves eight explicit loading, connection,
  archive, empty, and ready states; offers the relevant retry, connect,
  troubleshoot, Machine, archive, New Session, and recent-project actions; and
  keeps the legacy tablet presentation intact outside the packaged runtime.
  The wide packaged New Session route now defaults to the existing prompt-first
  centered composer with its complete contextual configuration rail, without
  changing `machineSpawnNewSession(spawnOptions)` or any draft/spawn semantics.
  The T04 regression suite passed 106 tests and Happy App typecheck passed.
- Completed T05. The existing global packaged Studio conversation grammar now
  consumes the Codex-first runtime contract at the header, transcript, and
  Composer seams. Evidence-backed geometry converged from the old 54pt header
  and 832/800pt list/Composer to a 46pt header, 750pt content/Composer alignment,
  and the observed 108pt floating input surface. The default light user bubble
  uses the observed neutral surface and compact measure; explicitly selected
  Happy bubble colors remain visible. Assistant prose stays unboxed, and
  existing Markdown, ANSI, selection/copy, scroll anchoring, attachment,
  backend controls, send, and stop paths remain unchanged.
- The complete T05 suite initially exposed two stale assertions already present
  at `HEAD`: production Markdown had gained a truthful button role and
  `externalCopyHandler` selection suppression while its tests still expected
  the older source. Baseline inspection confirmed no production regression;
  only those assertions were updated. The resulting 108-test suite, Happy App
  typecheck, and diff whitespace check pass.
- Completed T06. The existing execution transcript, tool hierarchy, output
  disclosure, patches, tool groups, and Composer lifecycle now resolve through
  the same backend-independent packaged desktop contract. A pure decision
  lifecycle projects pending, submitting, resolved, expired, and disconnected
  states and holds a successful request locally until authoritative state
  arrives.
- Permission buttons, inline choice forms, custom-answer modal, and unsupported
  communication dismissal now share a synchronous exact-once gate. Codex and
  Claude provider payloads and argument order remain unchanged; rejected
  operations release the gate and preserve drafts/selections for retry.
  Connected-state gating and button/radio/checkbox accessibility metadata make
  blocked actions truthful without changing Session RPC, sync, Server, or CLI
  code.
- The expanded T06 run initially found thirteen instances of one stale
  `ToolViewStudioPresentation` expectation. Both the current file and
  `git show HEAD` use `marginVertical: 2`; only the obsolete test expectation
  was corrected. The final T06 matrix passes 186 tests, Happy App typecheck,
  diff checking, and a protected protocol-path audit.
- Completed T07. Codex-first desktop now promotes the existing Changes/files/
  Issues/side-chat workspace through one capability-gated action family and
  shared 46pt right-panel surface while retaining file/diff overlay history,
  GitHub flags and selection, side-chat lifecycle, and device-local resize
  state. The legacy feature preferences remain authoritative outside the
  packaged contract.
- A focused RED regression exposed that file-capable Sessions without Side Chat
  would lose their Changes/Files launcher when quick-panel mode became global.
  The layout now shows file controls independently, hides unavailable Side Chat,
  and renders the Issues control only when its existing flag/capability gate is
  true.
- Workspace selectors now consume the shared overlay palette and viewport
  clamping, support wrapped arrow/Home/End selection, Enter/Space activation,
  Escape/outside dismissal, and return focus to their trigger. The global
  overlay resolver now consumes the Codex-first packaged-runtime contract.
- Command/search adds every existing Settings destination without duplicates or
  bypassing experimental flags. The Settings landing page uses compact explicit
  `Happy Codex` identity and a bounded desktop surface while preserving all
  existing account, connection, purchase, external-link, and destructive
  confirmation effects.
- The final T07 matrix passes 205 tests across panels, overlays, palette,
  GitHub Issues, Settings/local-settings compatibility, side-chat layout, and
  every prior Codex-first slice. Happy App typecheck, diff checking, and the
  protected operation/protocol/Server/CLI path audit pass.
- Completed T08. A pure desktop-hardening projection now keeps the packaged
  Codex-first shell active at the configured 720 x 480 minimum instead of
  falling through Happy's physical-device tablet heuristic. It defines narrow,
  standard, and 1470pt reference tiers; preserves the project sidebar until
  explicit Zen; collapses the right workspace below 1100pt; and never rewrites
  stored panel widths while collapsed.
- The same packaged-desktop decision is consumed by the navigator, home canvas,
  Session workspace, and conversation header. Standalone Web, iOS, and Android
  continue to use the prior device-layout decision, and narrow packaged Issues
  uses the existing modal fallback rather than opening an invisible panel.
- Desktop header and workspace controls now expose button/tab/menu roles,
  selected/disabled/expanded states, keyboard-visible focus rings, wrapped menu
  selection, and focus return. The Command Palette captures its invoking
  control, restores focus after dismissal, and suppresses Studio opening,
  closing, and result-scroll motion when the platform requests reduced motion.
- T08 records light as directly reference-backed and dark/adaptive-dark as
  Happy adaptations, with AA contrast assertions for the actual primary and
  secondary text pairs. Its deterministic matrix passes 177 tests; the T07
  cross-task matrix passes 215 tests; Happy App typecheck, diff checking, and
  the protected operation/protocol/Server/CLI audit pass.

- 2026-08-30: T08 complete: 177-test deterministic matrix, 215-test cross-task regression, Happy App typecheck, diff check, and protected-path audit pass.

- 2026-08-30: T09 packaged candidate built and installed at /Applications/Happy (dev).app; strict signature/bundle identity/hash/launch passed, previous dev App retained at Happy Devtools backup 20260830-052008. Fixed happyctl codesign pipeline SIGPIPE false failure with a long-output smoke regression. Packaged visual and interaction capture is temporarily pending because the macOS console is locked; no unlock attempt was made.

- 2026-08-30: Continuation audit: current Happy App typecheck and full 215-file/1736-test suite pass; Happy Server typecheck and 15-file/107-test suite pass; workflow validator/core/CI pass and strict active audit is pass-with-gaps only for future implementation/review/finish gates. Validation now maps all AC-001 through AC-032 and records package/signature/install/backup/privacy receipts. macOS console remains locked, so T09 visual/interaction and rollback smoke are still unproven.

- 2026-08-30: Third consecutive Goal turn confirmed the same external blocker: the on-console macOS session remains locked while the exact installed Happy (dev) candidate process is alive. All non-GUI implementation, full App/Server checks, workflow validation, bundle/signature/hash/install/backup/launch checks, privacy audit, and AC-001–AC-032 evidence mapping are complete. Trustworthy packaged visual, accessibility, keyboard, daily-loop, and rollback smoke cannot proceed until the user unlocks the console.

- 2026-08-30: The user explicitly resumed the Goal after unlocking. The first authenticated package review found two bounded presentation defects: the Settings footer still described a mobile client, and the dark Session Composer retained a white shell. Added Codex-first English/Simplified-Chinese footer copy and theme-aware Composer presentation through focused RED/GREEN tests; Happy App typecheck and diff checking passed.
- 2026-08-30: Rebuilt, stably signed, safely installed, verified, and launched the corrected candidate. Only `/Applications/Happy (dev).app` was replaced; the previous candidate remains recoverable at `Happy Devtools/backups/Happy (dev)-20260830-141636.app`. The corrected installed executable SHA-256 is `52e9c115b9c857bff0150a2c8a52fba9d3b03e133c8cc9a774f4565571618c27`.
- 2026-08-30: During post-install capture the candidate initially appeared blank. Same-host comparison showed the prior package rendered correctly, Chromium rendered the current export correctly, the new Tauri process had a live WebView and no termination/error receipt, and macOS reported `com.apple.loginwindow` as the frontmost application. The evidence strongly suggests a lock-state first-paint suspension, but that diagnosis remains provisional until the corrected package is rerun while unlocked; it is not yet classified as either a product regression or a cleared condition. Started a temporary `caffeinate -dimsu` guard for the next unlock.
- 2026-08-30: Reran whole-source verification after the packaged-review fixes: Happy App 215 files / 1737 tests, Happy Server 15 files / 107 tests, both typechecks, workflow validator, 14 core tests, 14 CI tests, and all applicable devtools signing/baseline/guard/release smokes pass.
- 2026-08-30: Built and stably signed the development rollback configuration with `EXPO_PUBLIC_HAPPY_CODEX_FIRST=0`, preserving it privately at `/Users/myartings/Sync/tmp/codex-first-happy-client/rollback/Happy (dev)-legacy-20260830-142935.app`; then restored the normal ignored build output. Runtime rollback proof remains gated only by the re-locked console.
- 2026-08-30: Whole-diff review found one bounded contract gap: Command Palette search subscribed only to active Machines, so an offline Machine name could disappear from otherwise local search. Added an expected failing wiring assertion, switched the provider to `useAllMachines({ includeOffline: true })`, and passed the five focused search/wiring tests, Happy App typecheck, and diff check.
- 2026-08-30: Rebuilt and stably signed the post-review candidate, installed it recoverably at `/Applications/Happy (dev).app`, and verified exact executable identity (`9393c471dea2fe2b512a3a807c1a2a554f6f6be92fa86c09f5b91f2c045cde5e`), bundle identity, strict signature, and Team `MJS6V7A44A`. The replaced candidate remains at `/Users/myartings/Library/Application Support/Happy Devtools/backups/Happy (dev)-20260830-144500.app`. The full 215-file / 1737-test Happy App suite passes; launch is intentionally deferred until the console is unlocked so first-paint evidence is trustworthy.
- 2026-08-30: Continued whole-diff review found two additional bounded contract gaps. Raw all-Session search could expose Happy Side Chat child Sessions, and newly added Settings search metadata was hard-coded in English. Both were reproduced with expected failing tests; Codex-first search now filters hidden Side Chats, and Settings entries resolve display copy through existing localization keys. The focused 12-test matrix, Happy App typecheck, diff check, and complete 215-file / 1737-test suite pass.
- 2026-08-30: Rebuilt the fully reviewed source in both normal and `EXPO_PUBLIC_HAPPY_CODEX_FIRST=0` configurations. The stably signed normal build is installed at `/Applications/Happy (dev).app` with SHA-256 `c11e0b0c0eaca7b1743a6bc0cb656796a8d19a9a1fe25e99bfe2cacfe091731c`; its replaced predecessor is recoverable at `/Users/myartings/Library/Application Support/Happy Devtools/backups/Happy (dev)-20260830-150027.app`. The synchronized signed rollback package is private at `/Users/myartings/Sync/tmp/codex-first-happy-client/rollback/Happy (dev)-legacy-final-20260830-150327.app` with SHA-256 `f09105cd4ddbef37d96172ce963253b6c97dc99ccd1144abbf01b070bbfe71f9`, and the ignored build output was restored to the byte-identical normal candidate.
- 2026-08-30: The user authorized a Windows ownership transfer because the macOS console is locked and they are away from that machine. Generated a formal cross-machine session handoff from the active workflow. The Windows continuation is allowed to reconstruct the exact dirty tree and begin a tested native-Windows adaptation/package slice; it cannot count Windows pixels as the missing macOS acceptance evidence. The current macOS worktree, index, installed candidate, and rollback packages remain untouched, and no commit or push is authorized.
- 2026-08-30: Prepared the private Syncthing Windows relay as an exact-base tracked binary patch plus untracked ZIP, content manifest, SHA-256 inventory, source status, native PowerShell restore guard, and fresh-session prompt. A local clean-worktree rehearsal reconstructed all 123 changed/untracked files with zero hash mismatches, preserved `HEAD` at `a269068a`, passed `git diff --check` and ZIP integrity, and removed only the successful temporary verification worktree.

- 2026-08-30: Windows owning Root verified the exact registered worktree, branch, HEAD, restored dirty state, and strict audit; reconciled active/task ownership from smooth-valley; consumed and removed the one-time Temp handoff; recorded ready scoping for a RED-only public contract slice; baseline passed 6 tests; the new packaged-Windows/Linux/standalone contract test produced the intended 6-pass/1-fail RED without production changes. Full pnpm postinstall remains a recorded Skia Unix-rm-on-Windows setup gap, but focused Vitest is operational.

- 2026-08-30: Windows eligibility GREEN complete. Changed only the pure packaged-desktop availability predicate to accept macOS or Windows. The target passed 7/7, focused contract/runtime/responsive passed 18/18, complete Codex-first shell passed 67/67, and full Happy App passed 215 files/1738 tests. Initial Happy App typecheck failed because the fresh worktree lacked ignored @slopus/happy-wire dist; building that workspace package fixed the exact reproduction and typecheck passed. Diff check and protected operation/protocol/Server/CLI audit pass; no package install, launch, commit, push, or publication occurred.

- 2026-08-30: Windows native package slice passed: exact-worktree doctor required one idempotent shared-clone push-guard repair, then passed Node/MSVC/Rust/WebView2; build-desktop produced unsigned x64 app/MSI/NSIS artifacts; update-desktop -DryRun preserved the live install, registry, process, and three backups; exact 59 tracked / 64 untracked / 0 staged content state was unchanged. Actual install, replacement, launch, signing, commit, push, and publication remain unauthorized.

- 2026-08-30: Final machine-state audit found the shared common pre-push hook had been replaced by the primary checkout CRLF copy after package work; scheduled refresh and concurrent-process checks did not identify the writer. Reinstalling from the exact owning worktree restored the tracked LF hash and a full doctor rerun passed. Record this as environmental guard drift, not product failure.

- 2026-08-30: The user explicitly authorized the bounded native Windows install and verification slice. Exact-worktree doctor and `update-desktop -DryRun -KeepBackups 4` passed; the actual updater stopped only the prior `Happy (dev)` PID, retained a complete dated backup plus uninstall-registry snapshot, silently installed the reviewed NSIS candidate, and proved the installed/build executable SHA-256 is `af18d94139109ebf2fe7b90237f7c5213705210e508f26b4b0ba2854c9416236`. `verify-desktop` then observed the exact installed process path and stopped its verification process. Four backups remain, source content digests are unchanged, protected paths are clean, the temporary config was removed, and no signing, commit, push, publication, release, functional GUI mutation, or rollback execution occurred.

- 2026-08-30: Whole-diff acceptance review is blocked without product edits. Three P1 findings remain: the Session-derived notification badge always opens the social Inbox, the 1100-point New Session composition leaves 495 points instead of the required 600-point main region, and 720 x 480 can render both the global persistent Header and route-local phone Headers. One P2 finding leaves duplicate recent-project names across Machines visually and accessibly indistinguishable. Focused 110/110 and full Happy App 1738/1738 tests plus App/Server typechecks, workflow core/CI, diff/protected/secret audits, relay parse, and simulated-Darwin signing smoke pass. Native-Windows Server tests reproduce two unchanged POSIX-path mock failures (105/107 pass). Review/check must remain blocked; finish and macOS runtime/rollback evidence remain pending.

- 2026-08-30: TDD remediation closed all three P1 findings and the P2 ambiguity. Notification targeting now selects an existing attention Session with Inbox fallback; New Session budgets its route-local rail against the projected persistent-left width and protects 600pt of main content; packaged Header ownership suppresses duplicate narrow route/phone back controls while retaining legacy behavior; duplicate Recent Projects add existing Machine identity visually and accessibly only on collision. Every behavior produced its expected focused RED before the smallest GREEN. The combined focused family passed 7 files / 30 tests, the composed width matrix passed 4 / 4, Happy App passed 217 files / 1747 tests, both typechecks passed, workflow validator/core/CI and diff/protected audits passed, and repeat semantic review found no code blocker. The machine check remains blocked only by the unchanged 105/107 native-Windows Server fixture result and missing current packaged/macOS acceptance evidence; the installed Windows candidate now predates these source fixes. No issue, package rebuild/install/launch, rollback execution, commit, push, publication, or release was created or performed.

- 2026-08-30: The user selected the recommended current Windows rebuild/install validation. Preflight reconfirmed the exact owning worktree/branch/HEAD, empty index, strict audit, historical installed hash, exact uninstall target, no running target process, and four existing Windows backups. Decision D10 and the current risk/scoping plan authorize focused/full App checks, worktree-bound doctor/build, fresh unsigned artifact inspection, dry-run and recoverable replacement with `KeepBackups=5`, exact launch verification, and non-destructive packaged inspection. Signing, intentional rollback, commit, push, PR, publication, release, account/permission mutation, Agent execution, and protected Server/protocol work remain excluded.

- 2026-08-30: Current remediated Windows package validation passed within D10. The 8-file/34-test remediation family, Happy App 217 files/1747 tests, and App/Server typechecks passed; exact-worktree doctor and build produced unsigned x64 app/MSI/NSIS hashes `CEBB6EBE…046F1`, `B2746195…7719`, and `380C01FC…A846`. A `KeepBackups=5` dry-run made no changes or removals, the actual update retained five complete backups plus registry snapshots, installed/build app hashes match, and `verify-desktop` proved the exact installed path. Bounded installed-App inspection passed at 1682, 1469, 1199, 1099, and 719 x 479: the New Session Composer stayed usable, configuration stacked at narrow sizes, and one persistent Header owned back/forward controls. Naturally repeated `agent-skill-registry` context carried distinct macOS/Windows labels; no attention/read-state action, prompt, send, Session start, settings change, permission action, or external operation was performed. The path-confirmed inspection PID was stopped, target process count is zero, the temporary config was removed, source/protected/staged integrity and the push guard pass, and the complete check repeats only the unchanged native-Windows Server fixture failures (105/107). macOS daily-loop/appearance/accessibility and rollback execution still block finish; no issue, commit, push, PR, signing, publication, or release occurred.

- 2026-08-30: Created the formal Windows-to-macOS continuation session and a private cross-device handoff at `Sync/docs/handoffs/2026-08-30-codex-first-happy-client-windows-to-macos-final-acceptance.md` (SHA-256 `06853A34CBB6BB49B523726A0F197A49FA9855AA19C1F08A5B9C803C9925019C`). The handoff records the current Windows source/package/test evidence, Mac-only acceptance requirements, historical macOS artifact hashes, exact authority boundary, and a source-parity stop condition: because no commit, push, or reverse relay occurred, the macOS owner must not rebuild from `smooth-valley` until it proves it contains the Windows eligibility change and all four TDD remediations. Workflow validation and strict audit pass-with-gaps; finish remains pending.

- 2026-08-30: The user's persistent Goal superseded the earlier macOS-first/current-Windows-read-only acceptance boundary. Added D11 and reconciled the PRD, specification, tasks, scope, risk gate, validation, and task ownership around packaged Windows as the complete current acceptance target, with the currently installed native Windows Codex Desktop as the fresh reference. Historical macOS and Windows receipts remain claim-bounded; macOS native adaptation is deferred and Windows evidence will not be relabeled as macOS evidence. T09 is reopened for matched same-size/theme/state capture, the full surface inventory, keyboard/UIA inspection, a bounded real daily-use loop, and any required TDD repairs; T10 is pending final review/evidence closure. No product edit, commit, push, PR, signing, publication, release, protected-boundary change, or rollback execution occurred.

- 2026-08-30: Native Windows inspection found the installed Home Canvas falsely reported `无法连接` while visible Session rows reported connected Machines. Retry reproduced the same state. Diagnosis traced the canvas to voice `useRealtimeStatus()` rather than the primary sync socket. Added a component-level RED with socket connected/voice disconnected (1/1 intended failure), switched the canvas to `useSocketStatus()`, clarified the resolver input as `connectionStatus`, and passed 2 files/11 tests, the complete Codex-first 22-file/76-test family, and Happy App typecheck. The installed package is now stale and cannot be final evidence. The current Windows reference package is `OpenAI.Codex` 26.825.4187.0 but manifests as `ChatGPT.exe`; Computer Use policy forbids driving that UI, so no bypass occurred. Concurrent foreground activity later made Happy element indexes/focus unreliable, so further UI input stopped without sending content or changing settings/permissions/account state.

- 2026-08-31: Completed post-GREEN regression for the false-offline repair: Happy App passed 218 files / 1748 tests; diff check, workflow validation, and strict active audit passed; the index and protected auth/encryption/sync/Server/CLI diff remained empty. Stopped only the path-confirmed pre-fix `Happy (dev)` process launched for inspection. The source is ready for a fresh exact-worktree Windows build and recoverable replacement; no commit, push, PR, signing, publication, release, or rollback execution occurred.

- 2026-08-31: Fresh false-offline-fixed Windows candidate rebuilt and recoverably installed with exact installed/build SHA-256 CE248FA7EEC8D64DAB87D5D9E5617480B0385DFE833A7C3EA88C81AE1B0F6A6D; six backups retained. Installed Home no longer renders false offline. Full UI/reference/daily-loop acceptance remains pending.

- 2026-08-31: The matching no-change `KeepBackups=6` dry-run preceded the exact update; all six backups and registry snapshots remain. Fresh 1682 x 1081 inspection showed the ready Home and no false `无法连接`. The updater toast was not allowed to restart or replace the hash-bound candidate. Current Codex automation remains prohibited because the Appx manifest executes `ChatGPT.exe`; later Happy coordinate input paused when a user-owned always-on-top WeChat window obscured the canvas. No unrelated window state, account, permission, message, Agent, protected path, rollback, commit, push, signing, publication, or release action occurred.

- 2026-08-31: Wrote the current Windows-owning Mac context handoff to `C:\Users\myartings\Sync\docs\handoffs\2026-08-31-codex-first-happy-client-windows-owning-macos-context.md` (SHA-256 `CCF0B2535558434DAA6C7070D4387B3D92407C33734F48DC980AE965EE1C97C4`). It explicitly supersedes the older macOS-first takeover wording, records D11, the 131-file unstaged source identity/digest, fresh build/install/Home evidence, remaining policy/foreground gaps, and tells Mac to treat the file as context rather than takeover or build authority.

- 2026-08-31: Whole-diff TDD acceptance review reproduced and repaired same-request modal gate reset, unsupported-banner false-enabled state, custom-answer forms routed to an option-only inline renderer, unbounded/duplicate command-palette activation, hard-coded Codex-first copy, and Codex-first visual behavior leaking into packaged Linux/legacy Studio. All public behavior produced expected RED evidence before the smallest GREEN; the final focused matrices pass 84 and 36 tests, Happy App typecheck passes, and the complete App suite passes 220 files / 1760 tests. Protected auth/encryption/sync/Server/CLI product paths remain untouched. The installed `CE248FA…F6A6D` package now predates source and is explicitly stale pending a fresh recoverable Windows rebuild/install with seven retained backups.

- 2026-08-31: Fresh packaged UIA found one last keyboard defect: Escape closed a command palette opened from the visible sidebar launcher but returned focus to the WebView root. A focused wiring RED failed 1/5; the minimal GREEN passes the launcher ref through the existing modal restoration seam, preserves shortcut fallback, passes 5/5 plus typecheck and the complete 220-file/1761-test App suite. The repaired unsigned Windows candidate (`app.exe` `E248B306…07D1`, MSI `A8F1F2E4…4A38`, NSIS `00CB3DE0…03AC`) passed doctor/build, a no-change `KeepBackups=8` dry run, exact-path recoverable replacement, installed/build hash equality, eight-backup retention, and `verify-desktop`. Final UI reinspection PID `122044` remains exact-path; the current Computer Use foreground probe refuses capture because the foreground window reports no process ID, and no unsafe automation bypass occurred.

- 2026-08-31: The foreground probe recovered and enabled a complete bounded packaged daily-loop inspection without unsafe automation. Home, bounded command palette, owning Session, transcript/tools/Composer, Changes, All Files, Side Chat picker, Settings/About/Appearance, Machines/Agents, Todo, Issues, Artifacts, Inbox, and New Session were inspected. A temporary Adaptive → Light → Dark → Adaptive appearance loop was immediately restored; no message, Agent, permission, Issue, Todo, Artifact, Side Chat, account, or external operation was created or changed.

- 2026-08-31: Live inspection found two final copy truthfulness gaps. The right-panel collapse action was Side Chat-specific even for Changes/Files, and Simplified-Chinese packaged New Session retained the legacy English placeholder. Each focused test first failed 1/5, then passed 5/5 after generic localized workspace copy and a Codex-first-only localized placeholder were wired. Standalone/legacy English behavior remains exact. App typecheck and the complete 220-file/1761-test suite pass.

- 2026-08-31: Built and installed the final unsigned Windows package. App/MSI/NSIS hashes are `0E89BAA4…C20C`, `86D3A7DF…C9D6`, and `CE489211…2E4E`. The no-change `KeepBackups=9` dry-run selected only exact-path PID 107680 and removed nothing; the update retained nine backups and installed byte-identical app `0E89BAA4…C20C`; verify launched/stopped only PID 48584. Backup `Happy (dev)-windows-20260831-015534` contains predecessor `E248B306…07D1` plus uninstall/registry recovery inputs. Final UIA on exact-path PID 98340 proved `收起工作区面板`, `你想做什么？`, and click → Escape → Enter command-palette focus return. Manual rollback remains documented and unexecuted; no commit, push, PR, signing, publication, release, updater restart, protected-boundary, or official-baseline action occurred.

- 2026-08-31: Final configured check ran all eight commands: App/Server typechecks, Happy App 220 files/1761 tests, workflow validation, workflow-core 14/14, workflow-CI 14/14, and strict audit pass; Server remains 105/107 only for two unchanged native-Windows POSIX `/tmp` fixtures and is accepted without an out-of-scope edit. Whole-diff review covered 65 tracked/72 untracked paths, an empty index, zero protected paths, and matching installed/tracked guard hashes with no remaining actionable finding. AC-001–AC-032 are closed as 28 verified plus four accepted-gap rows across three named limitation families; T10 and the Windows owning acceptance are complete without commit, push, signing, publication, release, or intentional rollback.

- 2026-08-31: Final cleanup stopped only exact installed-path PID 98340 and removed only the exact temporary worktree-binding config via patch. Reinspection proves zero target processes, no temp config, installed hash still `0E89BAA4…C20C`, and all nine recovery backups intact.
