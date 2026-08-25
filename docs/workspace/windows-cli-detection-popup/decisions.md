# Decisions: `windows-cli-detection-popup`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should Windows command detection avoid a shell? | accepted | Use `execFileSync('powershell.exe', args, ...)` to preserve `Get-Command` behavior while removing the implicit `cmd.exe` layer. |
| D2 | Should detection frequency or caching change? | not required | Keep the existing 20-second behavior so the popup fix remains a single attributable change. |
| D3 | Is a tracker item required? | not required | This is an immediate, local, single-owner repair requested in the active session; no delayed pickup, PR delivery, or external coordination is required. |
| D4 | Is a risk gate required? | not required | The change affects local process creation only and does not touch authentication, protocol, persistence, security policy, or destructive operations. |
