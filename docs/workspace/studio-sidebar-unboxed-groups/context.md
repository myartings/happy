# Context: `studio-sidebar-unboxed-groups`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Notes

- Accepted visual evidence:
  `/Users/myartings/Sync/tmp/happy-studio-parallel-2026-08-13/integration-conversation.png`.
- The visible defect is a large white/card shell around sidebar groups. Studio
  should render a lightweight unboxed list; selected-row fill remains intact.
- This delegated writer owns only the isolated `feature/studio-sidebar`
  worktree and sidebar group presentation files. Conversation, composer,
  semantic, overlay, and `studio-ui-parallel-integration` workflow files are
  blocked.
- Parent owns cherry-pick order, packaged build, screenshot capture, and visual
  acceptance.
