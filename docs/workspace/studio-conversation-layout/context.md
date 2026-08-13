# Context: `studio-conversation-layout`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Goal

Deliver one screenshot-ready conversation-layout batch from the accepted Studio
v2 design: full-width quiet header plus a centered 800 pt reading measure.

## Ownership boundary

- Product files: `ChatHeaderView.tsx`, `ChatList.tsx`, and
  `features/studio-conversation-layout/**` only.
- `studioVisualStyle.ts` is read-only and may only be imported.
- Do not edit message semantics, composer, sidebar, overlays, menus, settings,
  mobile layout, or the accepted shared visual-theme contracts.

## Reference evidence

- `docs/design/studio-main-window-v2.png`
- `docs/design/studio-main-window-v2-pencil-brief.md`
- `docs/design/system/studio-desktop-adoption.md`

The accepted v2 PNG is authoritative for this batch's updated 54 pt header and
800 pt content measure. Human visual acceptance remains pending after capture.
