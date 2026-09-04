# Publish Launch-Pinned Codex Effort `dev` Integration Specification

## Intent

Make PR #106 mergeable against `dev@124299f0` while preserving the complete
Issue #103 delivery and the complete workflow-2026.09.2 adoption in an auditable,
ordinary two-parent integration commit.

## Scope

- Merge source `008f90c4` with target `124299f0` without history rewriting.
- Resolve `docs/workspace/archive.md` as the exact parent-row union.
- Add exactly one checked, reviewed, canonical integration Workspace.
- Validate, push, wait for hosted CI, merge PR #106, and verify Issue #103 closure.

## Non-goals

- New product behavior, refactoring, or unrelated repair.
- Rebase, reset, amend, force-push, branch deletion, worktree cleanup, release,
  signing, deployment, or client installation.
- Reinterpreting or rewriting either parent's completed lifecycle evidence.

## Acceptance criteria

| ID | Verifiable outcome | Required evidence |
| --- | --- | --- |
| INT-001 | The integration commit has source `008f90c4` and target `124299f0` as its two parents; no history rewrite occurs. | Commit-parent inspection and committed-range CI using the target parent. |
| INT-002 | The archive before terminal projection is the exact parent-row union, with neither row dropped or duplicated. | Parent/index row-set comparison and workflow validator. |
| INT-003 | Every inherited product and workflow byte comes from a parent; novel bytes are limited to the accepted integration lifecycle. | Git/index comparison and independent whole-candidate review. |
| INT-004 | The complete applicable configured profile and staged workflow CI pass for the frozen candidate. | Structured check receipt and pre-/post-archive staged CI. |
| INT-005 | Independent Spec and Standards reviewers selected by the repository's low-risk review profile accept the same unchanged candidate. | Candidate-bound review package and both conclusions. |
| INT-006 | The integration commit is pushed without force, hosted checks pass, and PR #106 is merged through the normal merge method. | Remote SHA, hosted check output, and PR merged state. |
| INT-007 | Issue #103 closes through the merged PR's existing `Closes #103` linkage. | GitHub Issue state after merge. |

Any failure blocks the next publication step. External divergence requires a
fresh bounded integration decision; it never authorizes rebase or force-push.
