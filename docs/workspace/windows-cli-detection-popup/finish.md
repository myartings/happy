# Finish Review: `windows-cli-detection-popup`

## Summary

- Happy's Windows heartbeat no longer launches CLI availability probes through
  a command shell.
- Both the PowerShell-based Agent detector and Antigravity's `where` resolver
  now call their executables directly with `windowsHide: true`.

## Verification

- Focused RED/GREEN tests: two files, five tests passed.
- TypeScript `--noEmit` check and pkgroll build passed.
- Real direct PowerShell probe distinguished installed and missing commands.
- Deployed daemon PID 22328 advanced heartbeat after restart.
- Final 130.1-second foreground capture recorded zero Windows Terminal events
  and zero OpenConsole starts.
- Both OpenSSH firewall rules remained `RemoteAddress=LocalSubnet`.
- Four repository workflow checks passed with zero failures.
- Full unit suite gap: 84 files/797 tests passed; 6 files/34 unrelated
  Windows/environment tests failed and remain recorded in `validation.md`.

## Whole-diff review

- No blocking findings.
- POSIX detection, heartbeat cadence, metadata shape, and Agent availability
  semantics are unchanged.
- Tests replace only the operating-system process boundary and cover both
  Windows shell regressions.

## Rollback or mitigation

- Revert the four detector source/test files, rebuild `packages/happy-cli/dist`,
  and restart the daemon.
- Do not change the Windows Terminal default or restore public SSH exposure as
  part of rollback.

## Lessons promoted

- None; the finding is specific to these upstream Windows child-process call
  sites and is fully captured by regression tests and workflow evidence.

## Follow-up

- Optionally prepare an upstream Happy pull request from a verified official
  base; no external tracker or PR mutation was requested in this task.
- Address the unrelated Windows unit-suite baseline separately.
