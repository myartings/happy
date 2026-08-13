# Context: `studio-todo-row-v2-04`

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

- Goal: implement only the user-approved packaged-desktop Studio Todo utility
  row density, then build/install Happy (dev) and stop for review.
- Visible contract: retain the component's existing 36 pt height, 10 pt radius,
  hairline, and 16 pt outer inset; use 12 pt horizontal content padding, 4 pt
  icon/label/count gap, and no shadow/elevation in Studio.
- Preserve: Todo count/data/feature flag/navigation/pressed state/accessibility,
  all other Todo instances, top controls, session/project UI, Settings, sidebar
  frame, main content, Default, standalone web, iOS, and Android.
- Host scope: Studio-owned pure metrics, one optional presentation prop on the
  shared Todo component, and one SidebarView instance seam.
- Stop condition: present the real installed desktop result and await explicit
  user acceptance before any fifth slice.

- Remove irrelevant placeholders.
- Add feature-specific source and test files to the appropriate role manifest.
