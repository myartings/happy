# Context: `studio-composer`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Goal

Deliver the first isolated Studio composer batch: a centered 800 pt maximum,
approximately 110 pt elevated shell with compact internal controls, attachment
previews, and autocomplete geometry. Preserve all Happy functionality and all
non-Tauri/Default/mobile visuals.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Ownership boundary

- Product writes are limited to the four `AgentInput*` files named in the spec
  and the new `features/studio-composer/**` module.
- `features/studio-visual-style/studioVisualStyle.ts` is a read-only dependency.
- Overlays and permission selectors belong to the parallel overlays track.
- Conversation, semantic text, and sidebar files belong to other parallel tracks.

## Human gate

This branch may prove deterministic correctness, but the user alone accepts the
integrated packaged-desktop screenshot.
