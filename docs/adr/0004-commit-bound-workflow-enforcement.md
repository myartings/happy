# ADR 0004: Bind completed workflow evidence to the submitted diff

## Status

Accepted on 2026-08-06.

## Context

`workflow-audit.py --strict` intentionally accepts an empty active pointer after
completed work is archived. That verifies repository health but cannot prove a
new submission followed the lifecycle. Requiring an active workflow in CI is
also incorrect because successful archive clears `ACTIVE.md`.

Committing before archive leaves the lifecycle evidence outside the
implementation commit. Recording that older HEAD in the archive would falsely
attribute uncommitted work; embedding the new commit hash in the same commit is
self-referential.

## Decision

CI validates the submitted Git range. The latest archive row must be added by
that range, its workflow must be fully complete, and its machine state,
validation, and finish evidence must change in the same range. An active
workflow fails CI. The completed workflow must already be in immutable
`archived` phase, and its `resultCommit` must match the archive index row.

Local completion validates the Git index snapshot using this order:

```text
finish gate -> archive with commit=pending -> stage complete change
-> workflow-ci --staged -> authorized commit
```

`pending` is valid for the self-containing commit because same-diff enforcement
binds archive and completion evidence atomically. A supplied invalid non-zero
base fails closed rather than silently narrowing the inspected range.

## Consequences

- New submissions cannot reuse a stale archive or omit completion evidence.
- Correctly archived repositories retain an empty active pointer.
- Unstaged working-tree content cannot validate or poison the staged candidate.
- The pushed or PR range is one delivery unit; intermediate local commits are not
  independently proven.
- Hosted enforcement runs on branch pushes and pull requests, not tag creation;
  tag events also report a zero `before` and cannot be safely distinguished from
  a first branch push by the checker input alone.
- Generated projects inherit the checker, tests, CI, and finish ordering.
- The downstream sync allowlist distributes the complete enforcement surface
  while preserving project-local configuration and workflow state.
- A submitted diff may retain an unrelated active workflow only when the ACTIVE
  pointer is unchanged by that diff and the referenced non-terminal workflow is
  valid. Creating a nested or isolated workflow records the previous ACTIVE
  entry; terminal archive restores it instead of unconditionally clearing
  unrelated resumable work.

## Evidence

UI Flashcards implemented the design in commit `9ad3572`. Its hosted workflow
completed successfully in GitHub Actions run `31103581785`; independent review
also verified index/worktree divergence behavior.

## Rollback

Revert the checker, CI invocation, configured checks, finish ordering, and this
ADR together. Do not leave generated projects or GitHub Actions calling a removed
checker.
