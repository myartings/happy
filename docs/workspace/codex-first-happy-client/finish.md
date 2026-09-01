# Finish Review: `codex-first-happy-client`

## Summary

Windows owning acceptance is complete for the unsigned local development
client installed at `C:\Users\myartings\AppData\Local\Happy (dev)\app.exe`.
The installed executable is byte-identical to the final reviewed build at
SHA-256 `0E89BAA43909EB90882A23F216CBE72E1F9AE4A6EC47B9648D1211FACDCBC20C`.
Packaged Windows presents the global `Happy Codex` shell while Linux and
standalone/mobile clients retain their legacy presentation path. Happy's
Machine, multi-Agent, cross-device Session, Todo, Issues, Artifacts, files,
changes, Side Chat, permissions/questions, Settings, and remote-control
capabilities remain available behind truthful existing boundaries.

All product findings discovered during source and packaged review were repaired
with RED→GREEN tracer bullets. No commit, push, PR, signing, publication,
release, official-baseline replacement, protocol/auth/Server mutation, or
intentional rollback occurred.

## Verification

- Happy App typecheck passes; the final complete App suite passes 220 files and
  1761 tests. Happy Server typecheck passes.
- The configured workflow check passes 7 of 8 commands. Workflow validation,
  14 workflow-core tests, 14 workflow-CI tests, and strict audit pass. The sole
  accepted gap is the unchanged native-Windows Server result of 105/107 caused
  by two POSIX `/tmp` local-file fixtures; `packages/happy-server` has no diff.
- Exact-worktree doctor/build produced unsigned x64 app, MSI, and NSIS hashes
  `0E89BAA4…C20C`, `86D3A7DF…C9D6`, and `CE489211…2E4E`.
  The no-change dry run selected only the exact target; recoverable installation
  retained nine backups; build/installed hashes match; exact-path launch passed.
- Packaged daily-loop inspection covered every named navigation, conversation,
  Composer, tool, workspace, Settings, responsive, theme, keyboard, and UIA
  surface without submitting or mutating user content. Final UIA proved
  `收起工作区面板`, `你想做什么？`, and launcher click → Escape → Enter focus
  restoration.
- The acceptance table records 28 criteria as `verified` and four as
  `accepted gap`, grouped into three named limitations: policy-blocked
  current-Codex pixel automation, unauthorized intentional rollback execution,
  and the unchanged Server fixture family.
- Final cleanup stopped only exact-path PID `98340`; target process count is
  zero. The one worktree-binding temp config is absent, the installed hash
  remains `0E89BAA4…C20C`, and all nine backups remain.

## Whole-diff review

The final review covered 65 tracked modifications and 72 untracked feature,
test, and workflow-evidence files with an empty staged index. It rechecked the
full implementation plus the last two packaged-runtime fixes. All three prior
P1 findings, the prior P2 ambiguity, the false-offline Home defect, exact-once
decision behavior, unsupported-banner lifecycle, command-palette activation and
focus, workspace naming, and New Session localization are closed with tests and
runtime receipts. No actionable correctness, privacy, security,
maintainability, accessibility, or cross-platform finding remains.

Protected auth, sync-operation/protocol, Happy Server, Happy CLI, mobile, env,
credential, and secret paths have zero product diff. No dependency or binary
artifact entered the source tree. The tracked and installed pre-push guard
hashes both equal
`925EEAF87154601D261886F4DED9AA6EE10415355FFCFFBF61B8B9ABAF9BCDCC`.
The historical macOS `codesign` pipe-consumption correction remains preserved
with its earlier shell/smoke receipt and was not conflated with Windows runtime
acceptance.

## Rollback or mitigation

The newest complete recovery point is
`C:\Users\myartings\AppData\Local\Happy Devtools\backups\Happy (dev)-windows-20260831-015534`.
It contains predecessor `app.exe` SHA-256
`E248B306CCA795EEF406A4CD814516243F76F460B1738016355A4CDF0EFE07D1`,
`uninstall.exe`, and the 446-byte uninstall-registry snapshot. Eight older
backups also remain untouched. The updater's automatic failure recovery and the
manual exact-path/quarantine/registry/hash procedure are documented in
`validation.md`.

For presentation-only convergence, a future development build with
`EXPO_PUBLIC_HAPPY_CODEX_FIRST=0` resolves the legacy shell without migrating
stored settings or data. Neither that build nor an installed rollback was
executed under the current authority.

## Lessons promoted

- `CONTEXT.md`: no change; the durable Windows evidence, limits, and ownership
  live in this feature's specification and workflow directory.
- `docs/ARCHITECTURE.md` or ADR: no change; the implementation uses an explicit
  client feature module and small host seams without changing repository or
  transport architecture.
- Skill/workflow rule: the specification now states that Windows owns this
  delivery, prior packaged-macOS eligibility remains source-only pending native
  adaptation, policy-blocked pixels must stay an accepted gap, and an unrelated
  native-path fixture failure must not trigger an out-of-scope Server edit.

## Follow-up

The installed client is ready for the user's final product acceptance. A local
commit, push/PR, signing, publication, or release requires separate explicit
authorization and remains pending. Native macOS adaptation/acceptance is a
later workflow; Windows evidence must not be reused as macOS proof. Repairing
the two Server Windows path fixtures may be handled as a separate scoped issue
if desired, but it is not required for this client delivery.
