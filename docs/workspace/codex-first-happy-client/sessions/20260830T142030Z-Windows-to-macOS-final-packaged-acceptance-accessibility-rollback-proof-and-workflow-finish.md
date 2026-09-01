# Session: `20260830T142030Z-Windows-to-macOS-final-packaged-acceptance-accessibility-rollback-proof-and-workflow-finish`

**Feature**: `codex-first-happy-client`
**Date**: `2026-08-30`
**Agent / Scope**: Windows-to-macOS final packaged acceptance, accessibility, rollback proof, and workflow finish
**Branch / Worktree**: codex-first-happy-client-windows
**Related Commit**:

## Goal

- Transfer the exact Windows owning-Root result to the macOS owner so the
  remaining platform-specific packaged acceptance, accessibility, rollback,
  workflow check, finish, and archive work can resume without relying on chat
  history or mistaking historical macOS artifacts for the current source.

## Starting context

- Windows owning root:
  `C:\Users\myartings\workspace\happy\.dev\worktree\codex-first-happy-client-windows`.
- Branch / HEAD: `codex-first-happy-client-windows` at
  `a269068ab42316a6e5749882cd81499aeb31fabb`.
- Dirty state after creating this handoff: 61 modified, 68 untracked, 0
  staged, and 0 entries in the protected App sync/Server/CLI/mobile paths.
  Preserve the whole dirty tree; do not reset, clean, stage, commit, or push it.
- Current workflow phase is `verification`. Decisions, scoping, risk,
  implementation, and review pass; `check` is intentionally blocked and
  `finish` is pending. Strict audit returns `pass-with-gaps` with only future
  `finish` reported.
- Previous macOS owner/worktree is historical `smooth-valley` at
  `/Users/myartings/workspace/happy/.dev/worktree/smooth-valley`. Because no
  commit, push, or reverse source relay was authorized, that worktree must be
  treated as potentially stale until it proves it contains the Windows
  eligibility change and all four remediation tracer bullets.

## Changes made

- Added the TDD packaged-Windows eligibility contract and minimal GREEN:
  packaged macOS and Windows select Codex-first; packaged Linux and standalone
  clients remain legacy.
- Repaired all four whole-diff findings through serial public-interface RED /
  GREEN tracer bullets:
  1. Session-derived Inbox action selects a real attention Session with social
     Inbox fallback.
  2. New Session composes persistent-left and route configuration widths while
     preserving the 600-point main invariant.
  3. Packaged Codex-first owns exactly one Header at 720 x 480 and larger;
     standalone/mobile keep legacy behavior.
  4. Duplicate Recent Project names add existing Machine identity while unique
     names remain unchanged.
- Built the exact remediated Windows source, generated unsigned x64 app/MSI/
  NSIS artifacts, ran a no-change `KeepBackups=5` dry-run, recoverably replaced
  only the per-user `Happy (dev)` target, proved installed/build hash equality,
  and passed exact-path launch verification.
- Inspected the installed package at 1682, 1469, 1199, 1099, and 719 x 479.
  The Composer stayed usable, the right rail became a narrow top stack,
  navigation stayed scrollable, and one persistent Header owned back/forward.
  Repeated project/session context exposed distinct macOS/Windows Machine
  labels. No read state, draft, send, start, permission, setting, account, or
  external operation was changed.
- Stopped the exact inspection PID, removed the repository-external temporary
  config, retained five complete backups with uninstall-registry snapshots,
  and reconfirmed zero target processes, zero staged/protected entries, and an
  exact installed tracked pre-push guard.

## Decisions

- D3 remains binding: the user chose macOS-first final acceptance. Windows
  evidence is additive and cannot establish macOS pixels, native chrome,
  signing, accessibility, authenticated runtime, or macOS rollback behavior.
- D10 is exhausted successfully for the current Windows candidate. It did not
  authorize intentional rollback execution, signing, commit, push, PR,
  publication, release, official-baseline replacement, login/account/
  permission mutation, Agent execution, message submission, or protected
  auth/sync/protocol/Server/Machine RPC edits.
- No external issue is required for this local-only owning-Root workflow. The
  two Server failures may receive a separate issue later, but do not belong to
  the Codex-first client remediation.

## Commands / validation

