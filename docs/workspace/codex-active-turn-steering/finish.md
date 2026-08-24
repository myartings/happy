# Finish Review: `codex-active-turn-steering`

## Summary

Happy now forwards ordinary text and supported images received during an active
Codex turn through app-server `turn/steer`. The host snapshots the active turn
ID before asynchronous attachment preparation. Any rejection falls back to the
existing queue exactly once; idle input, `/clear`, and `/goal` retain their
existing behavior.

## Verification

- Happy CLI typecheck passed.
- All Codex unit tests passed: 18 files, 131 tests.
- Full Happy CLI build and unit suite passed: 90 files, 829 tests.
- Happy App and server typechecks passed; server tests and workflow-core checks
  passed.
- The repository-wide App suite retains two Studio baseline failures whose tests
  and source files hash-identically match `origin/dev`; no App file changed here.
- `git diff --check` passed.

## Whole-diff review

Passed with no blocking findings. Review covered expected-turn race safety,
fallback duplication/loss, old Codex method compatibility, command isolation,
image-only behavior, mode boundaries, logging, and rollback.

## Rollback or mitigation

Remove the `routeCodexUserText` host seam and `steerTurn` client method to return
all messages to the existing queue. No migration, server change, or stored data
rollback is required. Runtime steering failures already degrade to that queue.

## Lessons promoted

- `CONTEXT.md`: none; this does not change repository boundaries.
- `docs/ARCHITECTURE.md` or ADR: none; it uses the existing app-server boundary.
- Skill/workflow rule: none; the behavior is captured in the feature spec and tests.

## Follow-up

- Merge the feature PR into `dev` and run `devtools/happyctl refresh-desktop` so
  the manager synchronizes latest upstream, packages `dev`, installs, verifies,
  and launches the personal Desktop client.
- Repair the two unrelated Studio baseline tests in a separate feature branch.
