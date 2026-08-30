# Task Links: `workflow-candidate-bound-accepted-gaps`

- Delivery slice: `docs/specs/workflow-candidate-bound-accepted-gaps.md`
- Delivery source: approved local-only — A schema-3 staged check with explicit baseline failures cannot retain a candidate binding, so review and archive reject an otherwise fully structured run. (approval: User selected a separate workflow-gap repair in this session.)
- Acceptance slice: acceptance criteria in
  `docs/specs/workflow-candidate-bound-accepted-gaps.md`.
- Blocked by: none for implementation; Windows delivery waits for this
  prerequisite to enter verified `dev`.
- Validation gate: `python scripts/workflow-check.py --applicable --record workflow-candidate-bound-accepted-gaps --staged --base dev` plus strict audit, independent review, and staged workflow CI.
- Task checklist: `docs/tasks/workflow-candidate-bound-accepted-gaps-tasks.md`.
- Pull request: pending; earlier user authorization covers pushing and opening
  a dev PR, but not merging it.
- Branch/worktree: `fix/workflow-candidate-bound-accepted-gaps` in
  `C:\Users\myartings\workspace\happy\.dev\worktree\quiet-cloud`.
