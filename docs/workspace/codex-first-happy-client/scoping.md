# Scoping Result: `codex-first-happy-client`

## Result

**Ready**, initially for T01 only. Later tasks become ready in the dependency
order recorded in `batch-plan.md` after their preceding focused checks pass.

## Repository boundary

- Repository: `/Users/myartings/workspace/happy/.dev/worktree/smooth-valley`
- Branch/worktree: `smooth-valley`, dedicated feature worktree
- Base at scoping: current personal `dev`, commit `a269068a`
- Dirty state: accepted Codex-first PRD/spec/tasks/workflow evidence only; no
  product-code edits yet
- Intensity: **Feature** under `docs/workflow/intensity-matrix.md`

## Accepted contract

- PRD: `docs/PRD.md#codex-first-happy-desktop`
- Specification: `docs/specs/codex-first-happy-client.md`
- Tasks: `docs/tasks/codex-first-happy-client-tasks.md`
- Decisions: `decisions.md`; all material product decisions resolved
- Evidence/gaps: `reference-evidence.md` and `gap-matrix.md`
- Functional exceptions: `deviation-ledger.md`
- Risk: `risk-assessment.md`, cleared with controls for client presentation only

## Tracker and execution mode

No human-visible tracker boundary is required. This is an active, local-only
personal product Goal in a dedicated worktree with one implementation owner,
immediate execution, no handoff queue, no PR delivery, and no external
coordination. `task-links.md` records the exception.

The broad task queue is governed by `batch-plan.md`. The main session executes
serially; no subagent or concurrent writer owns source files.

## Initial implementation context: T01

- `CONTEXT.md`, `.ai/project.json`
- Accepted feature spec/tasks and workflow risk/validation records
- `packages/happy-app/sources/features/studio-visual-style/**`
- `packages/happy-app/sources/features/studio-overlays/**` build-configuration
  evidence where it establishes current packaged activation
- `packages/happy-app/sources/sync/localSettings.ts` and tests
- `packages/happy-app/sources/utils/isTauri.ts`
- Happy App desktop build scripts/configuration only for read-only verification

T01 may add `packages/happy-app/sources/features/codex-first-shell/**`. It may
touch local settings only if a development rollback requires a persisted key;
a non-persisted build/runtime override is preferred when it meets the contract.

## Expanded implementation context: T02

T01's focused suite and Happy App typecheck pass, so T02 is ready within the
existing client-presentation risk clearance. The bounded host seams are:

- `packages/happy-app/sources/components/SidebarNavigator.tsx`
- `packages/happy-app/sources/components/SidebarView.tsx`
- `packages/happy-app/sources/components/CommandPalette/**`
- existing app routes used only for truthful navigation targets
- `packages/happy-app/sources/features/codex-first-shell/**`

T02 may compose the existing command palette and routes into the packaged-macOS
shell. It must not change command execution, authentication, notification
delivery, synced settings shape, Session state, or protocol payloads.

## Expanded implementation context: T03

T02's focused suite and typecheck pass. T03 may add pure project/search/attention
projections and touch these existing client seams:

- `packages/happy-app/sources/components/SessionsList.tsx`
- `packages/happy-app/sources/components/ProjectGroup.tsx`
- `packages/happy-app/sources/components/MainView.tsx`
- `packages/happy-app/sources/components/CommandPalette/**`
- `packages/happy-app/sources/hooks/useVisibleSessionListViewData.ts`
- `packages/happy-app/sources/utils/visibleSessionListViewData.ts`
- their focused public-interface tests

The synced/local settings schemas and persisted values remain unchanged. T03
may only project the existing grouped/flat preference, existing local Session
and Machine data, existing inbox route, and existing attention markers.

## Expanded implementation context: T04

T03's focused and notification suites pass. T04 may touch:

- `packages/happy-app/sources/app/(app)/index.tsx`
- `packages/happy-app/sources/app/(app)/new/index.tsx`
- `packages/happy-app/sources/components/MainView.tsx`
- existing empty-state components only through a narrow Codex-first branch
- `packages/happy-app/sources/utils/newSessionSidebarLayout.ts`
- existing New Session draft/start/discovery/picker utilities and tests
- localization files for new accessible empty-state copy

Spawn options, RPC calls, idempotency, failure recovery, draft storage, and
standalone/mobile layouts remain compatibility oracles and cannot be changed by
the presentation slice.

## Expanded implementation context: T05

