# Sidebar Unboxed Writer — 2026-08-13

## Assignment

- Remove Studio's large group/card shell while preserving functional layout.
- Work only in the isolated sidebar worktree and sidebar-owned product files.
- Do not touch conversation, composer, semantic, overlay, or shared integration
  workflow files.

## Batch plan

- Batch 0: accepted spec, tasks, ownership, and test seam.
- Batch 1: pure presentation decision, then both group renderer consumers.
- Batch 2: focused verification, whole-diff review, archive, local commit.
- Parent dependency: cherry-pick after this commit, then build/capture/user review.

## Stop conditions

- Stop if the change requires navigation/data/callback changes, protected paths,
  or shared integration files.
- Stop on an unexpected focused-test failure and diagnose before widening scope.

## Return contract

- One clean local commit with exact changed files, deterministic verification,
  and explicit visual uncertainty for parent/user review.

## Outcome

- Added the shared card/unboxed policy and wired both sidebar group renderers.
- Studio now skips the default card container entirely; Default and non-Tauri
  retain it.
- Focused 17/17 and complete Happy App 1116/1116 tests pass; typecheck and
  workflow validation pass.
- Whole-diff review found no blocking issue.

## Remaining uncertainty

- Automated tests cannot prove perceived visual weight. Parent must integrate,
  reproduce the same sidebar state, capture the packaged client, and return it
  for explicit user acceptance.
