# Codex-first Happy Client `dev` Integration Tasks

## T1 - Pin inputs and establish the integration contract

- Scope: create the dedicated workflow, link PR #78, pin source/target/base
  commits, and record decisions, risks, contexts, and acceptance criteria.
- Dependencies: none.
- Allowed files: this spec/task pair and
  `docs/workspace/codex-first-happy-client-dev-integration/**` plus
  `docs/workspace/ACTIVE.md` through the workflow helper.
- Acceptance: DI-001, DI-007, DI-010 planning evidence is durable.
- Validation: strict active audit and `workflow-state.py ready`.

## T2 - Merge current `origin/dev` and resolve source conflicts

- Scope: start a normal no-commit merge, inspect index stages, resolve
  `docs/PRD.md` and `docs/workspace/archive.md` as exact unions, and inspect all
  auto-merged overlaps.
- Dependencies: T1.
- Allowed files: the two conflict files, merge index, and this workflow's
  evidence. Product source is read-only unless T3 proves an integration defect.
- Acceptance: DI-001--DI-003 and no unresolved stage or conflict marker.
- Validation: parent/source comparison, `git diff --check`, validator, and
  targeted document assertions.

## T3 - Prove semantic compatibility and TDD-repair integration defects

- Scope: run focused Codex-first, New Session/project discovery, App sync,
  Session transport, workflow, and Windows reliability seams. For an
  integration-only product defect, add one public-seam RED test before the
  smallest GREEN fix.
- Dependencies: T2.
- Allowed files: relevant existing tests and their narrow production seams;
  protected paths and unrelated baseline repair remain excluded.
- Acceptance: DI-004--DI-007.
- Validation: exact focused commands recorded in `validation.md`.

## T4 - Run complete candidate validation

- Scope: execute the merged repository's complete applicable profile, relevant
  CLI/wire families, strict audit, protected/diff scans, Windows doctor/smoke,
  and native build without installation.
- Dependencies: T3.
- Allowed files: generated paths only for build output; source edits route back
  through T3.
- Acceptance: DI-007--DI-009.
- Validation: structured candidate-bound check receipt and exact native hashes.

## T5 - Review, finish, archive, and create the merge commit

- Scope: review the whole integrated diff against both parents, close or bind
  every criterion, archive with `commit=pending`, stage source and evidence
  together, pass staged CI, and create one normal merge commit.
- Dependencies: T4.
- Acceptance: DI-001--DI-009 and complete finish evidence.
- Validation: review receipt, archived audit, staged workflow CI, merge-parent
  inspection, and committed workflow CI.

## T6 - Publish and verify PR #78

- Scope: non-force push the merge commit, verify remote SHA and PR metadata,
  observe checks, and prove the PR is not `CONFLICTING`.
- Dependencies: T5.
- Acceptance: DI-010.
- Validation: `git ls-remote`, `gh pr view`, `gh pr checks`, and clean status.

## T7 - TDD-close merge-local lifecycle enforcement

- Scope: reproduce the pre-archive CI blocker with a pending two-parent merge,
  `core.autocrlf=true`, and a freshly checked/reviewed integration workflow;
  then make staged/committed merge enforcement admit exactly that one terminal
  workflow overlay while preserving parent lifecycle and archive-union guards.
  Review-discovered remediation also rejects unreviewed novel non-lifecycle
  bytes and accepts the same canonical `ACTIVE.md` semantics from LF and CRLF
  staged/tree objects, including Windows `core.autocrlf=false`.
- Dependencies: T5 review discovered the workflow-core contradiction.
- Allowed files: `scripts/test-happy-workflow-runtime.py`,
  `scripts/workflow-ci.py`, and this workflow's contract/evidence.
- Acceptance: DI-007 and DI-011; no product, Server, auth, protocol, install,
  release, or history-rewrite change.
- Validation: focused RED -> GREEN runtime test, complete 18+ workflow runtime
  suite, validator tests, strict audit, a fresh candidate-bound full check, and
  fresh dual-axis review.

## Progress

- `2026-08-31`: T1 and T2 complete. Inputs are pinned, schema-3 workflow is
  active, the normal merge is in progress, and both document conflicts are
  exact lossless unions with no unresolved stage.
- `2026-08-31`: T3 complete without product changes. Every focused overlap
  family passes; one CLI timeout did not reproduce in the isolated or complete
  rerun, and the two Server fixture failures are byte-identical parent gaps.
- `2026-08-31`: T4 implementation validation complete. Full App and CLI,
  happy-wire, typechecks, Windows smoke/doctor, workflow core, and unsigned
  native build pass. The final staged structured receipt and scans are the
  remaining T4 terminal actions.
- `2026-08-31`: T5 and T6 pending final candidate binding, two-axis review,
  finish/archive, normal merge commit, committed CI, push, and PR verification.
- `2026-08-31`: The first pre-archive staged CI exposed T7: merge mode rejects
  the current complete local workflow before archive and compares filtered
  checkout bytes as inherited evidence. T5 review/check receipts are invalidated
  for the engineering change; T7 resumes at an intended RED test.
- `2026-08-31`: T7 focused RED -> GREEN is complete. The new pending-merge
  fixture passes all five lifecycle stages, and three existing archive/merge
  regressions pass. The complete runtime family passes 19/19 in 666.667 s;
  state-upgrade tests, validator tests, selective adoption validation, and the
  strict all-workspace audit also pass. A follow-up public-CLI assertion proves
  that an inherited lifecycle rewrite is rejected before the restored candidate
  completes all merge-local CI stages. Real-candidate binding and fresh review
  are pending before archive.
- `2026-08-31`: The first fresh review package blocked on one D8/DI-011 gap:
  novel non-lifecycle merge bytes could emit only a notice without a local
  checked/reviewed workflow. A new public-CLI RED reproduced the false pass;
  the minimal GREEN binds novel bytes to the existing local pre-archive or
  archived candidate validation. The focused tracer passes 1/1 and four legal
  archive/merge regressions pass 4/4. The updated full runtime passes 20/20,
  with upgrade/validator/audit/compile/diff checks green; final candidate
  binding and fresh review are pending.
- `2026-08-31`: The next frozen candidate's Spec axis accepted, while its
  Standards axis found one P1 portability defect: `ACTIVE.md` validation
  projected `os.linesep` and rejected a valid LF staged/tree object on Windows
  with `core.autocrlf=false`. A refined public-CLI RED failed only on that
  diagnostic; the minimal GREEN canonicalizes newline semantics while retaining
  index/tree authority. The focused tracer passes through pre-archive staged,
  archived staged, and committed CI; five adjacent regressions pass 5/5 and the
  complete runtime passes 21/21 in 744.870 s. Fresh candidate binding and review
  remain pending.
