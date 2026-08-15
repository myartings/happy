# Context: `studio-panel-resize-joint-projection`

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

- Incremental integration-review fix on `feature/studio-panel-resize`, based on
  `d1a040bd`.
- Observed defect: at window 1200 with stored left 420/right 520 and both
  visible, independent host projection yields actual 220/280 and wastes 100pt;
  double-click reset can remain pinned at a side minimum.
- Scope is the shared panel projection policy/tests and the minimum existing
  left/right host and handle seams. Studio Tauri-only activation, device-local
  persistence, and collapse/reopen semantics remain unchanged.
