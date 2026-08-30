# Reference Evidence

## Runtime and static identity

- Current installed reference: `/Applications/ChatGPT.app`, display name
  `ChatGPT`, bundle identifier `com.openai.codex`, version `26.820.60940`, build
  `7119`.
- Current facts-only bundle inspection:
  `/Users/myartings/Sync/tmp/codex-reference/app-bundle-inspection-2026-08-30-v26.820.60940/`.
  It identifies an Electron application with native macOS outer chrome. Static
  inspection does not establish interaction or runtime layout.
- Latest usable private runtime baseline:
  `/Users/myartings/Sync/reference-app-assets/raw/macos/codex-desktop/screenshots/codex-main-current.png`.
  It is a lossless 1470×870 pt, 2×, light, populated conversation capture from
  2026-08-12 with SHA-256
  `b1beb3fc917f88cdadd989c5a6ae26bd04328701ed84db2c4cc083023f24c34c`.
- Validated extraction record:
  `/Users/myartings/workspace/reference-app-assets/apps/macos/codex-desktop/visual-evidence/main-conversation-light.json`.

## Current public product evidence

Official OpenAI material current on 2026-08-30 establishes that Codex remains a
separate desktop view for software-development workflows, with project/thread
history, local folders and repositories, terminals, developer tools, diff
review and comments, editor handoff, parallel agents/worktrees, skills,
approvals, plugins, appshots, Goal mode, browser annotations, and remote
continuation. These sources establish capabilities and product vocabulary; they
do not replace runtime pixels or prove exact state transitions.

- <https://openai.com/index/introducing-the-codex-app/>
- <https://help.openai.com/en/articles/6825453>
- <https://help.openai.com/en/articles/20001275>
- <https://help.openai.com/en/articles/20001276-moving-to-the-new-chatgpt-desktop-app>

## Evidence boundary and blocked states

- Computer Use is explicitly disallowed for `com.openai.codex` on this host.
  This boundary was not bypassed.
- The current Codex window was unambiguous (`ChatGPT`, 1470×872 pt), but named
  window capture returned `could not create image from window`. No current
  runtime image was produced.
- The older populated light baseline remains valid for the main-window geometry
  it visibly proves. It does not prove empty, loading, streaming, approval,
  settings, dark, hover/focus, resizing, navigation, or motion behavior.
- Current Codex interaction details that are neither present in the usable
  baseline nor documented by official sources remain `blocked`; the
  implementation must not invent parity claims for them.

## Native Windows reference identity — 2026-08-31

- Read-only Appx inspection identifies the current Windows reference as
  `OpenAI.Codex_26.825.4187.0_x64__2p2nqsd0c76g0`, version
  `26.825.4187.0`, architecture `x64`, status `Ok`.
- Its manifest display name is `ChatGPT` and its executable is
  `app/ChatGPT.exe`. The Computer Use policy therefore prohibits driving or
  capturing this UI through automation. That boundary was not bypassed.
- The existing private file
  `C:\Users\myartings\Sync\tmp\codex-reference\codex-desktop-current.png`
  was visually inspected and is a historical macOS capture, not current
  Windows evidence. It is not used as a matched Windows receipt.
- Current same-size/theme/state Windows Codex pixels remain blocked pending a
  user-prepared capture or another explicitly permitted evidence route. Static
  package identity proves only the installed reference build, not visual or
  interaction parity.

## Happy baseline

- Installed development-client capture:
  `/Users/myartings/Sync/tmp/codex-first-happy-client/baselines/happy-dev-main-2026-08-30.png`.
- Validated product-side evidence record:
  `docs/workspace/codex-first-happy-client/evidence/happy-main-light-2026-08-30.json`.
- The current source builds successfully as an unsigned Tauri release bundle at
  `packages/happy-app/src-tauri/target/release/bundle/macos/Happy (dev).app`.
  The existing stable-signing identity can sign it. The installed development
  app was restored after the build probe so the user's existing client remains
  available.