T04's 106-test regression suite and Happy App typecheck pass. T05 may calibrate
and globally compose the already implemented packaged-desktop Studio grammar
through these bounded seams:

- `packages/happy-app/sources/features/studio-conversation-layout/**`
- `packages/happy-app/sources/features/studio-semantic-text/**`
- `packages/happy-app/sources/features/studio-composer/**`
- `packages/happy-app/sources/features/codex-first-shell/**`
- `packages/happy-app/sources/components/ChatHeaderView.tsx`
- `packages/happy-app/sources/components/ChatList.tsx`
- `packages/happy-app/sources/components/MessageView.tsx`
- `packages/happy-app/sources/components/AgentInput.tsx`
- `packages/happy-app/sources/-session/SessionView.tsx` only if a narrow host
  seam is required

The captured Codex evidence authorizes the approximately 46-point header,
740–750-point reading/composer measure, neutral default user bubble, unboxed
assistant prose, and dominant floating composer. Backend selection, message
send/stop, draft, attachment, Markdown/link/copy, scroll anchoring, transcript,
permission, tool, and panel behavior remain compatibility oracles. A selected
non-default Happy user-bubble color remains visible rather than being erased
for parity. Standalone Web/mobile geometry cannot change.

## Expanded implementation context: T06

T05's 108-test conversation regression suite, Happy App typecheck, and diff
check pass. T06 may promote the existing Studio execution grammar through the
same packaged-macOS runtime contract and harden only the client-side decision
lifecycle at these bounded seams:

- `packages/happy-app/sources/features/studio-execution-transcript/**`
- `packages/happy-app/sources/features/studio-tool-presentation/**`
- `packages/happy-app/sources/features/studio-tool-output-disclosure/**`
- `packages/happy-app/sources/features/studio-composer/**`
- `packages/happy-app/sources/features/codex-first-shell/**`
- `packages/happy-app/sources/components/ToolGroupView.tsx`
- `packages/happy-app/sources/components/tools/ToolView.tsx`
- `packages/happy-app/sources/components/tools/PermissionFooter.tsx`
- `packages/happy-app/sources/components/tools/views/InlineQuestionForm.tsx`
- `packages/happy-app/sources/components/tools/views/AskUserQuestionView.tsx`
- `packages/happy-app/sources/components/tools/views/RequestUserInputView.tsx`
- `packages/happy-app/sources/components/AgentQuestionBanner.tsx`
- `packages/happy-app/sources/components/AgentQuestionModal.tsx`
- `packages/happy-app/sources/components/AgentInput.tsx`
- focused public-interface and source-wiring tests for those seams

The existing `sessionAllow`, `sessionDeny`, `sessionAnswerQuestion`,
`sessionCancelCommunication`, `sessionAbort`, and `sync.sendMessage` calls and
their argument order are compatibility oracles. T06 must not edit transport,
RPC, reducer, synchronized storage, provider capability selection, or message
payload construction. Client-side submission gates may prevent duplicate
actions, retain retry after a rejected operation, and expose pending,
submitting, resolved, expired, and disconnected presentation. Standalone
Web/mobile behavior remains unchanged except for truthful accessibility
metadata and duplicate-submission protection shared by the existing controls.

## Expanded implementation context: T07

T06's 186-test tool/decision/Composer matrix, Happy App typecheck, diff check,
and protected protocol-path audit pass. T07 may compose existing secondary
workspace surfaces and Settings routes through these bounded seams:

- `packages/happy-app/sources/features/codex-first-shell/**`
- `packages/happy-app/sources/features/studio-overlays/**`
- `packages/happy-app/sources/features/studio-panel-resize/**`
- `packages/happy-app/sources/components/FilesSidebar.tsx`
- `packages/happy-app/sources/components/SideChatPanel.tsx`
- `packages/happy-app/sources/components/SideChatQuickPanelControls.tsx`
- `packages/happy-app/sources/components/SessionActionsPopover.tsx`
- `packages/happy-app/sources/components/CommandPalette/**`
- `packages/happy-app/sources/components/SettingsView.tsx`
- `packages/happy-app/sources/app/(app)/settings/**` only for narrow desktop
  presentation wrappers if required
- `packages/happy-app/sources/-session/SessionView.tsx` for one runtime-driven
  action/panel activation seam
- existing GitHub Issues presentation components as read-only capability and
  route oracles unless a narrow visual seam is necessary

