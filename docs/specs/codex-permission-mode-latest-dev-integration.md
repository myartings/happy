# Codex Permission Mode Latest Dev Integration

## Boundary

Merge `origin/dev@03936270022bdbb635f66a0cbab647a7b9e9b92b` into the
Issue #87 branch while preserving both parent contracts. This integration
adds no product behavior and changes no authorization policy.

## Invariants

1. Issue #87 permission-mode resolution, outbound metadata, and initial CLI
   metadata behavior remain unchanged.
2. The dev parent's runtime-confirmed model/effort pair and Saved Projects
   behavior remain unchanged.
3. `Metadata` contains both optional runtime route fields and the existing
   permission-mode fields; the latter remain a display/launch mirror, not a
   live authorization command.
4. Lifecycle evidence is the exact parent union plus this integration's one
   terminal archive row.
5. Delivery uses an ordinary two-parent merge commit and non-force push.

## Non-goals

- New permission modes, model routing, defaults, RPCs, schemas, migrations,
  native changes, releases, or installation.
- Repair of unrelated accepted Windows test-fixture gaps.

## Acceptance criteria

| ID | Criterion | Evidence |
| --- | --- | --- |
| MI1 | No unmerged entries or conflict markers remain. | Git inspection and `git diff --check`. |
| MI2 | The archive is the workflow-defined exact parent-row union. | `merge_archive_overlay` preflight and staged workflow CI. |
| MI3 | Both permission and effective-route metadata contracts coexist. | Typecheck and focused App/CLI tests. |
| MI4 | No new authorization or routing behavior is introduced. | Parent-byte comparison and independent Spec/Standards review. |
| MI5 | The complete applicable candidate is checked and reviewed. | Workflow check receipt and two-axis review. |
| MI6 | The merge is committed, pushed without force, and PR #90 merges only after GitHub checks pass. | Parent/SHA inspection and GitHub PR state. |

## Risk and rollback

The false-success risk is silently changing permission authority or publishing
unconfirmed runtime route state. Controls are exact-parent resolution, focused
tests, typechecks, full applicable checks, two independent review axes, and
staged/committed workflow CI. Rollback is an ordinary revert of the integration
or PR merge commit; no data migration is involved.
