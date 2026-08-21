# Official baseline workflow implementation

- Goal: create the project-local official macOS release Skill and complete the
  macOS `happyctl` workflow.
- Branch: `feature/happy-desktop-official-release`.
- Worktree: `.dev/worktree/happy-desktop-official-release`.
- Outcome: implementation and focused verification complete; local commit and
  integration authorized on 2026-08-22.
- Main safety decisions: validated `main` source, detached baseline worktree,
  separate app identity, stable signing, no pushes/public release, and
  fail-closed handling of dirty baseline state.
- Remaining operational step: inspect or replace the pre-existing dirty runtime
  baseline worktree before a real build/install.
