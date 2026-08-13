# Context: `studio-session-alignment-v2-06`

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

- Goal: implement only the approved packaged-desktop Studio session-content
  left alignment, then build/install Happy (dev) and stop for review.
- Visible contract: 10 pt status slot, 6 pt status/title gap, and 16 pt aligned
  metadata inset, moving title and every metadata variant left by 8 pt.
- Preserve all status semantics, content, badges, row geometry, interaction,
  list behavior, accepted adjacent UI, Default, standalone web, iOS, and Android.
- Host scope: extend the Studio session-row metrics, one compact-row activation
  seam, and optional metadata-row style props used only by that Studio seam.
- Stop condition: present the installed desktop result and await explicit user
  acceptance before any seventh slice.
