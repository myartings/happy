# Journal: `new-session-project-picker-correctness`

## `2026-08-30`

- Started workflow.
- Reproduced the Project search field at 171 px inside a 734 px row; an
  ephemeral `flex: 1` change expanded it to 682 px and restored the full label.
- Targeted pre-change suites passed 21/21, confirming missing regression cases
  rather than an already-caught failure.
- Local privacy-safe scan summary: 95 projects, 36 nested under another
  recognized project, 14 package-only; searching `happy` returned 10 results
  and ranked `codium` before the exact `happy` project.
- Resolved unified search/ranking, outermost-root scanning, and optional
  query-aware RPC decisions. Risk cleared with fixed-root, bounded, read-only,
  compatibility, and no-logging controls.
- Implemented query-aware scanning and caching, unified named Recent and
  Workspace filtering/ranking, combined empty-state handling, and the
  full-width Project search input.
- Post-change browser measurement: 682 px search input inside the 734 px row;
  the complete placeholder is visible without DOM mutation.
- Post-change privacy-safe local scan: 59 outermost projects; a bounded `happy`
  query returns 2 matches, with neither result set truncated.
- Focused App tests (20), focused CLI tests (9), App/CLI typechecks, complete CLI
  unit tests (873), workflow checks, and diff checks pass. The full App family
  retains 15 unrelated failures across four untouched Studio/settings tests;
  see `validation.md` for exact scope and consequence.
- Whole-diff review found one machine-switch/default-path race introduced by
  filtering Recent before auto-selection. Default selection now reads the
  unfiltered place list, and the final focused App suite and typecheck pass.
- Final review found no remaining blocking correctness, compatibility,
  privacy, concurrency, rollback, or scope findings in the changed feature.
- The user explicitly accepted the 15 unrelated pre-existing App test failures
  as a formal check gap and requested workflow archival.
