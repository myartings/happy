# Task Links: `windows-native-reliability`

- Task list: `docs/tasks/windows-native-reliability-tasks.md`
- Delivery source: approved local-only — Windows-native reliability Goal requested for deterministic non-destructive validation and Windows-only compatibility fixes (approval: User explicitly requested this Goal, then authorized an atomic commit and publication as a PR targeting dev)
- Acceptance slice: `docs/specs/windows-native-reliability.md` AC1–AC14.
- Blocked by: none.
- Validation gate: Windows PowerShell 5.1/7 smoke twice, doctor, non-installing desktop build/artifacts, scoped package tests/typechecks, system/repository invariants, workflow checks, staged CI, and outgoing-range CI.
- Task checklist: `docs/tasks/windows-native-reliability-tasks.md`.
- Pull request: pending creation against `dev` after the authorized delivery commit passes outgoing-range CI.
- Branch/worktree: `feature/windows-native-reliability` at
  `C:\Users\myartings\workspace\happy\.dev\worktree\quiet-cloud`, created from
  validated `dev`, then restored on local and `origin/dev` commit
  `cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a` after prerequisite PR `#68`.
