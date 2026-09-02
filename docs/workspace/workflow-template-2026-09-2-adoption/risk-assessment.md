# Risk Assessment: `workflow-template-2026-09-2-adoption`

## Classification

`cleared-with-controls` — High-risk workflow/session routing and commit-bound
enforcement changes, with no product runtime, user data, permissions, money,
deployment, or external mutation in the accepted Slice.

## Blast radius and reversibility

- Affected systems: local Agent workflow runtime, lifecycle evidence, candidate
  binding, tracker/session routing guidance, and repository verification tools.
- False success could allow an invalid candidate or wrong session to appear
  deliverable; partial adoption could create mixed-version workflow semantics.
- Before commit the candidate is fully reversible as one working-tree diff.
  After a separately authorized atomic commit, rollback is one revert.

## Failure modes and controls

| Failure mode | Required control / stop condition |
| --- | --- |
| Wrong or dirty source | Require clean source HEAD = dereferenced tag = pinned commit before dry-run/apply. |
| Unauthorized full synchronization | Use only `.ai/template-adoption.json`; inspect command and changed paths; stop on broad-manifest evidence. |
| Unexpected or unsafe surface | Classify every dry-run entry before apply; stop on unknown path or retirement mismatch. |
| Happy authority drift | Preserve explicit paths; inspect translations and negative product/protected path set; run Happy validator. |
| Mixed-version or partial apply | Use transactional synchronizer, then reconcile serially and require final zero drift. |
| Active/history incompatibility | Run targeted runtime/upgrader suites plus strict active/all audit; never bulk-rewrite archives. |
| Candidate/check mismatch | Pin and stage the complete accepted candidate; run applicable checks and staged CI. |
| Review blind spot | Require independent capable Spec and Standards reviews of the same pinned candidate. |
| Interrupted execution | Preserve exact source/base and Workspace evidence; do not advance a gate without deterministic output. |
| Unauthorized delivery | Stop after staged CI; do not commit, push, open/merge PR, mutate Issue, clean worktree, or release. |

## Responsible-owner decision

The current Sol Medium Root owns source identity, classification, translation,
rollback, and candidate integration. Any source mismatch, preserved-scope
expansion, new protected/product change, or delivery mutation returns to the
user instead of being waived.
