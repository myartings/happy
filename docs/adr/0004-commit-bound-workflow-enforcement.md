# ADR 0004: Bind completed workflow evidence to the submitted diff

## Status

Superseded for current work by ADR 0007 on 2026-09-05. Historical delivery
evidence remains passive. Previously accepted on 2026-08-06 and amended by ADR 0006 on 2026-08-19 so no-task delivery
needs no lifecycle receipt, amended on 2026-08-24 by Issue #50 for the historical
two-commit protocol, and prospectively amended on 2026-08-29 by Issue #88 for
one atomic archived delivery commit. Issue #116 prospectively extends that
atomic boundary to one accepted integration Workspace delivered by its normal
two-parent merge commit.

## Context

The historical single-task `workflow-audit.py --strict` intentionally accepted
an empty active pointer after completed work was archived. Repository-wide
health now uses `workflow-audit.py --all --strict`, which validates every
Workspace plus ACTIVE/archive consistency, but it still cannot prove a new
submission followed the lifecycle. Requiring an active workflow in CI is
also incorrect because successful archive clears `ACTIVE.md`.

Embedding a future commit hash in its own archive row is self-referential, while
using `pending` leaves terminal provenance ambiguous. Issue #50 addressed that
with two commits. Issue #88 retains the safety invariant without duplicating
Git identity: the result is the submitted-branch commit that first introduces
the append-only archive row.

## Decision

CI validates the submitted Git range through exactly one route. Formal delivery
adds the latest archive row and complete terminal evidence. Micro delivery adds
exactly one append-only receipt bound to the same eligible path set, diff
fingerprint, configured commands, and empty formal-active state. Mixing routes
fails closed.

Prospective local completion validates one combined Git index snapshot using
this order:

```text
finish gate -> stage checked/reviewed work candidate -> workflow-ci --staged
-> generate deterministic terminal archive projection
-> stage combined archived delivery -> workflow-ci --staged
-> one authorized delivery commit
```

The pre-archive candidate remains in `finish` phase and contains no terminal
metadata or archive mutation. Archive accepts only the exact staged candidate
that matches structured check and final review evidence, then writes the
canonical terminal projection. Combined staged CI revalidates the engineering
candidate and terminal state/row/ACTIVE synchronization. A supplied invalid
non-zero base fails closed rather than silently narrowing the inspected range.

In a pending normal two-parent integration, exactly one new accepted Workspace
may supply the current check/review/finish evidence. Its identity is structural:
the sole Workspace absent from both parents and named by canonical ACTIVE before
archive or by the sole row beyond the exact parent-row union afterward. Every
inherited lifecycle Git entry remains unchanged. The merge commit itself first
introduces the row, and committed-range validation requires the exact target
merge parent rather than an arbitrary common ancestor.

## Consequences

- New submissions cannot reuse a stale archive or omit completion evidence.
- Correctly archived repositories retain an empty active pointer.
- Unstaged working-tree content cannot validate or poison the staged candidate.
- One authorized delivery commit contains both work and terminal evidence; its
  result identity is derived from Git history rather than embedded in content.
- The passed finish gate content-addresses the complete pre-archive Workspace
  and normalized state as `prearchive-workspace-v1`; terminal generation and CI
  allow only the canonical archive-owned delta from that snapshot.
- Staged CI is necessary but not sufficient before a later push: the operator
  fetches the exact target branch and runs committed-range workflow CI against
  that remote ref. Multiple independently completed deliveries are published
  chronologically as separate fast-forward pushes, not combined by a merge
  commit into one hosted submission.
- Remote divergence never authorizes rebasing provenance-bound commits or
  force-pushing history. When it cannot be resolved while preserving one
  delivery per outgoing range, a separately accepted integration workflow is
  required.
- Hosted enforcement runs on branch pushes and pull requests, not tag creation;
  tag events also report a zero `before` and cannot be safely distinguished from
  a first branch push by the checker input alone.
- Generated projects inherit the checker, tests, CI, and finish ordering.
- A normal two-parent integration needs no lifecycle-only child commit when its
  one new integration Workspace and terminal row satisfy the same candidate,
  review, finish, retry, and outgoing-range proof.
- The downstream sync allowlist distributes the complete enforcement surface
  while preserving project-local configuration and workflow state.
- A terminal archived candidate must contain exactly the canonical empty
  ACTIVE projection or the child Workspace's recorded `previousActive`
  projection refreshed from that unchanged Workspace state. Any other active
  pointer or field mutation blocks the delivery commit.
- Terminal state stores the archive calendar date separately from the UTC event
  timestamp. This keeps archive/state comparison deterministic across host
  timezones; legacy states without the field remain readable until reconciled.
- This amendment governs future completion only. It adds no historical recovery
  or reinterpretation of earlier full-SHA or `pending` rows; Issue #50
  deliveries remain valid historical evidence.

## Evidence

UI Flashcards implemented the design in commit `9ad3572`. Its hosted workflow
completed successfully in GitHub Actions run `31103581785`; independent review
also verified index/worktree divergence behavior.

## Rollback

Revert the checker, CI invocation, configured checks, finish ordering, and this
ADR together. Do not leave generated projects or GitHub Actions calling a removed
checker. Before this amendment is delivered, its prospective optimization
reconciliation may be reverted with the rest of the candidate. After delivery,
preserve that immutable event and roll the optimization state back through a
new digest-bound reconciliation that explicitly supersedes or amends it.