The Codex-first shell may make the existing Changes/files/Issues/side-chat
action family visible by default and reuse existing device-local resize/panel
state. It must still honor capability and feature availability, preserve every
file/diff/Issue/side-chat operation, and must not invent commit, PR, or remote
repository actions. Existing destructive confirmations and authorization
checks remain authoritative. Overlay changes are limited to presentation,
viewport clamping, keyboard dismissal/selection, and focus return; Settings
changes may add route discoverability and product identity but not change
account, connection, purchase, or external-link effects.

## Expanded implementation context: T08

T07's 205-test panel/overlay/palette/Settings matrix, Happy App typecheck,
diff check, local-settings compatibility suite, and protected path audit pass.
T08 may harden only observable layout and interaction behavior through these
bounded seams:

- `packages/happy-app/sources/features/codex-first-shell/**` for pure
  narrow/standard/wide, appearance-evidence, motion, and accessibility
  projections
- `packages/happy-app/sources/components/SidebarNavigator.tsx`,
  `MainView.tsx`, `ChatHeaderView.tsx`, `FilesSidebar.tsx`, and
  `SideChatQuickPanelControls.tsx` for packaged-desktop layout, focus, and
  accessibility metadata
- `packages/happy-app/sources/-session/SessionView.tsx` for deterministic
  packaged-desktop/right-panel projection at narrow widths
- `packages/happy-app/sources/components/CommandPalette/**` and
  `packages/happy-app/sources/features/studio-overlays/**` for reduced-motion,
  focus, dismissal, and clamping behavior
- `packages/happy-app/sources/features/studio-panel-resize/**`,
  `packages/happy-app/sources/features/studio-visual-style/**`,
  `packages/happy-app/sources/keyboard/**`, and existing local-settings tests
  as compatibility oracles

The configured 720 x 480 minimum must retain a desktop Codex-first shell rather
than falling through the mobile device-size heuristic. The right workspace
collapses before navigation below its accepted 1100pt threshold; navigation
remains available unless the user explicitly enters zen mode. Persisted panel
widths and zen state must survive collapse and restoration. Standalone Web,
iOS, and Android continue to use the legacy device-layout decision. Reduced
motion may suppress only Codex-first/Studio animation and must not change
operation timing, payloads, or state transitions. No device-global breakpoint,
settings schema, auth, sync, protocol, Server, or CLI behavior is in scope.

## Test and validation seam

### Incremental

- Pure runtime/presentation projection tests for packaged macOS, packaged
  Windows follow-up compatibility, standalone Web, iOS, Android, and rollback.
- Existing Studio visual-style and desktop build-configuration tests.
- Existing local-settings default, old-state, and round-trip fixtures if local
  settings change.
- Happy App typecheck at T01 completion.

### Final applicable family

- Task-specific Happy App Vitest suites in T01–T08.
- Full `pnpm --filter happy-app exec vitest run` before packaging.
- `pnpm --filter happy-app typecheck`.
- Repository workflow commands from `.ai/project.json`.
- `devtools/happyctl build-desktop`, bundle/signature inspection, safe install,
  installed launch, and authenticated daily-loop smoke.

Happy Server tests are applicable only if the whole-diff audit shows an
unexpected Server change; such a change is currently outside scope and a stop
condition. No CLI implementation is planned.

## Risk and stop summary

Risk is passed with durable controls, not waived. Permission UI, account/system
route discoverability, private evidence, and App replacement receive dedicated
checks. Any need to alter payload, protocol, auth, sync, schema, or destructive
external state blocks the current contract.

## Next action

Run the strict pre-implementation workflow audit, enter implementation, use
`tdd` for the T01 observable runtime contract, and keep the code slice bounded
to the context above.

## Windows ownership addendum — 2026-08-30

### Result

**Ready** for one RED-only Windows eligibility slice owned by the current Root.
The accepted implementation action is limited to the public desktop-contract
test; the production GREEN, Windows package operations, and macOS acceptance
remain later actions.

### Repository and ownership evidence

- Session root:
  `C:\Users\myartings\workspace\happy\.dev\worktree\codex-first-happy-client-windows`
- Branch/worktree: `codex-first-happy-client-windows`, registered at the same
  absolute path
- Exact HEAD: `a269068ab42316a6e5749882cd81499aeb31fabb`
- Restored dirty state: the accepted 59 tracked and 64 untracked relay paths,
  plus only current workflow-evidence updates; no transferred product change
  was discarded or staged
