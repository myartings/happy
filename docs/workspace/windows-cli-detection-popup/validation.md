# Validation: `windows-cli-detection-popup`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-25` | `pnpm --filter happy exec vitest run --project unit src/utils/detectCLI.test.ts` | unavailable | Workspace Vitest executable was absent; full `pnpm install --frozen-lockfile` reached `ERR_PNPM_EPERM` because a running Codex process locked `node_modules/@openai/codex-win32-x64`. |
| `2026-08-25` | `pnpm dlx vitest@3.2.4 run --project unit src/utils/detectCLI.test.ts` from `packages/happy-cli` | RED: 1 failed, 1 passed | Windows test observed four unavailable results because production still used mocked string-form `execSync`; existing Antigravity test passed. |
| `2026-08-25` | `pnpm dlx vitest@3.2.4 run --project unit src/agy/constants.test.ts` | RED: 1 failed, 2 passed | New Windows test caught `execSync("where agy")` as the remaining heartbeat shell path. |
| `2026-08-25` | `pnpm dlx vitest@3.2.4 run --project unit src/utils/detectCLI.test.ts src/agy/constants.test.ts` | pass: 2 files, 5 tests | Both Windows command-detection paths use direct executables with `windowsHide: true`. |
| `2026-08-25` | `pnpm --package=typescript@5.9.3 dlx tsc --noEmit` | pass | Happy CLI typecheck passed after both changes. |
| `2026-08-25` | real `execFileSync(powershell.exe, ...)` installed/missing probe | pass | Reported `powershell:true` and the guaranteed-missing command `false`. |
| `2026-08-25` | `pnpm dlx vitest@3.2.4 run --project unit` | 84 files passed, 6 failed; 797 tests passed, 34 failed | Failures are outside changed modules: existing Windows path assumptions, sandbox mocks, and unavailable unpacked ripgrep. Focused changed-module tests passed in this run. |
| `2026-08-25` | validated clean of `packages/happy-cli/dist`, then `pnpm --package=pkgroll@2.14.2 --package=typescript@5.9.3 dlx pkgroll` | pass | Rebuilt local CLI dist with both no-shell fixes. |
| `2026-08-25` | first foreground/process capture, 130 seconds | fail | 11 Terminal foreground events remained; process timing exposed a remaining 20-second `where agy` shell path. |
| `2026-08-25` | isolated direct PowerShell capture with daemon stopped, 25 seconds | pass | Equivalent direct `execFileSync(powershell.exe)` produced zero Terminal foreground events. |
| `2026-08-25` | final foreground/process capture, 130.1 seconds | pass | Zero Windows Terminal foreground events and zero OpenConsole starts after both fixes; covered more than six heartbeat intervals. |
| `2026-08-25` | `node packages/happy-cli/dist/index.mjs daemon status` | pass | PID 22328 running new dist; `lastHeartbeat=2026/8/25 22:36:55`. |
| `2026-08-25` | firewall address filters for `OpenSSH-Server-In-TCP` and `sshd` | pass | Both remain `RemoteAddress=LocalSubnet`. |
| 2026-08-25 | `python3 scripts/validate-happy-workflow.py` | passed | check |
| 2026-08-25 | `python3 scripts/test-workflow-core.py` | passed | check |
| 2026-08-25 | `python3 scripts/test-workflow-ci.py` | passed | check |
| 2026-08-25 | `python3 scripts/workflow-audit.py --strict` | passed | check |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Windows CLI detection does not execute through a command shell. | verified | Focused tests cover direct `powershell.exe` and `where.exe` calls and reject string `execSync`. |
| Existing CLI availability booleans and metadata shape are preserved. | verified | Five focused tests, typecheck, and unchanged return interfaces/heartbeat code. |
| Deployed daemon keeps heartbeats without non-user Terminal foreground events for at least two minutes. | verified | 130.1-second capture had zero Terminal foreground events; daemon heartbeat advanced. |
| SSH firewall rules remain restricted to `LocalSubnet`. | verified | Both firewall address filters read back `LocalSubnet`. |

## Remaining gaps

- The complete CLI unit suite has 34 unrelated Windows/environment failures in six files; none imports or exercises the changed detector modules.
- The canonical workspace `pnpm --filter happy test` wrapper remains unavailable while current Codex sessions lock the hoisted native Codex package; locked-version dlx commands provided the focused tests, full unit run, typecheck, and build.
