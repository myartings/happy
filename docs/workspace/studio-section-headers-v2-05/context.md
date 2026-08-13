# Context: `studio-section-headers-v2-05`

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

- Goal: implement only the user-approved packaged-desktop Studio first-level
  session-list header density, then build/install Happy (dev) and stop for review.
- Visible contract: 12 pt text, 16 pt line height, medium-equivalent 500 weight,
  18 pt horizontal padding, 14 pt top padding, and 6 pt bottom padding.
- Apply consistently to existing today, earlier, needs-attention, history/archive,
  and projects headings without introducing a new overflow action.
- Preserve: all strings, list data/order/visibility/search/scroll/virtualization,
  project and session rendering, accepted sidebar controls/rows, Settings, main
  content, Default, standalone web, iOS, and Android.
- Host scope: one Studio-owned pure metrics resolver and one SessionsList style
  activation seam using the already resolved desktop-only Studio boundary.
- Stop condition: present the real installed desktop result and await explicit
  user acceptance before any sixth slice.
