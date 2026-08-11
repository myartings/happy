---
name: happy-desktop-update
description: Update myartings' Happy Desktop from official upstream through the personal dev integration branch, preserving all personal features and the gpt-5.6-sol Codex default-model customization. Use when the user says “更新 Happy 到最新”, “升级 Happy 到最新版”, “更新一下 Happy”, or an equivalent Happy Desktop update request. Do not use for a CLI-only update.
version: 0.2.0
author: myartings
license: MIT
metadata:
  tags: [happy, desktop, update, personal-patches]
---

# Happy Desktop Update

## Clarification Protocol

- Treat a general request to update Happy to the latest version as explicit authorization for the complete Desktop refresh, including fetch, merge or fast-forward, personal-patch preservation, build, installed-app replacement, verification, and launch when the platform workflow launches.
- Do not ask for a second installation or push confirmation.
- Use dry-run only when the user asks to inspect, check, preview, or verify the flow without updating.
- If the user explicitly limits the request to Happy CLI, do not use this workflow; use the manager's `update-cli` command.
- If the user explicitly asks to update both Desktop and CLI, run this Desktop workflow and then the manager's CLI update workflow.

## Workflow

1. Detect the operating system before making changes.
2. Use the canonical manager for the current platform:

```text
macOS:   /Users/myartings/workspace/happy/devtools/happyctl
Linux:   /home/myartings/workspace/happy/devtools/happyctl
Windows: C:\Users\myartings\workspace\happy\devtools\happyctl.ps1
```

3. Tell the user that the patch-preserving update is starting and may take several minutes.
4. Run the platform's real refresh command, not dry-run:

```bash
# macOS
cd /Users/myartings/workspace/happy
devtools/happyctl refresh-desktop

# Linux
cd /home/myartings/workspace/happy
devtools/happyctl refresh-desktop
```

```powershell
# Windows
cd C:\Users\myartings\workspace\happy
.\devtools\happyctl.ps1 refresh-desktop
```

5. Let `refresh-desktop` own the complete operation. Do not substitute `update-desktop`, do not build directly from Happy `main`, and do not manually repeat its Git or installation steps unless `refresh-desktop` fails and the user asks to repair the manager flow.
6. On success, verify and report the final source branch or commit, the installed Desktop result, and whether the final source was unchanged and therefore skipped.

The intended source chain is platform-independent:

```text
upstream/main
  -> main
  -> dev
```

It always packages `dev`, which contains all current personal changes:

- Desktop session notifications.
- WebContent memory recovery after sleep, screen-off, or network loss.
- The `gpt-5.6-sol` default for both the daemon/CLI fallback and new Codex
  sessions created by Happy Desktop.

The default-model customization currently lives in:

```text
packages/happy-cli/src/codex/runCodex.ts
packages/happy-app/sources/sync/agentDefaults.ts
```

Do not rebuild from plain `main`, because it does not contain these personal
changes. Existing sessions may retain an explicitly selected model; the
customization controls the default for new sessions and the daemon fallback.

If the manager on the current platform does not synchronize and package `dev`,
stop and report that the manager flow does not preserve the personal integration
branch on that platform.

## Platform Boundaries

- macOS: `refresh-desktop` builds the `.app`, backs up the installed app, replaces it, verifies it, and launches it.
- Windows: `refresh-desktop` builds the NSIS installer, runs update-desktop dry-run, installs the verified NSIS artifact, validates the install, and verifies launch/process behavior.
- Linux: `refresh-desktop` builds the Debian artifact, runs update-desktop dry-run, installs the `.deb` with `apt`, and verifies the installed package. Use `--launch-smoke` only when the user asked for launch verification.
- Platform differences only affect artifact format and installation mechanics. They do not change the requirement to build the same personal `dev` branch.

## Failure Handling

- If the manager reports a dirty Happy worktree, `main` or `dev` divergence, merge conflict, build failure, push failure, or verification failure, stop and report the exact failed stage.
- Do not discard changes, reset branches, force-push, bypass verification, or fall back to building from `main`.
- Rely on the manager's installed-app backup behavior. Do not remove backups manually.
- Do not claim success unless the manager command exits successfully.
- After a successful update, check the Happy source for both Codex default model locations and report if either is not `gpt-5.6-sol`.
