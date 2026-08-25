# Journal: `windows-cli-detection-popup`

## `2026-08-25`

- Started workflow.
- RED/GREEN replaced Windows PowerShell string execution with direct hidden
  `powershell.exe` invocation.
- First runtime capture still reproduced the popup and isolated the remaining
  `findAgyBin()` string-form `where agy` call.
- Second RED/GREEN replaced that path with direct hidden `where.exe`.
- Final 130.1-second capture recorded zero Windows Terminal foreground events.