- After restart, window-specific Happy capture became unavailable despite the
  system still reporting Screen Recording authorization. WebKit unified logs
  showed the packaged page and network resources loading successfully. Final
  matched runtime evidence must therefore be retried after implementation and
  is not replaced by the transient dark first frame.

## Fresh Windows Happy candidate — 2026-08-31

- The final exact-worktree unsigned candidate app SHA-256 is
  `E248B306CCA795EEF406A4CD814516243F76F460B1738016355A4CDF0EFE07D1`;
  the installed per-user executable is byte-identical. MSI SHA-256 is
  `A8F1F2E41E25A4BD7CF5DF6EDCF9E7F512FEBC2A497904068F55EAD8569F4A38`;
  NSIS SHA-256 is
  `00CB3DE017CA5955EF9D74193A32DF69583028F5CA798230FF02006DCC7503AC`.
  Eight complete rollback backups remain.
- Its direct installed predecessor, app SHA-256
  `7E4536CCC58204E8BFA9F8C3D6D359998AF43A27BC23F6F598DA6296B1F76F82`,
  contained the same reviewed product source except for the final explicit
  sidebar-launcher focus-target repair. Fresh inspection of that package at
  1682 x 1081 showed the corrected ready Home with `你想构建什么？`,
  `开始新任务，或继续最近的项目。`, and `新建会话`; `无法连接` was absent
  while current Sessions and connected status were visible.
- That fresh UI Automation tree exposed localized Happy names, roles, states,
  current Session/Machine/worktree metadata, resize and navigation labels, and
  the bounded blank command palette. A harmless worktree query proved input
  focus and filtering without activating a command. The same run reproduced
  the launcher focus-return defect that the final TDD delta repairs.
- The final `E248B306…07D1` package passes App typecheck, 220 files / 1761
  tests, native build, dry-run, exact-target replacement, installed/build hash
  equality, and exact-path launch. Its process and window enumerate correctly,
  but Windows currently reports no foreground process ID after the updater
  stopped the prior foreground process; the bounded Computer Use interface
  therefore refuses the final recapture. No non-approved UI automation is used
  to bypass that safety check.
- An in-client `有可用更新` notification was observed on the predecessor. Its
  `重启` action was not invoked because it could replace the hash-bound
  candidate outside the accepted installation flow.

## Final Windows Happy acceptance candidate — 2026-08-31

- This section supersedes the `E248B306…07D1` candidate as the final installed
  identity. Exact-worktree app/MSI/NSIS SHA-256 values are
  `0E89BAA43909EB90882A23F216CBE72E1F9AE4A6EC47B9648D1211FACDCBC20C`,
  `86D3A7DFF6BE023873894A7F946D625A705D84D3C1982EB1A38FA109DC6CC9D6`,
  and `CE489211A2534107C596B9CB1CE2A6C61DACAEE2FD7804DB33AF4823FC4F2E4E`;
  all are unsigned. The installed app is byte-identical to the build.
- A no-change `KeepBackups=9` dry-run preceded replacement. Nine complete
  recovery points now remain; newest backup
  `Happy (dev)-windows-20260831-015534` retains predecessor
  `E248B306…07D1`, `uninstall.exe`, and its uninstall-registry snapshot.
- Broad inspection on the predecessor and targeted final-package reinspection
  together cover the complete authorized daily-use surface. Final UIA directly
  proves `收起工作区面板`, New Session editor name/description
  `你想做什么？`, exact owning-Session filtering/opening, and click → Escape →
  Enter command-palette focus return. No prompt or mutation was submitted.
- The final package passes App typecheck, 220 files / 1761 tests, exact-path
  install and launch, installed/build equality, backup/registry recovery-input
  inspection, and the recorded responsive/appearance evidence. Manual rollback
  was not executed.
- Current Windows Codex reference interaction remains prohibited by its
  `ChatGPT.exe` manifest. This is the explicit pixel-parity limitation; it does
  not invalidate Happy's functional, interaction, accessibility, packaging, or
  rollback-readiness evidence and is not relabeled as observed Codex behavior.
