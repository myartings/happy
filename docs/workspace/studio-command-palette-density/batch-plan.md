# Child Batch Plan: Studio Command Palette Density

## Assignment

- Branch: `feature/studio-overlays-pages`
- Worktree: `/Users/myartings/workspace/happy/.dev/worktree/studio-overlays-pages`
- Writer: isolated `palette_density` child agent
- Parent: Studio UI integration session

## Allowed files

- `packages/happy-app/sources/features/studio-overlays/**`
- `packages/happy-app/sources/components/CommandPalette/**`
- this task's spec, tasks, and workflow evidence

## Blocked files

- every non-Command-Palette component, including other overlays
- `packages/happy-app/sources/features/studio-visual-style/**`
- sidebar, conversation, composer, semantic-text, route/navigation, protocol,
  persistence, shared theme registration, and native platform projects
- parent integration workflow evidence

## Dependency and integration order

1. This child adds Studio-only metrics to the existing overlay resolver.
2. Palette components consume those metrics without changing public behavior.
3. Parent cherry-picks the single returned commit after its parallel sidebar
   revision, then owns build, screenshot, and visual acceptance.

No concurrent child owns the allowed product files above.

## Stop conditions

- The change requires a blocked or protected file.
- Existing keyboard, search, selection, or close behavior cannot be preserved.
- A test reveals an unrelated defect requiring wider scope.
- Exact modal parity would require inventing absent Codex evidence.

## Return contract

- Focused resolver and component-wiring Vitest.
- Happy App typecheck and current Happy workflow checks.
- Whole-diff review.
- One local commit, no push or merge, with visual uncertainty reported.
