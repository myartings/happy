# Context: `studio-period-separator-v2-07`

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

- Goal: remove only the packaged-desktop Studio full-width boundary beneath
  active period groups, then build/install Happy (dev) and stop for review.
- Current evidence: the accepted v2-06 screenshot contains a one-pixel
  `#dcdcdc` rule across the full 440 px sidebar at the bottom of the “Active
  today” group; source audit shows Studio already disables row borders, leaving
  the web group-card shadow as the relevant presentation seam.
- Preserve period headings and spacing, all session rows and behavior, accepted
  adjacent UI, Default, standalone web, iOS, and Android.
- Host scope: one Studio session-list group-shell style metric and its existing
  `ActiveSessionsGroupCompact` activation seam.
- Stop condition: present the installed desktop result and await explicit user
  acceptance before any eighth slice.
