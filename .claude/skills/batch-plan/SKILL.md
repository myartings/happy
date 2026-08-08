---
name: batch-plan
description: Plan batch, worktree, writer-subagent, dependency, merge, and integration execution. Use for delegated writer work, parallel implementation, multiple ready issues, cross-session execution, or work needing explicit ownership and resource boundaries.
---

# Batch Plan

Use this when isolation or batching is useful. Do not use it for an ordinary
single-slice Feature that can be handled by the main session after `scoping`.
In that case, keep worktree and writer-subagent execution optional.

## Workflow

1. Inventory ready tasks and their accepted contracts.
2. Build a dependency graph and shared-file/conflict map.
3. Put shared schemas, interfaces, configuration, and fixtures in serial Batch 0/1.
4. Parallelize only independent slices with stable boundaries.
5. For each writer child, define branch/worktree, allowed files, blocked files,
   acceptance criteria, validation command, stop conditions, and return contract.
6. Assign read-only research/review roles without write permission when possible.
7. Record children and parent-owned merge order under the workflow folder.
8. Rebase/merge in dependency order; the parent owns integration and final check.

Do not spawn or delegate unless the runtime and user authorize it when
authorization is required. A writer subagent without an isolated worktree is
forbidden. Do not parallelize concurrent edits to the same shared contract.
