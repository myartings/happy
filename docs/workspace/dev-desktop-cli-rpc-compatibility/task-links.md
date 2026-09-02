# Task Links: `dev-desktop-cli-rpc-compatibility`

- Delivery slice: https://github.com/myartings/happy/issues/98
- Delivery source: GitHub Issue https://github.com/myartings/happy/issues/98
- Acceptance slice: DC-01 through DC-09 in
  `docs/specs/dev-desktop-cli-rpc-compatibility.md`.
- Blocked by: none; Issue #84 supplies the Saved Projects RPC contract and
  Issue #86 retains product-facing old-CLI messaging.
- Validation gate: `python3 scripts/workflow-check.py --applicable`, focused
  CLI/App tests, devtools smoke tests, independent review, and authorized real
  macOS forced refresh.
- Task checklist: `docs/tasks/dev-desktop-cli-rpc-compatibility-tasks.md`.
- Pull request: https://github.com/myartings/happy/pull/101 (merged to `dev` as
  `87c6aa7ef4fb0d1c7415368cfccb764669ae31b2`).
- Branch/worktree: `issue/98-keep-happy-dev-desktop-and-local-cli-daemon-rpc`
  at `/Users/myartings/workspace/.worktrees/happy-issue-98`.
