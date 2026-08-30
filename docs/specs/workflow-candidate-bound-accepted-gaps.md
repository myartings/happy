# Candidate-bound accepted check gaps

## Goal

Allow a formal schema-3 workflow to accept explicitly approved failures from
one complete staged `workflow-check` run while retaining the same candidate,
configuration, command-set, scope, and evidence bindings required by a fully
successful run.

## Terms

- An **accepted check failure** is a canonical failed command record with a
  positive integer exit code whose exact `commandIndex` is named in a
  structured check receipt.
- An **accepted-failures policy** is the versioned state object that stores the
  sorted failure indexes and the approval that authorizes accepting them.
- A **bound run** remains the final structured evidence run and is protected by
  `checkRunFingerprint` and `checkedCandidate`.

## Observable interface and state

The public receipt command supports this explicit form:

```text
workflow-state.py check-receipt <slug> accepted_gaps \
  --run-id <id> \
  --accepted-command-index <zero-based index> [repeat as needed] \
  --approval <non-empty approval> \
  --evidence <non-empty evidence>
```

On success it records the existing structured binding fields plus:

```json
{
  "checkAcceptedFailures": {
    "policyVersion": 1,
    "commandIndexes": [2, 3],
    "approval": "User-approved exact baseline failures"
  },
  "checkAcceptedFailuresFingerprint": "64 lowercase SHA-256 hex characters"
}
```

The command indexes are meaningful only together with `checkRunId`,
`checkRunFingerprint`, and the run's candidate and command-set fingerprints.
`checkAcceptedFailuresFingerprint` binds the complete policy—including the
approval—to those run and candidate identities.

## Acceptance criteria

1. `check-receipt accepted_gaps` accepts only a complete, current structured
   run whose identity is `staged-candidate-v1`.
2. The caller must provide a non-empty approval and one or more unique,
   non-negative command indexes in ascending canonical order after recording.
3. The provided index set must exactly equal every and only non-successful
   command in the run. Missing failures, extra indexes, successful indexes,
   incomplete runs, and inconsistent records fail closed without changing
   workflow state.
4. A successful accepted-gaps receipt retains `checkRunId`,
   `checkRunFingerprint`, and `checkedCandidate`; it stores the versioned
   accepted-failures policy, binds that policy to the run and candidate with a
   SHA-256 fingerprint, and sets `check=accepted_gaps`.
5. `check-receipt passed` retains its all-success semantics and never stores an
   accepted-failures policy. A blocked receipt clears all check, candidate,
   final-review, and accepted-failures bindings.
6. The generic `gate` command rejects both `check=passed` and
   `check=accepted_gaps`, so neither candidate-bound outcome can be forged
   without a structured run.
7. Active audit, final review, finish, pre-archive staged CI, archived staged
   CI, and committed CI revalidate the exact accepted failures and policy
   fingerprint against the bound run. Approval, evidence, index, candidate,
   scope, configuration, or command-set drift fails closed.
8. Existing completely successful workflow deliveries continue to pass the
   public runtime suite unchanged. Historical archived schema-1 evidence
   remains passive.
9. The change does not alter `.ai/project.json` check selection, skip or rerun
   commands, mutate product code, or treat unrecorded failures as acceptable.

## Failure behavior and edge cases

- Duplicate indexes are rejected rather than silently deduplicated.
- Boolean values are not valid integer indexes in persisted state.
- An accepted index must point to a record with a positive integer exit code
  and the canonical `failed (<code>)` result.
- `passed` and `reused` records cannot be accepted failures.
- A run that stopped early because of candidate/worktree divergence is
  incomplete and cannot be accepted.
- A receipt may bind only the final evidence run and only while the review gate
  is pending; an older run or a repeated receipt after review completion is
  rejected without changing workflow state.
- The terminal review gate revalidates the check binding after both independent
  conclusions, closing the interval between conclusion recording and gate
  completion.
- Accepted failures are not reusable as a successful check run.
- Changing the approval, indexes, evidence records, or candidate after binding
  invalidates downstream evidence or candidate checks.

## Non-goals

- Fixing or suppressing the underlying App or Server test failures.
- Weakening the configured full/applicable profile or changing command order.
- Adding a general warning waiver or a non-candidate-bound `accepted_gaps`
  path.
- Rewriting historical Workspace evidence.
- Changing product, devtools, dependency, release, or platform behavior.

## Verification plan

| Criterion | Test or evidence |
| --- | --- |
| AC1-AC4 | Public-CLI runtime test creates a three-command staged run with two failures and binds their exact indexes. |
| AC2-AC3, AC6 | Public-CLI negative tests reject missing approval/indexes, duplicate/mismatched/success indexes, and generic gate bypass. |
| AC5, AC8 | Existing successful staged archive and committed-CI test remains green. |
| AC7 | Accepted-gap fixture completes review/finish/archive and passes staged plus committed workflow CI; tamper cases fail. |
| AC9 | Changed-path inspection and unchanged `.ai/project.json`; workflow profile and strict audits pass. |
