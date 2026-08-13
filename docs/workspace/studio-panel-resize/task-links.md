# Task Links: `studio-panel-resize`

- Task list: `docs/tasks/studio-visual-convergence-tasks.md` Track A
- Parent workflow: `docs/workspace/studio-visual-convergence/` (read-only here)
- Tracker item: local-only child because the parent batch coordinates immediate
  integration and user acceptance; no delayed pickup or remote PR delivery.
- Pull request: none
- Branch/worktree: `feature/studio-panel-resize` /
  `/Users/myartings/workspace/happy/.dev/worktree/studio-panel-resize`

## Batch-plan boundary

- Allowed product writes: new `packages/happy-app/sources/features/studio-panel-resize/**`,
  `packages/happy-app/sources/components/SidebarNavigator.tsx`,
  `packages/happy-app/sources/-session/SessionView.tsx`, and minimum
  `packages/happy-app/sources/sync/localSettings.ts` plus its tests.
- Blocked: concrete sidebar presentation, Markdown, MessageView, AgentInput,
  tools, overlays, protocol, backend, parent workflow files, and shared spec/tasks.
- Stop conditions: required behavior needs a blocked file, a risk trigger appears,
  the shared base differs, or deterministic verification repeatedly fails.
- Return contract: one archived local commit, exact file/test list, and visual
  uncertainties; no push or merge.