- Ownership authority: decision D8 and the dated Windows-transfer session
  handoff; `task-links.md` now names the Windows owner while retaining
  `smooth-valley` as historical macOS ownership

### Accepted slice and test seam

- Public seam:
  `resolveCodexFirstDesktopContract({ hostPlatform, isTauriRuntime })`
- Allowed product path for this turn:
  `packages/happy-app/sources/features/codex-first-shell/codexFirstDesktopContract.test.ts`
- Required behavior: packaged Windows selects `codex-first`; packaged Linux
  and non-Tauri standalone clients retain `legacy-happy`
- Targeted command:
  `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell/codexFirstDesktopContract.test.ts`
- Baseline: passed 1 file / 6 tests before the RED edit
- Expected RED: only the packaged-Windows expectation fails against the current
  macOS-only eligibility predicate; Linux and standalone compatibility
  expectations pass

### Execution, tracker, and risk boundary

- Execution remains serial in the owning Root; no subagent, concurrent writer,
  external tracker item, PR, commit, push, install, launch, or publication is
  in scope.
- The existing client-presentation risk clearance applies. This RED-only test
  adds no authentication, authorization, synchronization, protocol, Server,
  Machine RPC, data-migration, destructive-operation, or release trigger.
- Stop if the RED fails for setup drift or any reason other than the current
  `hostPlatform === 'macos'` availability predicate.
- `pnpm install --offline --frozen-lockfile` linked all dependencies but its
  full postinstall exited on an upstream Skia script that invokes Unix `rm` on
  Windows. The targeted Vitest runner is present and the six-test baseline
  passes, so this environment gap does not weaken the RED evidence.

## Windows minimal GREEN continuation — 2026-08-30

### Result

**Ready** for the single production change that satisfies the recorded Windows
RED. The user's `continue` instruction authorizes this next guarded slice but
does not expand authority to package installation, launch, commit, push, or
publication.

### Allowed implementation

- Product path:
  `packages/happy-app/sources/features/codex-first-shell/codexFirstDesktopContract.ts`
- Existing test path:
  `packages/happy-app/sources/features/codex-first-shell/codexFirstDesktopContract.test.ts`
- Minimal behavior change: packaged Tauri availability accepts `macos` or
  `windows`; `linux`, `unknown`, and every non-Tauri runtime remain unavailable
- The one availability predicate remains the owner of both default enablement
  and `EXPO_PUBLIC_HAPPY_CODEX_FIRST=0` rollback availability, so Windows gains
  the existing migration-free rollback without a settings or schema change
- No refactor, platform-specific chrome, protocol, auth, sync, Server, Machine
  RPC, persistence, or host-component edit is required

### Incremental verification

1. Reconfirm the recorded RED in
   `codexFirstDesktopContract.test.ts` before the production edit.
2. Run that same target for GREEN.
3. Run the contract/runtime/responsive family:
   `codexFirstDesktopContract.test.ts`, `codexFirstDesktopRuntime.test.ts`,
   `codexFirstDesktopHardening.test.ts`, and
   `codexFirstHardeningWiring.test.ts`.
4. Run the complete `sources/features/codex-first-shell` suite and Happy App
   typecheck if the focused family remains green.
5. Repeat strict workflow, whitespace, and protected-path checks; stop on any
   unexpected failure rather than entering package operations.

## Windows native package-validation continuation — 2026-08-30

### Result

**Ready** for the bounded native Windows prerequisite, package-generation, and
installer dry-run slice authorized by decision D8 and the user's `continue`.
This slice does not authorize installation, replacement, launch, signing,
publication, or release.

### Exact source and command binding

- Source root:
  `C:\Users\myartings\workspace\happy\.dev\worktree\codex-first-happy-client-windows`
- Branch and base: `codex-first-happy-client-windows` at
  `a269068ab42316a6e5749882cd81499aeb31fabb`
- The machine-local Happy Devtools configuration points `HappyRepo` at the
  primary checkout, so it must not be used directly for this feature build.
- Each `happyctl.ps1` command in this slice must receive a repository-external,
  temporary `HAPPY_DEVTOOLS_CONFIG` that loads the existing machine settings
  and overrides only `HappyRepo` to the exact source root above. Remove that
  temporary file after evidence collection.

### Allowed operations and evidence