| Command | Result | Notes |
| --- | --- | --- |
| Focused remediation matrix | passed, 8 files / 34 tests | Attention, navigation wiring, New Session width/layout/wiring, Header ownership/hardening, and Home identity |
| `pnpm --filter happy-app typecheck` | passed | Current source |
| `pnpm --filter happy-app exec vitest run` | passed, 217 files / 1747 tests | Complete Happy App family |
| `pnpm --filter happy-server typecheck` | passed | No Server diff |
| `pnpm --filter happy-server test` | failed, 105 / 107 passed | Only unchanged Windows POSIX `/tmp` local-file fixture mismatches in attachment/project routes |
| `devtools/happyctl.ps1 doctor` through exact external config | passed | Node 20.20.2, pnpm 10.11.0, VS 2022 MSVC, Rust 1.95.0 x64 MSVC, WebView2 153.0.4234.8, guard |
| `devtools/happyctl.ps1 build-desktop` | passed | App `CEBB6EBE…046F1`; MSI `B2746195…7719`; NSIS `380C01FC…A846`; all unsigned |
| `update-desktop -DryRun -KeepBackups 5` | passed, no changes | Selected exact source/artifact/install/uninstall; no backup removal |
| `update-desktop -KeepBackups 5` | passed | Installed/build app hashes equal; five backups and snapshots remain |
| `verify-desktop` | passed | Observed exact installed path, stopped only verifier-created PID |
| Bounded packaged UI smoke | passed with named runtime gap | Required widths and Header/New Session behavior passed; initial main canvas showed `无法连接`, so no backend-dependent daily loop was claimed |
| `python scripts/workflow-check.py --record codex-first-happy-client` | 7 / 8 command groups passed | Only the two unchanged native-Windows Server fixtures fail |
| Workflow validator, 14 core tests, 14 CI tests | passed | Rerun after evidence update |
| `python scripts/workflow-audit.py --strict --require-active` | `pass-with-gaps` | Future `finish` only |
| `git -c core.autocrlf=false diff --check` and protected audit | passed | 0 staged; 0 protected entries |

## Blockers / risks

- **Source parity comes first.** The macOS worktree must not rebuild or replace
  its App until it proves it contains the current Windows-owned source. No
  commit/push/reverse relay has moved these dirty changes back to macOS.
  Presence of the following is the minimum quick oracle, not a substitute for
  a full manifest comparison:
  `codexFirstDesktopContract.test.ts` packaged-Windows coverage,
  `codexFirstAttention.ts`, `codexFirstHeaderOwnership.ts`, the updated
  `newSessionSidebarLayout.ts`, and Machine-label logic in
  `codexFirstHomeState.ts` / `CodexFirstHomeCanvas.tsx`.
- Historical macOS installed/rollback artifacts predate the Windows
  remediations: `/Applications/Happy (dev).app` was recorded at SHA-256
  `c11e0b0c0eaca7b1743a6bc0cb656796a8d19a9a1fe25e99bfe2cacfe091731c`;
  the private legacy package at
  `/Users/myartings/Sync/tmp/codex-first-happy-client/rollback/Happy (dev)-legacy-final-20260830-150327.app`
  was recorded at
  `f09105cd4ddbef37d96172ce963253b6c97dc99ccd1144abbf01b070bbfe71f9`.
  Preserve both as historical recovery evidence; neither proves the current
  four fixes.
- AC-032 explicitly requires an installable macOS App, matched reference/
  target and narrow/standard/wide evidence, light/dark evidence, deviation
  closure, known limitations, and rollback instructions. Native macOS
  signature/bundle identity, title-bar/window behavior, VoiceOver/focus,
  authenticated daily-loop state, and rollback execution cannot be concluded
  from Windows.
- The macOS console must be unlocked and online for truthful first-paint,
  interaction, and accessibility evidence. Do not infer a pass from a live
  process or blank/covered capture.
- Intentional rollback remains separately authorization-gated. Ask before
  replacing a current candidate with the legacy package.
- The native-Windows Server fixture failures are known range-external gaps;
  do not edit Server while completing this client handoff.

## Next action

1. On macOS, read `AGENTS.md`, this shared handoff, `ACTIVE.md`, `decisions.md`,
   `validation.md`, `risk-assessment.md`, the spec, and the task list; then use
   `start` / `continue` to verify root, branch, HEAD, dirty state, and strict
   audit.
2. Before any build, compare the macOS source with the exact Windows state. If
   any Windows eligibility/remediation file is missing, stop and request an
   authorized reverse relay or another explicit source-integration method; do
   not manually guess the whole 129-entry dirty tree from this prose.
3. Once source parity is proven, rerun the focused 8-file / 34-test matrix,
   Happy App typecheck/full suite, and protected diff; build and safely install
   a fresh signed macOS development candidate through the existing happyctl
   path.
4. With the console unlocked, collect matched 1470 x 870 plus narrow/wide,
   light/dark, keyboard/focus/VoiceOver, and authenticated daily-loop evidence
   without exposing private Session content.
5. Request explicit rollback-execution authority, run the prepared legacy
   package smoke recoverably, restore the current candidate, then complete the
   configured check, final review, finish-work learning promotion, and archive.
6. Do not commit, push, open a PR, publish, sign for public distribution, or
   release unless the user separately authorizes that action.
