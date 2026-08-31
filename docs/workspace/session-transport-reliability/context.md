# Context: `session-transport-reliability`

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

- Goal: harden non-UI session transport across CLI/server/wire.
- Forbidden: happy-app, Studio, theme, and visual files.
- Canonical contract: `docs/specs/session-transport-reliability.md`.
