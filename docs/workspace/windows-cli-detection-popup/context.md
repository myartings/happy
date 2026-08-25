# Context: `windows-cli-detection-popup`

## Goal

Prevent Happy's Windows CLI availability heartbeat from creating a visible
Windows Terminal window every 20 seconds.

## Accepted scope

- Preserve CLI availability detection for Claude, Codex, Gemini, OpenClaw, and
  Antigravity.
- Preserve the existing keep-alive interval and machine metadata contract.
- On Windows, invoke PowerShell directly with an argument array and
  `windowsHide: true`; do not execute the detection through a command shell.
- Add a focused regression test at the public `detectCLIAvailability()` seam.
- Build and deploy the local Happy CLI, restart the daemon, and observe the
  foreground-window signal for at least two minutes.

## Out of scope

- Changing Windows Terminal settings, scheduled tasks, SSH/firewall rules, or
  the 20-second keep-alive cadence.
- Refactoring POSIX detection or adding caching.
- Publishing an upstream pull request.

## Evidence

The investigation handoff captured the recurring process chain as Happy daemon
`node.exe -> cmd.exe -> powershell.exe -> OpenConsole.exe` and reproduced the
foreground Terminal window with the equivalent string-form `execSync` call.
