# Codex-first Happy Client Latest-`dev` Refresh Tasks

## T1 - Freeze contract and sources

- Scope: pin both parents, record PR #76 / Issue #70 sources, decisions,
  acceptance, scoping, and validation seams.
- Dependencies: none.
- Acceptance: LR-001--LR-009 are mapped to deterministic evidence.
- Validation: strict active audit and `workflow-state.py ready`.

## T2 - Merge and resolve structural conflicts

- Scope: merge pinned `87b5385e` without committing; resolve archive as a row
  union and component imports as symbol unions; inspect every auto-merged
  overlap.
- Dependencies: T1.
- Allowed source edits: the four predicted conflicts and workflow evidence.
- Acceptance: LR-001--LR-003, no conflict marker or unresolved stage.
- Validation: Git stage/row/symbol comparisons and `git diff --check`.

## T3 - Run the integration RED and minimal GREEN

- Scope: select incoming list semantics first, preserve both parent test sets,
  reproduce the legacy `input_required` regression, and add only the D4
  fallback/priority behavior.
- Dependencies: T2 structural resolution.
- Allowed source edits: `visibleSessionListViewData.ts`; tests change only if
  an existing parent test cannot express the accepted public behavior.
- Acceptance: LR-004--LR-006.
- Validation: focused RED, focused GREEN, whole visible-list/current-request/
  navigation/Codex-first families, then App typecheck.

## T4 - Validate the exact candidate

- Scope: run complete applicable checks, Windows non-install doctor/smoke/build,
  strict audits, and protected/secret/generated/binary/dependency scans.
- Dependencies: T3.
- Acceptance: LR-007--LR-008.
- Validation: candidate-bound structured check receipt and exact command log.

## T5 - Review, finish, archive, and commit

- Scope: pin one final candidate, run independent Spec and Standards review,
  remediate findings through implementation if needed, finish/archive, pass
  staged CI, and create the ordinary second merge commit.
- Dependencies: T4.
- Acceptance: LR-001--LR-008.
- Validation: accepted review/finish receipts, strict archive audit, staged and
  committed workflow CI, exact merge-parent inspection.

## T6 - Publish and verify PR #78

- Scope: fetch/reassess `origin/dev`, normally push the feature branch, verify
  remote SHA and PR state/checks, and leave PR #78 open.
- Dependencies: T5.
- Acceptance: LR-009.
- Validation: `git ls-remote`, `gh pr view`, `gh pr checks`, clean status.