1. Run `.\devtools\happyctl.ps1 doctor` on native Windows and record the
   required commands, Git push guard, MSVC, stable MSVC Rust toolchain, and
   WebView2 prerequisite result.
2. If doctor passes, run `.\devtools\happyctl.ps1 build-desktop`. Its allowed
   writes are dependency/build output under project-declared generated paths
   (`node_modules`, `packages/happy-app/dist`, `.expo`, and
   `packages/happy-app/src-tauri/target`) plus machine-local Happy Devtools
   logs. No tracked-source mutation is accepted.
3. Record the resolved development identity, bundle targets, implicit WebView2
   installer mode, artifact paths/types/sizes/timestamps, and SHA-256 hashes.
4. Run `.\devtools\happyctl.ps1 update-desktop -DryRun` only. It may inspect
   the current install, processes, backup inventory, registry entry, and latest
   NSIS artifact but must end with `No changes made.`
5. Compare exact pre/post staged, tracked, and untracked Git state and rerun the
   strict workflow audit. Stop if any new tracked or staged change is caused by
   package generation.

The Tauri configuration resolves to `Happy (dev)` /
`com.slopus.happy.dev`, Windows bundle targets are inherited from
`bundle.targets = "all"`, and the installed local CLI schema gives the omitted
Windows WebView2 mode a default of silent `downloadBootstrapper`. Package
generation proves neither installation nor launch.

### Stop conditions

- Stop and diagnose if doctor reports a missing prerequisite, if package
  generation requests signing/release authority, or if the build cannot be
  tied to the exact worktree source.
- Stop if dependency setup or export changes tracked source, the lockfile, the
  accepted product diff, or any protected protocol/auth/sync/Server/Machine RPC
  path.
- Actual `update-desktop`, `verify-desktop`, runtime interaction, rollback
  replacement, commit, push, PR, and publication remain later, separately
  authorized operations.

## Windows authorized install-and-launch continuation — 2026-08-30

### Result

**Ready with recorded controls** for the exact local Windows development-client
replacement and bounded launch verification authorized by decision D9. This is
an additive T09 owning-host evidence slice, not a Windows release or substitute
for the remaining macOS acceptance.

### Exact source, candidate, and target

- Source root:
  `C:\Users\myartings\workspace\happy\.dev\worktree\codex-first-happy-client-windows`
- Branch/HEAD: `codex-first-happy-client-windows` at
  `a269068ab42316a6e5749882cd81499aeb31fabb`; 59 tracked and 64 untracked
  transferred files remain unstaged.
- Authorized NSIS candidate:
  `packages/happy-app/src-tauri/target/release/bundle/nsis/Happy (dev)_0.1.0_x64-setup.exe`,
  SHA-256 `4d023f8d9aa05078ff5351d012fe6c002f8a07d97f5f8520c7ea894ce37ba90a`.
- Candidate executable: `packages/happy-app/src-tauri/target/release/app.exe`,
  SHA-256 `af18d94139109ebf2fe7b90237f7c5213705210e508f26b4b0ba2854c9416236`.
- Exact target: `C:\Users\myartings\AppData\Local\Happy (dev)` and its
  per-user uninstall key. The currently installed executable is the distinct
  prior build with SHA-256
  `ddff65b6ec6bed0ddcd32c7ee066b8df96d4e7c57a4a945373a1810abac759f6`.

### Allowed operations and validation seam

1. Bind `happyctl.ps1` to the exact worktree through a temporary external
   configuration, recheck doctor and candidate/target identity, and stop on any
   mismatch.
2. Run `update-desktop -DryRun -KeepBackups 4`, then the identical actual
   `update-desktop -KeepBackups 4`. Four is intentional: it retains all three
   existing backups plus the new pre-replacement backup rather than allowing
   the normal retention step to remove the oldest one.
3. Require a backup of the prior install, a saved uninstall-registry snapshot,
   successful silent NSIS install, and installed/build `app.exe` hash equality.
4. Run `verify-desktop` for exact install/uninstall identity and a short process
   launch at the installed path. The verifier stops its own process afterward;
   this is launch evidence, not authenticated daily-loop or visual acceptance.
5. Compare candidate, installed, backup, registry, process, Git, protected-path,
   and strict-workflow evidence after the operation.

### Stop and authority boundaries

- Stop on wrong source/branch/HEAD, candidate hash drift, ambiguous target,
  missing registry snapshot for the existing entry, backup failure, install
  failure, installed hash mismatch, rollback failure, or launch-path failure.
