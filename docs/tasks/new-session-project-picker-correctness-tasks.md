# Tasks: New Session Project Picker Correctness

## T1 — Search data contract

- Status: completed
- Scope: App pure data/search helpers and tests.
- Files: `workspaceProjectDiscovery.ts` and its test.
- Outcome: unified Recent/Workspace filtering, deterministic relevance ranking,
  duplicate priority, and search-aware Recent preview.
- Validation: focused App Vitest file.

## T2 — Scanner and RPC query contract

- Status: completed
- Depends on: accepted interface/risk decisions.
- Scope: CLI scanner, optional Machine RPC request, and tests.
- Outcome: outermost-root discovery, query-before-cap filtering, bounded query,
  and backward-compatible optional request semantics.
- Validation: focused CLI scanner and API Machine Vitest files.

## T3 — New Session integration and layout

- Status: completed
- Depends on: T1 and T2 contracts.
- Scope: Project picker UI, App operation wrapper, loader/request state, and
  focused tests.
- Outcome: full-width search input, debounced query RPC, searchable Recent,
  correct combined empty state, and unchanged selection/spawn seam.
- Validation: focused App tests, App typecheck, browser `/new` smoke.

## T4 — Whole-feature verification and review

- Status: completed with accepted unrelated App-suite baseline gaps
- Depends on: T1-T3.
- Scope: targeted suites, configured App/CLI typechecks, whole-diff review,
  privacy/protocol/rollback inspection, workflow evidence, and archive.
- Validation: commands and acceptance map in workflow `validation.md`.
