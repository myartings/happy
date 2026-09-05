# ADR 0007: Adopt the upstream-native Task and Matt workflow

## Status

Accepted on 2026-09-05. Supersedes ADR 0003, ADR 0004, ADR 0005, and ADR 0006
for current work. Their committed Workspace records remain passive historical
evidence.

## Context

Happy's workflow-2026.09.2 adapter maintained a separate Workspace lifecycle,
machine phase transitions, candidate packages, review receipts, and terminal
archives. Upstream workflow-2026.09.3 replaces that runtime with one Task File
per fresh-Session slice, linked GitHub Issues, Matt engineering Skills, one
configured final suite, and one complete-diff two-axis review.

Keeping the old runtime would make Happy claim adoption while preserving a
second execution owner that the selected release intentionally retired.

## Decision

Happy selectively adopts `workflow-2026.09.3` at
`9755588c041287acb4fd4b295528116de6a62d7b`.

- Immediate bounded work stays Task-less in the current Session.
- Fresh-Session work uses exactly one Task File and one GitHub Issue per slice,
  with an ordinary Git branch/worktree prepared before Happy launch.
- Current work uses Matt `implement`, configured command groups, and one
  parallel Spec/Standards `code-review` pair fixed to Sol Medium.
- Historical `docs/workspace/` records are passive. No current tool or Skill
  creates, appends, or consumes lifecycle state, receipts, or archives.
- Happy preserves its branch model, tracker target, product commands, protected
  native paths, devtools, operational Skills, CI/release behavior, and frozen
  Claude compatibility tree.
- Upstream adoption remains exact-release, allowlisted, and dry-run-first through
  Happy's schema-2 manifest.

## Consequences

The active workflow has one execution vocabulary and substantially less
repository ceremony. Old lifecycle Skills, hooks, scaffolds, and state/review
runtimes are removed. Existing historical Workspaces remain unchanged and
readable as Git history, but they have no authority over current work.

Happy retains a narrow compatibility validator and command names required by
Issue #111. They validate the current adoption boundary and must not recreate a
Workspace lifecycle.

## Reversal

Reverting this ADR and the scoped adoption commit restores the prior adapter.
Do not partially restore retired lifecycle assets; any future workflow change
must select one coherent execution owner and preserve Happy's downstream
boundaries.