- The updater's built-in failure path must restore both the copied install and
  the captured uninstall entry before any retry is considered.
- No signing, commit, push, PR, publication, release, official-baseline change,
  account mutation, permission action, Agent execution, or broad GUI smoke is
  authorized.

## Whole-diff verification continuation — 2026-08-30

### Result

**Ready with recorded verification gaps.** T01–T08 source implementation and
the additive Windows eligibility/package/install/launch slice are complete.
The remaining macOS authenticated daily-loop, visual/accessibility capture, and
executed packaged rollback are verification work; they do not require another
speculative product edit before review.

### Review and check boundary

- Inspect the complete 59 tracked / 64 untracked feature state relative to
  `a269068ab42316a6e5749882cd81499aeb31fabb`, including feature modules, every
  host seam, tests, localization, devtools, and workflow evidence.
- Trace packaged macOS/Windows activation, Linux/standalone compatibility,
  permission and Agent-question exact-once behavior, navigation/search,
  responsive layout, accessibility, rollback, and installation operations.
- Run the public desktop-contract target first, then the complete Codex-first
  family, full Happy App test/typecheck, applicable Happy Server checks,
  devtools regression/syntax checks, workflow checks, diff checking, and
  protected-path/privacy audits.
- Reuse the exact Windows package/install/launch receipts without reinstalling
  or executing rollback. Windows GUI interaction, signing, publication,
  official-baseline replacement, account mutation, permission action, and
  Agent execution remain outside this review.
- If review finds a correctness or contract defect, record `review=blocked`
  and return the smallest evidenced fix to implementation. If no blocking
  finding remains, record `review=passed` while keeping unavailable macOS
  runtime evidence explicit in the check result.

No external tracker, PR, subagent, concurrent writer, commit, push, or release
boundary is required or authorized for this local acceptance review.

## Whole-diff remediation continuation — 2026-08-30

### Result

**Ready** for four serial TDD tracer bullets that repair the blocking findings
recorded in `validation.md`. The user's instruction to fix every finding accepts
this bounded remediation scope. The local-only tracker exception in
`task-links.md` remains valid: there is one owning Root, no pickup queue, no PR
delivery, and no external coordination, so a GitHub issue is not a prerequisite.

### Accepted behavior and implementation seams

1. The Codex-first notification action must choose a real attention Session
   when its badge is derived from Session attention, while retaining the
   existing social Inbox as a truthful fallback when no Session needs
   attention. The public projection remains under
   `features/codex-first-shell/**`; `SidebarView.tsx` may consume it through the
   existing Session-navigation hook.
2. New Session must compose its route-local configuration rail with the
   rendered persistent-left width and the existing 600-point main-width
   invariant. `newSessionSidebarLayout.ts`, its focused test, the existing
   Studio panel-width projection, and the narrow host seam in
   `app/(app)/new/index.tsx` are in scope. Persisted widths are inputs only; no
   settings schema or stored value may change.
3. Packaged Codex-first routes must have one Header owner at 720 x 480 and
   larger widths. A pure header-ownership projection may be added under
   `features/codex-first-shell/**` and consumed by the shared navigation Header,
   New Session, and Inbox seams. Standalone/mobile Header behavior remains the
   compatibility oracle.
4. Recent Projects must disambiguate duplicate project names with existing
   Machine identity while leaving unique names unchanged. The pure home-state
   projection, its test, and `CodexFirstHomeCanvas.tsx` are the only product
   seams; existing Machine data is read-only.

Each tracer bullet starts with one focused public-interface RED, must fail only
for the recorded defect, and receives the smallest GREEN before the next
finding begins. After all four, rerun their focused family, Happy App typecheck,
the full Happy App test family, whole-diff review, workflow checks, whitespace,
and protected-path audits.

### Risk and authority boundary

The existing client-presentation clearance applies. These fixes may not alter
authentication, authorization effects, sync, protocol or payload construction,
Server, Machine RPC, Session persistence, settings schemas, destructive
operations, or release plumbing. Stop if a RED exposes setup drift or a failure
outside its asserted behavior, or if a GREEN requires crossing one of those
boundaries.

The already installed Windows candidate remains historical acceptance evidence
for the pre-remediation source. This continuation does not authorize rebuilding,
reinstalling, launching, rollback execution, signing, committing, pushing,
publishing, or releasing a new candidate.

