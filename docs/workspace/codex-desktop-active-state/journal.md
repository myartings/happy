# Journal: `codex-desktop-active-state`

## `2026-08-25`

- Started workflow.
- Confirmed the live Codex CLI emitted `task_started` and retained
  `thinking=true`; narrowed the fault to Desktop state handling.
- Rejected the initial envelope-parser hypothesis after verifying
  `normalizeRawMessage` canonicalizes the direct session envelope in place.
- Identified the asynchronous `update-session` stale-snapshot overwrite.
- Added the latest-session merge regression and production integration.
- Completed typecheck, 1,270 App tests, workflow checks, and whole-diff review.
