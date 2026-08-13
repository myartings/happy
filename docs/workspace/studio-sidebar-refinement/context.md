# Context: `studio-sidebar-refinement`

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

- Visual contract: `docs/design/studio-main-window-v2.pen` and its PNG/brief.
- Existing implementation contract: `docs/specs/codex-visual-theme.md`.
- Baseline capture is private evidence at
  `/Users/myartings/Sync/tmp/happy-studio-parallel-2026-08-13/sidebar-before.png`.
- Implementation is limited to Track A sidebar-owned files.
