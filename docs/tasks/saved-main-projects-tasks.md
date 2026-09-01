# Saved main projects implementation tasks

This internal checklist serves the single accepted Issue #84 Slice. Items are
serial because they share project identity and spawn contracts; they are not
independently deliverable child Slices.

## T1 — Registry and path identity

- Scope: schema, validation, atomic/revision-safe persistence, normalization,
  and Git common-directory behavior.
- Likely ownership: `packages/happy-cli/src/projects/**` and focused tests.
- Dependencies: accepted spec only. Parallel candidate: no, shared contract.
- Acceptance: SP-01–SP-04.
- Validation: focused CLI Vitest with temporary directory/Git fixtures.

## T2 — Machine RPC and fail-closed spawn

- Scope: list/add handlers and project-ID resolution at the existing directory
  spawn seam; retain scanner handler.
- Likely ownership: `apiMachine.ts`, focused tests, existing spawn option type.
- Dependencies: T1. Parallel candidate: no, shared spawn contract.
- Acceptance: SP-05–SP-06. Validation: handler tests and CLI typecheck.

## T3 — App model, operations, and draft identity

- Scope: validated App contract, list/add operations, machine-scoped project
  selection, and registry-only presentation helpers.
- Likely ownership: `features/saved-projects/**`, `sync/ops.ts`, draft store/tests.
- Dependencies: T1/T2. Parallel candidate: no, shared App contract.
- Acceptance: SP-07 and selection portion of SP-08.
- Validation: focused App Vitest.

## T4 — Picker and shared start integration

- Scope: registry rows, explicit add action, ID-based main spawn, preserved
  worktree path behavior, and removal of duplicate screen spawn orchestration in
  favor of `useStartSessionFromDraft`.
- Likely ownership: New Session screen, shared hook/tests, wiring tests.
- Dependencies: T2/T3. Parallel candidate: no, overlapping composition/start.
- Acceptance: remaining SP-08 and SP-09. Validation: hook/wiring tests and App typecheck.

## T5 — Whole-slice verification

- Scope: complete targeted suites, applicable workflow check, independent Spec
  and Standards review, remediation, finish, and archive projection.
- Dependencies: T1–T4 green. Parallel candidate: review axes only after pinning.
- Acceptance: SP-10 and complete acceptance evidence.

