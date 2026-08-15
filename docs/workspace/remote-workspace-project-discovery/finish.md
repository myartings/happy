# Finish Review: `remote-workspace-project-discovery`

## Summary

Implemented optional remote workspace project discovery for the full New
Session working-directory picker. The daemon scans its fixed conventional
workspace root with depth/result bounds and exposes the results through an
optional Machine RPC. The App adds Machine-keyed loading/cache state, runtime
response validation, platform-aware Recent deduplication, search, and
non-blocking picker states. Home Dock, persistence, metadata, and spawn
contracts remain unchanged.

## Verification

- CLI scanner and RPC targeted suites passed, 7/7; CLI typecheck passed.
- App discovery and RPC wrapper suites passed, 13/13; App typecheck passed.
- Native Windows privacy-safe benchmark found 59 projects in 166ms without
  truncation and did not print private paths.
- Workflow validation and both workflow-core/CI test families passed, 14/14.
- `git diff --check` passed apart from repository line-ending notices.
- Accepted gaps: the unrelated Server attachment baseline failure; the
  full-App parallel 1MB blob timeout that passes 9/9 in isolation; and real
  daemon/App smoke deferred to avoid restarting the daemon serving this
  session.

## Whole-diff review

Passed after resolving both medium findings: malformed/encrypted RPC error
responses are now rejected and not cached, and `~` Recent paths now expand via
the selected Machine home directory before Windows/Unix-aware deduplication.
No blocking finding remains. See `review.md`.

## Rollback or mitigation

Rollback is source-only: remove the optional `list-workspace-projects` Machine
handler and scanner, remove the App wrapper/data layer, and remove the New
Session picker integration. No migration, persisted record, metadata field, or
protocol-version rollback is required. Older daemons remain compatible because
the App treats missing RPC, malformed response, failure, and timeout as
non-blocking `unavailable` state while retaining manual entry and Recent.

## Lessons promoted

- `CONTEXT.md`: none; implementation details are already captured in the
  feature context and specification.
- `docs/ARCHITECTURE.md` or ADR: none; no repository-wide architectural change.
- Skill/workflow rule: none; the review fixes are feature-specific rather than
  reusable workflow policy.

## Follow-up

- On a safe maintenance window, install this branch's CLI build and run the
  redacted real daemon/App New Session smoke without disrupting an active
  session.
- Investigate the pre-existing Server attachment GET failure and App 1MB blob
  parallel-load timeout separately; neither is caused by this branch.
- No external tracker or pull request exists, and no external mutation is
  authorized.
