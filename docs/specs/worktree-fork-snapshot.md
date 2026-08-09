# Worktree Fork Snapshot

## Goal

Add an explicit `Fork in independent Worktree` action to eligible Claude and
Codex sessions. The action creates a sibling managed Git worktree, optionally
inherits the source checkout's staged, unstaged, deleted, renamed, and
non-ignored untracked state, forks the provider conversation into that
directory, and starts an independent Happy session.

## User experience

- Keep the existing `Fork session` action unchanged and directory-sharing.
- Add a separate `Fork in independent Worktree` action next to it.
- Keep side chats directory-sharing and hidden from the top-level session list.
- When the source checkout is dirty, show a confirmation sheet containing the
  base branch/commit, staged count, unstaged count, untracked count/size, and a
  notice that ignored files are excluded.
- Offer `Include current changes and fork`, `Fork from HEAD only`, and `Cancel`.
- When the source is clean, create the independent worktree without presenting
  a misleading dirty-state summary.

## Snapshot semantics

- The source checkout must remain byte-for-byte and index-for-index unchanged.
- The target branch starts at the source checkout's current HEAD.
- In snapshot mode, staged changes remain staged, unstaged changes remain
  unstaged, deletions and renames remain equivalent, and non-ignored untracked
  files remain untracked.
- Ignored files, nested repositories, dirty submodules, conflicted indexes,
  sparse checkouts, and in-progress Git operations are not inherited in the
  first release. Unsupported states fail closed with an actionable message.
- A source already inside a Happy-managed worktree creates a sibling under the
  primary repository's `.dev/worktree` directory, never a nested worktree.
- The snapshot must be revalidated before success. If the source changes while
  copying, the operation fails and removes its newly-created worktree and
  branch.

## Provider semantics

- Codex forks the source thread with the target worktree as its cwd.
- Claude copies the source transcript into the target directory's Claude
  project storage before resuming the new transcript ID.
- Both providers retain Happy parent-session lineage and navigate to the new
  session only after the new session is visible to sync.

## Failure and cleanup

- Worktree creation, snapshot copying, provider forking, and Happy session
  spawning form one orchestration. Failure before spawn success triggers
  best-effort cleanup of artifacts created by that orchestration.
- Cleanup is restricted to paths and branch names returned by the machine-side
  operation; callers never synthesize destructive targets.
- Existing archive cleanup remains conservative: dirty worktrees are retained,
  and clean worktrees are removed only after confirmation.

## Acceptance criteria

1. Existing normal fork and side-chat behavior is unchanged.
2. The independent action is available only for online, non-Rig, forkable
   Claude/Codex sessions with the resume experiment enabled.
3. Clean and dirty repositories create sibling managed worktrees at source HEAD.
4. Dirty snapshot mode preserves staged, unstaged, deleted, renamed, binary,
   symlink where supported, and non-ignored untracked state without mutating the
   source checkout.
5. Ignored files are excluded and unsupported Git states fail closed.
6. Claude and Codex continue with inherited conversation context in the target
   worktree.
7. Any pre-spawn failure does not leave a half-created managed worktree or
   branch.
8. Targeted tests, app/CLI typechecks, applicable full suites, strict workflow
   audit, and staged workflow CI pass.

