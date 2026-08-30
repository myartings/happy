# Finish Review: `new-session-project-picker-correctness`

## Summary

- Corrected the New Session Project picker layout so the search field occupies
  the available row width.
- Unified Recent and Workspace search, including displayed Recent names,
  deterministic relevance ranking, duplicate priority, and search-aware Recent
  preview behavior.
- Made daemon discovery return outermost project roots and accept a bounded
  optional query before the result cap, with App debounce, Machine/query cache,
  timeout, stale-response rejection, and old-daemon fallback intact.

## Verification

- Focused App: 2 files, 20 tests passed.
- Focused CLI: 2 files, 9 tests passed.
- App and CLI TypeScript checks passed.
- Complete CLI unit family: 93 files, 873 tests passed.
- Browser `/new` smoke: the search input measured 682 px within a 734 px row,
  with the complete placeholder visible.
- Privacy-safe local scan: 59 outermost projects and 2 bounded `happy` matches,
  neither truncated.
- The user explicitly accepted 15 pre-existing failures in four untouched
  Studio/settings App test files. The exact files and consequence are recorded
  in `validation.md`; no changed feature test fails.

## Whole-diff review

- Passed after correcting the one discovered machine-switch/default-path race:
  default selection now reads the unfiltered place list.
- Fixed-root traversal, depth/result bounds, query length, no-path-logging,
  encrypted optional RPC compatibility, and read-only behavior were preserved.
- No Server, Sync, Session/spawn protocol, persistence, authentication,
  arbitrary-root, or migration changes were introduced.

## Rollback or mitigation

- Reverting the optional query/debounce path restores client-only filtering;
  reverting the scanner leaf rule restores nested package discovery.
- No stored data or protocol migration requires cleanup. Manual path entry,
  Recent fallback, and old daemons remain available throughout rollback.

## Lessons promoted

- `docs/PRD.md`: promoted unified Project search, relevance order, outermost
  project roots, and query recovery beyond the unfiltered result window.
- `docs/specs/new-session-project-picker-correctness.md`: retained the complete
  verifiable feature contract and accepted compatibility boundaries.
- `CONTEXT.md`, architecture/ADR, and Skill/workflow rule: no additional
  reusable project-wide change was warranted.

## Follow-up

- No tracker or pull request was requested; the work remains local to
  `brave-garden`.
- The four unrelated App-suite baseline failures may be repaired as a separate
  scoped task. They do not block the accepted Project picker outcome.
- No commit was requested; archive with `commit=pending`.
