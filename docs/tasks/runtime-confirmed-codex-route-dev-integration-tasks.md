# Runtime-confirmed Codex Route Dev Integration Tasks

## T1 — Preserve both conflict-side contracts

- Scope: the pending merge and `packages/happy-cli/src/daemon/controlServer.test.ts`.
- Dependencies: PR #94 candidate and `origin/dev@bf123e10`.
- Ownership: current Root; serial; not a parallel candidate.
- Acceptance: no conflict markers; effective-route tests and legacy empty-stop
  compatibility test both remain complete.
- Validation: `git diff --check` and focused daemon/Codex unit tests.

## T2 — Verify the complete staged merge candidate

- Scope: all staged merge output plus this merge-local Workspace.
- Dependencies: T1.
- Ownership: current Root; serial; not a parallel candidate.
- Acceptance: applicable structured checks are candidate-bound; only explicitly
  authorized, evidenced gaps may remain.
- Validation: `python3 scripts/workflow-check.py --applicable` and
  `python3 scripts/workflow-audit.py --all --strict`.

## T3 — Review, archive, and deliver

- Scope: the frozen complete candidate.
- Dependencies: T2.
- Ownership: independent Spec and Standards reviewers, then current Root.
- Acceptance: both review axes accept the same candidate; finish and staged CI
  pass; the ordinary two-parent merge commit is pushed to PR #94.
- Validation: review receipts, `python3 scripts/workflow-ci.py --staged`, remote
  head verification, and GitHub mergeability status.
