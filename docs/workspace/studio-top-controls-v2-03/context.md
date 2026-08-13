# Context: `studio-top-controls-v2-03`

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

- Goal: implement only the user-approved packaged-desktop Studio New Session /
  archive control geometry, then build/install Happy (dev) and stop for review.
- Visible contract: 38 pt primary control, 38×38 pt archive control, 10 pt
  radius, one light hairline, no shadow, and tighter internal/group gaps.
- Preserve: Todo, session/project content, Settings, sidebar frame, main content,
  all button behavior, archive state, keyboard shortcuts, Default, standalone
  web, iOS, and Android.
- Host scope: one Studio-owned pure resolver and one conditional SidebarView
  presentation seam.
- Stop condition: present the real installed desktop result and await explicit
  user acceptance before any fourth slice.

- Remove irrelevant placeholders.
- Add feature-specific source and test files to the appropriate role manifest.
