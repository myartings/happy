# Context: `studio-overlays-pages`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.
- Exclusive write scope is the Studio overlay feature module, `FloatingOverlay`,
  `SessionActionsPopover`, and Command Palette files.
- `studioVisualStyle.ts` is a read-only parent contract.
- `PermissionModeSelector`, every `AgentInput*`, sidebar component, conversation
  component, `MarkdownView`, and `MessageView` are blocked to prevent parallel
  branch conflicts.

## Verification context

- See `contexts/check.jsonl`.
- Verify pure presentation/placement behavior first, then Happy App typecheck,
  workflow audit, and whole-diff review.

## Batch and integration ownership

- Parent session owns merge order, packaged build, screenshots, and human visual
  acceptance.
- This child may commit locally but must not push or merge.
- Stop rather than crossing ownership if a shared theme token, host navigation,
  or blocked component becomes necessary.