## Current remediated Windows package continuation — 2026-08-30

### Result

**Ready with recorded controls.** Decision D10 authorizes the exact owning
Windows Root to replace the historical pre-remediation candidate with a fresh
unsigned candidate built from the current four-fix source. No external tracker,
PR, subagent, concurrent writer, commit, push, signing, publication, release,
official-baseline replacement, or intentional rollback execution enters scope.

### Serial execution boundary

1. Reconfirm root, branch, HEAD, empty index, strict audit, installed identity,
   no unexpected target process, four existing backups, and a pre-action Git
   content digest.
2. Rerun the seven-file remediation family, composed width matrix, Happy App
   typecheck, and complete Happy App suite. Stop on an unexpected failure.
3. Bind a repository-external temporary `HAPPY_DEVTOOLS_CONFIG` to the owning
   worktree, run `doctor`, then `build-desktop`. Generated dependency, Expo,
   Rust, installer, log, and report outputs are allowed; tracked or staged drift
   is not.
4. Record new app/MSI/NSIS identity, timestamps, SHA-256, architecture,
   WebView2 mode, and unsigned state. Run `update-desktop -DryRun
   -KeepBackups 5`; it must report no backup removal and make no changes.
5. Reconfirm hashes, then run the identical actual update with
   `KeepBackups=5`. Require the fifth backup, registry snapshot, exact
   install/uninstall identity, and installed/build app hash equality.
6. Run `verify-desktop`, then launch the installed App for bounded inspection of
   the Codex-first shell, 720/1100/1200/1470 width behavior, single Header
   ownership, and any naturally available duplicate-project/attention labels.
   Do not click an action that can change read state, start work, send content,
   answer a request, change settings, or invoke an external operation.
7. Stop the inspection process, compare pre/post Git and protected state, remove
   only the temporary configuration, record exact evidence, and rerun strict
   workflow audit. Any source defect returns to diagnosis/TDD; no Server or
   protected-boundary repair is implied.

## Windows owning final-acceptance continuation — 2026-08-30

### Result

**Ready with controls.** Decision D11 supersedes the earlier macOS-first and
read-only-Windows constraints for the current Goal. The exact registered
`codex-first-happy-client-windows` worktree remains the sole writer and packaged
Windows is now the complete acceptance target. Native macOS work is a later
platform adaptation and is not a prerequisite for this Windows check.

### Required serial tracer

1. Reconfirm root, branch, HEAD, empty index, dirty inventory, protected paths,
   exact installed Happy identity, backup/registry recovery inputs, and strict
   workflow state before any new product edit or installation.
2. Identify the current installed native Windows Codex Desktop build and capture
   its reachable shell, navigation, home, New Session, conversation, Composer,
   tools, permission/question, search, command-palette, panel, Settings,
   responsive, appearance, keyboard, and accessibility states. Keep screenshots
   private and record only non-sensitive observations and measurements in the
   repository.
3. Capture installed Happy at the same logical window size, theme, and
   representative state. Classify every comparison as observed parity,
   behavioral parity, grammar adaptation, or known limitation; do not infer
   unobserved Codex behavior.
4. Turn each material observable defect into one focused public-interface RED,
   implement the smallest GREEN inside the accepted client-presentation seams,
   and rerun the closest regression before moving to the next defect. No defect
   list authorizes Server/protocol/auth/sync/data-migration edits.
5. After source is stable, run the complete applicable App regressions and
   workflow checks, rebuild from the exact worktree, inspect hashes/unsigned
   identity, run a no-change update dry-run, preserve all existing recovery
   points, replace only the exact per-user `Happy (dev)` target, and verify the
   exact installed executable.
6. Exercise one bounded real daily-use loop with isolated or non-destructive
   context where practical, including navigation, start/resume, Composer,
   send/stream/stop or completion, tool/result visibility, changes/panels, and
   return navigation. Do not answer a real permission request, mutate account
   or authentication state, or cross an external/destructive operation.
7. Complete keyboard-only and Windows UI Automation inspection, responsive and
   light/dark evidence, deviation/limitation closure, recovery/rollback
   documentation, whole-diff review, and a final reproducible acceptance index.

### Ownership and publication boundary

No external issue is required: the accepted spec and local task list form one
serial owning-root queue with no delegated pickup or PR boundary. No subagent,
concurrent writer, commit, push, PR, signing, publication, release, official-
baseline replacement, or intentional rollback execution is authorized.
