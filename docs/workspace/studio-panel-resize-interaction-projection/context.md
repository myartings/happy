# Context: `studio-panel-resize-interaction-projection`

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

- Incremental fix based on `ebac34eb`.
- Reproduction: window 1200, stored 420/520, rendered 261/339; left +10
  currently stores 271 then neutral projection renders 259/341, while
  ArrowRight can show no effective change.
- Separate persisted target from rendered width and preserve last active side
  so constrained allocation can prioritize the user's adjusted side across
  rerender, collapse/reopen, and restart.
