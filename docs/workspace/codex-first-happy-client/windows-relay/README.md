# Windows Relay: `codex-first-happy-client`

This relay reconstructs the exact uncommitted macOS source state in a fresh
native Windows Git worktree. It does not modify the shared checkout, reuse the
old Codex thread, commit, push, install, or launch anything by itself.

## Required state

- Run from native Windows PowerShell, not WSL.
- Use a Happy repository clone that contains commit
  `a269068ab42316a6e5749882cd81499aeb31fabb`.
- Keep the package directory intact so its patch, archive, and manifest remain
  beside `restore-windows-relay.ps1`.
- The default destination is
  `<repo>\.dev\worktree\codex-first-happy-client-windows` on local branch
  `codex-first-happy-client-windows`. The script refuses an existing branch or
  destination instead of overwriting it.

## Restore

From Windows PowerShell, substitute the actual repository path:

```powershell
$relay = "$env:USERPROFILE\Sync\tmp\codex-first-happy-client\windows-handoff\20260830T072814Z"
& "$relay\restore-windows-relay.ps1" -RepoRoot "C:\Users\myartings\workspace\happy"
```

The script creates a fresh worktree from the exact base, applies the tracked
patch, extracts the untracked files, verifies every transferred file SHA-256,
and runs `git diff --check`. A failed restore is left in place for diagnosis;
the script never deletes or retries over it.

## Start the new Root session

After the restore reports `WINDOWS_RELAY_READY`, use the exact worktree path it
prints:

```powershell
Set-Location "C:\Users\myartings\workspace\happy\.dev\worktree\codex-first-happy-client-windows"
happy codex --no-sandbox
```

Send this first message to the fresh session:

```text
读取 AGENTS.md 和 docs/workspace/codex-first-happy-client/sessions/20260830T072814Z-Windows-ownership-transfer-for-final-packaged-runtime-validation-rollback-proof-whole-diff-review-and-workflow-finish.md，使用 start/continue 工作流恢复当前 Goal。先验证接力状态，再以 TDD 增加 Windows Codex-first 平台切片；不要提交、推送或把 Windows 证据当作 macOS 最终验收。
```

The current macOS Goal remains incomplete. Native Windows package evidence is
additive; final macOS packaged interaction and rollback proof still require an
unlocked Mac session.
