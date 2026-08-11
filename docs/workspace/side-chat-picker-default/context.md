# Context: `side-chat-picker-default`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- The quick-panel open/collapse decision lives in
  `packages/happy-app/sources/utils/sideChatQuickPanel.ts`.
- Session-local picker visibility and sidebar actions live in
  `packages/happy-app/sources/-session/SessionView.tsx`.
- The existing official picker is the `activePanel === null` branch in
  `packages/happy-app/sources/components/FilesSidebar.tsx`.

## Verification context

- Decision and layout regression coverage lives in
  `packages/happy-app/sources/utils/sideChatQuickPanel.test.ts`.

## Notes

- Keep session creation behind the existing picker action; opening the quick
  sidebar must not call `spawnSideChat`.
- Scope is device-local desktop/web presentation only. Session protocol,
  persistence, daemon, server, and mobile behavior are unchanged.
