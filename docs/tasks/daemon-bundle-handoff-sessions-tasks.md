# Daemon Bundle Handoff Session Continuity Tasks

## T1 — Systemd Session isolation

- Status: completed.
- Scope: create a narrow Linux/systemd daemon spawn seam that establishes a
  transient user scope and fails closed when protection cannot be established.
- Allowed files: `packages/happy-cli/src/daemon/`, focused CLI tests.
- Dependencies: none.
- Ownership: current Root; serial prerequisite.
- Parallel candidate: no.
- Acceptance: AC1, AC2, AC6.
- Validation: focused spawn seam tests and a disposable transient-unit probe.

## T2 — Safe replacement-generation adoption

- Status: completed.
- Scope: persist optional non-secret process-identity evidence, adopt only exact
  live protected daemon-owned matches, and preserve list/stop behavior.
- Allowed files: `packages/happy-cli/src/persistence.ts`,
  `packages/happy-cli/src/daemon/`, focused persistence/daemon tests.
- Dependencies: T1 defines the protected-process contract.
- Ownership: current Root.
- Parallel candidate: no; it changes the same daemon lifecycle boundary as T1.
- Acceptance: AC4, AC5, AC6.
- Validation: focused persistence, adoption, list, and process-group stop tests.

## T3 — Concurrent handoff acceptance

- Status: completed.
- Scope: prove two protected Session processes survive one daemon generation
  replacement and remain uniquely manageable under their original identities.
- Allowed files: focused daemon integration tests or bounded test harness;
  Workspace validation evidence.
- Dependencies: T1 and T2.
- Ownership: current Root.
- Parallel candidate: no; it validates the integrated lifecycle.
- Acceptance: AC3, AC4.
- Validation: deterministic harness plus a controlled disposable Linux/systemd
  probe when available; never replace the live installed bundle.

## T4 — Whole-slice verification

- Status: completed.
- Scope: run targeted CLI suites, CLI typecheck, applicable workflow checks,
  forbidden-path inspection, risk controls, and independent high-risk review.
- Allowed files: accepted source/tests/docs and Workspace evidence.
- Dependencies: T1–T3.
- Ownership: current Root with independent read-only reviewers.
- Parallel candidate: review axes may run in parallel only after one checked
  candidate is pinned.
- Acceptance: AC7, AC8.
- Validation: exact commands and review receipts in `validation.md`.
