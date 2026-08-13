# Context: `studio-sidebar-frame-v2-01`

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

- Goal: implement only the accepted v2 desktop Studio activation seam and
  sidebar frame, then build/capture Happy (dev) for human review.
- Product scope: packaged desktop runtime, 316 pt sidebar at 1470 pt window,
  near-white Region, white Canvas, one hairline divider.
- Preserve: every sidebar child, session-row geometry/content, navigation and
  behavior; standalone web and mobile remain Default.
- Activation: persist `visualStyle` device-locally; use an explicit development
  environment override for this review build instead of adding settings UI.
- Stop condition: present the real packaged-desktop capture and wait for user
  acceptance before any second visual change.
