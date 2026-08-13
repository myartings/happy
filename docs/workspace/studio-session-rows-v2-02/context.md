# Context: `studio-session-rows-v2-02`

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

- Goal: implement only the user-approved packaged-desktop Studio session-row
  family, then build/install Happy (dev) and stop for human acceptance.
- Visible contract: 62 pt rich rows, preserved information, transparent ordinary
  rows, and a fill-only `#E8EAEA` selected row with 9 pt radius.
- Preserve: project/header controls, session grouping/order/data/actions,
  navigation, Default, standalone web, iOS, Android, and all main-content UI.
- Host scope: Studio-owned pure row resolver plus narrow conditional styling in
  `ActiveSessionsGroupCompact`, `ProjectGroup`, and the legacy `SessionsList`
  row renderer so every sidebar session-row path remains visually coherent.
- Stop condition: real installed client is ready for user review; no third
  visual slice may start before explicit acceptance.

- Remove irrelevant placeholders.
- Add feature-specific source and test files to the appropriate role manifest.
