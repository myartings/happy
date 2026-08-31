# Tasks: Worktree Mobile Build Optimization

## T1 — Correct shared package and fingerprint configuration

- Move pnpm 10 settings to `pnpm-workspace.yaml` and remove the ignored root
  block without lockfile drift.
- Add the supported Expo fingerprint skip for JavaScript-only `extra` values.
- Validation: pnpm frozen-lockfile/config checks and two-metadata fingerprint
  comparisons on iOS and Android.
- Dependencies: none.
- Parallel candidate: no; shared configuration lands first.

## T2 — Implement the conservative mobile planner

- Add a portable Node planner with pure three-state decision logic and bounded
  Git/EAS adapters.
- Expose it through `happyctl mobile-plan` with human and JSON output.
- Cover fast-path classification, exact artifact matching, positive artifact
  availability/expiry, independent index/worktree dirty provenance/divergence,
  staged-delete/untracked-recreation coverage, unknown build-path and
  literal-filename conservatism, a reusable positive
  control before isolated mismatch mutations, unfolded source/destination
  provenance for committed/staged/unstaged renames, and failure behavior through
  public/pure seams.
- Validation: Node tests plus no-network `happyctl` smoke calls.
- Depends on: T1.
- Parallel candidate: no; later command/report work shares `happyctl` contracts.

## T3 — Generalize personal mobile validation and add Android commands

- Preserve existing iOS commands while extracting shared personal Expo/EAS
  validation and release guards.
- Explicitly propagate every readiness failure so Bash conditional/OR-list
  semantics cannot mask configuration or clean-tree failures.
- Add Android doctor, internal/store build, OTA, and status commands; deliberately
  omit Play submission until its profile exists.
- Validation: Bash syntax and iOS/Android dry-run smoke tests.
- Depends on: T1.
- Parallel candidate: no; overlaps T2 and T4 in `happyctl`.

## T4 — Add mobile build provenance reports

- Capture EAS JSON build metadata, source provenance, duration, artifact
  reference, and explicit artifact-digest status.
- Require zero process exit, `FINISHED`, and matching returned
  platform/profile/channel for build success; report original process, raw EAS,
  and effective outcomes separately while retaining partial failure fields.
- Make full artifact SHA-256 an explicit HTTPS-only streaming option.
- Preserve the exact EAS response byte count and SHA-256 even when malformed
  JSON cannot provide structured report fields.
- Ensure failed build commands still leave an external diagnostic report when
  sufficient local provenance exists.
- Guarantee temporary response cleanup on success, report/hash failure, and
  shell interruption.
- Validation: fixture-backed report smoke test; dry-run negative checks.
- Depends on: T3.
- Parallel candidate: no; shares release action code.

## T5 — Integrate, document, verify, and review

- Document worktree planning, initial native baseline cost, pnpm install reuse,
  Metro operation, artifact reuse, and guarded native builds.
- Run targeted checks, applicable repository checks, full diff inspection, and
  independent review; fix only in-scope findings and rerun affected checks.
- Do not build, publish, install, submit, commit, push, or open a PR without
  separate authorization.
- Depends on: T1-T4.

## T6 — Repair the accepted-gap review prerequisite and finish

- Treat the hard-coded `check=passed` review prerequisite as a bounded blocking
  defect discovered during T5; preserve every mobile outcome and delivery
  boundary.
- Through the public workflow CLI, allow only `passed` and explicitly accepted
  `accepted_gaps` checks to enter candidate-bound final review. Require the gap
  disposition to bind a complete failed run and exact staged candidate; reject
  generic/unbound declarations and all-passing or result/exit-inconsistent runs.
  Preserve reuse provenance, evidence/config freshness, review-package matching,
  dual-axis conclusions, finish, archive, and staged-CI guards.
- Validation: focused RED-to-GREEN regression, complete workflow runtime suite,
  fresh candidate-bound check, fresh dual-axis review, and staged finish CI.
- Depends on: T5 verification evidence and explicit user authorization for the
  bounded prerequisite repair.
