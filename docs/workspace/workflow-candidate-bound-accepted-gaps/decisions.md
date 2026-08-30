# Decisions: `workflow-candidate-bound-accepted-gaps`

| ID | Question | Options / constraints | Owner, reversibility, cost of error | Status | Decision and evidence |
| --- | --- | --- | --- | --- | --- |
| D1 | What may `accepted_gaps` accept? | Free-form warnings, command names, or exact structured-run indexes. Names can repeat; free-form text cannot be revalidated. | Workflow owner; reversible, but false success can admit an unchecked delivery. | resolved | Accept exactly the set of non-successful `commandIndex` values from one complete run. The existing run already binds ordered commands and fingerprints. |
| D2 | Which run identity is eligible? | Worktree or staged candidate. Terminal CI already requires staged identity. | Workflow owner; cheap to tighten now, costly if ephemeral evidence reaches review. | resolved | `accepted_gaps` receipts require `staged-candidate-v1`; normal `passed` compatibility is unchanged. |
| D3 | How is authorization persisted? | Gate evidence only or a versioned structured object. Gate evidence is human-readable but not shape-checked. | User owns acceptance; reversible. Missing authorization provenance weakens auditability. | resolved | Persist `checkAcceptedFailures` with policy version 1, sorted unique indexes, and non-empty approval, alongside run and candidate bindings. Bind the complete policy to those identities with `checkAcceptedFailuresFingerprint`. |
| D4 | How do downstream gates validate it? | Trust the receipt, or re-run exact validation in audit and CI. | Repository delivery authority; false pass has high blast radius. | resolved | Audit, finish, pre-archive CI, archived staged CI, and committed CI derive the exact allowed indexes from state and revalidate the same bound run and fingerprint. |
| D5 | Can generic `gate check accepted_gaps` remain? | Preserve compatibility or reject unbound candidate outcomes. Schema-3 final delivery requires a bound candidate. | Workflow owner; easy to reverse. Keeping it creates the diagnosed bypass/dead-end. | resolved | Reject both generic `check=passed` and `check=accepted_gaps`; candidate-bound outcomes must use `check-receipt`. Historical archived schema-1 state remains passive. |
| D6 | How is this delivered beside pending Windows work? | One PR with two archive rows, or a prerequisite PR followed by a rebased/reconstructed Windows delivery. `workflow-ci` permits exactly one new archive row per submission range. | User authorized separate repair and PR creation; merges remain unauthorized. | resolved | Deliver one prerequisite workflow PR to `dev`. Resume the stashed Windows candidate only after verified `dev` contains the prerequisite. |
| D7 | How is approval-only drift detected? | Trust any later non-empty approval, compare history text, or fingerprint the canonical policy with its run/candidate binding. Both first-pass reviewers proved the first option violates the accepted contract; history text is not a canonical state interface. | Workflow owner; reversible. Missing binding can silently change who accepted a failed run. | resolved | Hash policy version, indexes, approval, run ID, run fingerprint, and checked candidate into a separate SHA-256 state field; validate it at every consumer of the accepted index policy. |
| D8 | Are negative subprocess return codes accepted? | Expand evidence schema to signal semantics, or retain the existing non-negative evidence authority and specify positive failure codes. The Windows need is ordinary positive exit codes. | Workflow owner; expanding signal semantics would be new cross-platform scope. | resolved | Reconcile the spec to positive integer failure codes. Negative/signal semantics remain outside this delivery. |
| D9 | What happens if evidence or a receipt changes around completed review? | Preserve a completed review, reset downstream gates, or reject mutation. A later run must also supersede older evidence immediately rather than only during audit. | Workflow owner; reversible. Silent state corruption or a stale approval can produce contradictory terminal evidence. | resolved | Require the selected run to be the final evidence run at receipt time; allow receipts only while `review=pending`; and revalidate the binding again when recording terminal `review=passed|accepted_gaps`. Rejections occur before mutation. |

## Risk assessment

Result: `cleared-with-controls`.

- Blast radius: every future formal Happy delivery using schema-3 checks.
- False-success cost: an unrelated or stale failure could be mislabeled as
  accepted and pass repository delivery guards.
- Controls: staged identity only; complete and current run; exact positive-exit
  index equality; canonical result/exit-code validation; explicit approval;
  accepted-policy/run/candidate/config/scope/command fingerprints;
  receipt locking after review; terminal review-gate revalidation;
  generic-gate rejection; negative tamper tests; independent two-axis review.
- Rollback: one workflow-only revert restores the prior all-success behavior;
  no product data, external service, installed application, registry, task, or
  daemon state is touched.
- Stop conditions: any path that accepts an incomplete, mismatched, unstaged,
  stale, unapproved, or tampered run; any product/devtools/config mutation; or
  any failure in the existing successful-delivery tests.

## Scoping result

Result: `ready`.

- Accepted slice: exact candidate-bound acceptance of explicit structured-run
  failures, including terminal audit and CI propagation.
- Topology: serial `current-root`; shared runtime/state/CI interfaces overlap
  and are not independent writer units.
- Test authority: `scripts/test-happy-workflow-runtime.py` at the public CLI
  boundary, followed by the configured workflow profile and strict audits.
- Allowed implementation files: `scripts/workflow-check.py`,
  `scripts/workflow-state.py`, `scripts/workflow-ci.py`, and
  `scripts/test-happy-workflow-runtime.py`.
- Allowed evidence files: this task's spec, task list, and Workspace.
- Excluded: `.ai/project.json`, product/devtools/dependencies, historical
  Workspaces, release behavior, skipped checks, and the stashed Windows
  candidate.
- Material growth routes to a new decision and planning boundary; no adjacent
  baseline-test repair is pre-authorized.
