# Context: `studio-sidebar-unboxed-rows-followup`

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

- Failed reproduction:
  `/Users/myartings/Sync/tmp/happy-studio-parallel-2026-08-13/revision-2/sidebar-unboxed.png`
  at 1470×875 points, 2×, macOS light appearance.
- Observed: the outer group edit landed, but ordinary child rows remain a
  contiguous white block with outer radii and separators.
- Root cause: `SidebarNavigator` resolves the Studio frame and gives it to
  `SidebarView`, but `MainView` does not pass that resolved style to
  `SessionsList`; the list independently re-resolves from runtime/local inputs.
  The row components also compose default surface/position styles before
  applying Studio overrides.
- This isolated writer owns sidebar visual-style propagation, row-chrome policy,
  both sidebar row renderers, focused tests, and this workflow only. Conversation,
  composer, semantic, overlays, and parent integration files are blocked.
- Parent owns cherry-pick, integrated build, capture, and visual acceptance.
