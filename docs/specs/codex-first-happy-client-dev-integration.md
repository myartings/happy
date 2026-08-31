# Codex-first Happy Client `dev` Integration Specification

## Status and inputs

- Accepted by the user on 2026-08-31 for PR
  [#78](https://github.com/myartings/happy/pull/78).
- Feature input: `e9c76eee00aa7320b0881a75a19f450993601773`.
- Target input: `origin/dev` at
  `68cfb6f915fb25f5ecd444df2aefafeccae92fa8` after a fresh fetch.
- Common ancestor: `a269068ab42316a6e5749882cd81499aeb31fabb`.
- Product contract: `docs/specs/codex-first-happy-client.md` remains
  authoritative for the Codex-first behavior.

## Intent

Make PR #78 a reviewable, mergeable `dev` candidate without rewriting its
published history. The integrated candidate must preserve both the accepted
Codex-first Windows delivery and every behavior already present on current
`dev`, including the new-session project picker, session transport reliability,
Windows native reliability, mobile-build planning, and current workflow core.

## Scope

- Merge the pinned target into the published feature branch with a normal merge
  commit whose parents remain auditable.
- Resolve the known `docs/PRD.md` and `docs/workspace/archive.md` conflicts as a
  lossless union of target and feature intent.
- Inspect every auto-merged overlap for semantic compatibility, with particular
  attention to New Session, Session transport consumers, Codex-first runtime
  eligibility, localization, Studio presentation, and workflow evidence.
- Repair only integration-caused behavior failures. A product repair requires a
  focused public-seam RED -> GREEN test; mechanical document conflict
  resolution uses exact source comparison instead of a fabricated RED.
- Validate the combined candidate through targeted checks, the complete
  applicable repository profile, relevant CLI/wire/native Windows checks, and
  PR mergeability.

## Non-goals

- Rebasing, amending, force-pushing, deleting branches, or rewriting history.
- Merging or closing PR #78.
- Installing or replacing the local Happy client, intentionally executing
  rollback, signing, publishing, or releasing an artifact.
- Expanding Codex-first behavior beyond its accepted specification.
- Repairing a failure reproduced unchanged on both pinned parents unless the
  user separately accepts that scope.
- Changing authentication, authorization, encryption, Server or Machine RPC
  contracts, or cross-device protocol semantics as part of conflict resolution.

## Compatibility and failure behavior

- The merge must retain the exact feature and target inputs as parents; a normal
  revert must remain available after publication.
- Conflict markers, silently dropped PRD sections, silently dropped archive
  rows, duplicate archive rows, and unresolved index stages are hard failures.
- Any product test failure is classified against both parents before editing.
  An integration-only failure enters TDD; a target-only, feature-only, or shared
  baseline failure is recorded accurately and does not justify unrelated code.
- Workflow state created before the merge must be upgraded only through the
  incoming repository helper if the merged validator requires it. Generated
  `workflow.json` and `state.md` are never edited directly.
- A formal conflict-resolution workflow created while `MERGE_HEAD` exists must
  be able to pass pre-archive CI, generate its terminal archive projection, and
  pass staged and committed CI in the same ordinary two-parent merge commit.
  This exception is limited to one fully checked/reviewed local workflow;
  inherited lifecycle bytes must still equal one parent, and the archive must
  remain the exact parent-row union plus the one terminal row.
- Staged merge validation must compare Git index blobs, not checkout-filtered
  worktree bytes, so `core.autocrlf` cannot fabricate inherited-evidence drift.
- A failed validation blocks the merge commit and push. A conflicting or
  unknown PR state after push blocks completion but does not authorize merging
  the PR.

## Acceptance criteria

| ID | Verifiable outcome | Required evidence |
| --- | --- | --- |
| DI-001 | The integrated history is a normal merge of the pinned feature and `origin/dev` inputs; no rebase, amend, reset, or force push occurs. | Merge parents, reflog/log inspection, push output. |
| DI-002 | `docs/PRD.md` preserves the complete Codex-first section and every current-`dev` section exactly once. | Stage-1/2/3 source comparison, heading/marker scan, whole-diff review. |
| DI-003 | `docs/workspace/archive.md` preserves the target rows and the Codex-first delivery row exactly once, in chronological order. | Parent row sets, duplicate/missing-row comparison, validator. |
| DI-004 | Packaged Windows still resolves Codex-first while Linux and standalone/mobile retain the legacy presentation path. | Existing public contract/runtime tests plus complete App suite. |
| DI-005 | Current-`dev` New Session project discovery/search behavior and Codex-first New Session composition coexist without lost controls, stale selection, or layout regression. | Focused New Session/project-discovery/Codex-first tests and App typecheck. |
| DI-006 | Current-`dev` Session transport and workspace-project behavior remain compatible with the feature's client consumers. | Relevant CLI/wire tests, App sync tests, and complete applicable suites. |
| DI-007 | The merged workflow core accepts the integration workflow and binds all check/review/finish evidence to the exact candidate. | Workflow upgrade if required, validator/runtime tests, strict audit, staged and committed workflow CI. |
| DI-008 | The complete combined source passes the merged repository's full applicable deterministic profile, plus relevant Windows native build/smoke checks, or records only candidate-bound gaps reproduced on a parent. | Structured check receipt, exact commands/results, artifact hashes where produced. |
| DI-009 | Protected paths, secrets, generated artifacts, dependencies, and unrelated product surfaces contain no unauthorized integration delta. | Protected-path/diff/secret/binary scans and whole-diff review. |
| DI-010 | PR #78 points at the integrated remote head and GitHub no longer reports `CONFLICTING`; no PR merge, install, signing, or release occurs. | `gh pr view`, remote SHA equality, clean worktree. |
| DI-011 | The current formal integration workflow can be archived into this same pending merge and passes pre-archive, archived-staged, and committed merge CI without allowing foreign lifecycle rewrites or CRLF-based false positives. | RED -> GREEN merge-local runtime test, full workflow runtime suite, staged CI before/after archive, committed CI. |

## Acceptance-to-signal map

- DI-001--DI-003: Git index stages, merge parents, source-set comparison, Git
  diff and workflow validation.
- DI-004--DI-006: focused public tests followed by App, CLI, Server, and wire
  families selected from the merged repository.
- DI-007--DI-009: merged workflow tooling, strict audit, candidate-bound checks,
  staged CI, review, and bounded source scans.
- DI-011: pending-merge fixtures with `core.autocrlf=true` and
  `core.autocrlf=false`, freshly checked and reviewed integration workflows,
  archive generation, and committed merge validation.
- DI-008: `happyctl.ps1 doctor`, the applicable Windows smoke family, and a
  native desktop build without installation when the merged tooling supports it.
- DI-010: explicit GitHub and local/remote read-only verification after push.
