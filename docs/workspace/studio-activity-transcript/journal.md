# Journal: `studio-activity-transcript`

## `2026-08-14`

- Started workflow.
- User authorized continuing the structured execution activity batch without
  intermediate confirmation.
- Confirmed the pushed branch already contains shell transcript rendering and
  existing localized `Ran/Read/Edited` grouping.
- Traced Codex app-server `exec_command_end`: output, exit code, duration,
  status, cwd, and command exist at the producer, while the current session
  mapper emits only `{t: 'tool-call-end', call}`.
- Classified as High-risk because `.ai/project.json` names session protocol as
  a trigger. Controls: additive optional fields, bounded payloads, legacy
  compatibility tests, structural status, independent review, and a
  single-commit rollback boundary.
