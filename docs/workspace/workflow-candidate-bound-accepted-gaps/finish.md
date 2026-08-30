# Finish Review: `workflow-candidate-bound-accepted-gaps`

## Summary

- Added an explicit schema-3 `check-receipt accepted_gaps` path that binds one
  complete staged run, its exact positive-exit failure indexes, approval,
  run/candidate identities, and a canonical accepted-policy fingerprint.
- Propagated the exact binding through active audit, final review, finish,
  pre-archive CI, archived staged CI, and committed CI while preserving the
  existing all-success path.
- Rejected generic-gate bypass, worktree-only runs, incomplete/mismatched
  failures, stale/tampered evidence, duplicate indexes, missing approval, and
  approval-only drift.

## Verification

- Initial public-CLI RED: 3/3 expected failures reproduced the missing receipt
  and generic-gate bypass.
- Focused GREEN: exact dual-failure receipt, worktree rejection, binding clear,
  tamper matrix, and terminal lifecycle scenarios pass.
- Full runtime suite: 12/12 passed after second review remediation in 218.644 s;
  formal staged run `a3b37f87-c47f-4e23-9a5e-f484a5031e97` passed 5/5
  with runtime 12/12 in 230.340 s.
- Validator tests 9/9, state-upgrade tests 2/2, selective validation, strict
  active/repository audits, Python compile, and diff checks pass.

## Whole-diff review

- Fresh independent Spec and Standards reviews both accepted frozen candidate
  `2588349a7fbd80dcf28836f942af72b6d135b9edd3a7ae20b4349ccd144dd793`
  and diff `e5158b1618c1c353a21e90dbc4cf804954ab0c047705b26f10c2590ef2deba12`
  with no findings or follow-up candidates.
- Changed engineering scope is limited to the workflow check/state/CI runtime
  and its public-CLI integration test. Product, devtools, dependencies,
  `.ai/project.json`, release behavior, and historical Workspaces are unchanged.

## Rollback or mitigation

- Before commit, the complete staged diff is the rollback boundary. After the
  authorized atomic commit, one normal revert restores prior all-success-only
  receipt behavior.
- No migration, user data, installed application, registry item, scheduled
  task, daemon, external service, or production state is changed.

## Lessons promoted

- `CONTEXT.md`: no glossary change; terms are local to the feature spec.
- `docs/ARCHITECTURE.md` or ADR: none required; the reversible policy is fully
  captured by the spec, decisions, and runtime tests.
- Skill/workflow rule: the implementation itself is the durable workflow rule;
  no additional Skill text is needed.

## Follow-up

- Create the authorized atomic prerequisite commit, push its normal branch,
  and open a dev PR. Merging remains a separate user action.
- After verified `dev` contains the prerequisite, restore named stash
  `stash@{0}` (`43338c89b4cbe5bbf30084b70714870b49392dc9`) and resume the Windows Native
  delivery in its original branch/worktree.
- No non-blocking review discovery or additional tracker mutation is proposed.
