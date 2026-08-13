# Child Batch Plan: Studio Overlays and Menus

## Assignment

- Branch: `feature/studio-overlays-pages`
- Worktree: `/Users/myartings/workspace/happy/.dev/worktree/studio-overlays-pages`
- Writer: isolated Track E child agent
- Parent: Studio UI integration session

## Allowed files

- `packages/happy-app/sources/features/studio-overlays/**`
- `packages/happy-app/sources/components/FloatingOverlay.tsx`
- `packages/happy-app/sources/components/AnimatedOverlay.tsx`
- `packages/happy-app/sources/components/SessionActionsPopover.tsx`
- `packages/happy-app/sources/components/CommandPalette/**`
- this task's spec, tasks, and workflow evidence

## Blocked files

- `packages/happy-app/sources/features/studio-visual-style/studioVisualStyle.ts`
- `packages/happy-app/sources/components/PermissionModeSelector.tsx`
- every `AgentInput*`, `Sidebar*`, `SessionView`, `ChatList`, `ChatHeaderView`,
  `MarkdownView`, and `MessageView` file
- shared theme registration, route/navigation hosts, protocol, persistence, and
  native platform projects

## Stop conditions

- A required change crosses a blocked or protected file.
- Existing positioning or keyboard behavior cannot be preserved by the regional seam.
- A test reveals an unrelated behavioral defect requiring wider scope.
- Final modal geometry would require inventing unsupported Codex evidence.

## Validation and return contract

- Focused Vitest for the pure overlay resolver and placement helper.
- `pnpm --filter happy-app typecheck`.
- Current Happy workflow audit/check and whole-diff review.
- Return local commit hash, exact commands, known screenshot gap, and suggested
  packaged states. Do not push, merge, or claim visual acceptance.
