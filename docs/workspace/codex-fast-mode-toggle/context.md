# Context: `codex-fast-mode-toggle`

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

- The app already synchronizes permission/model/effort through
  `SessionAgentModesPatch`; Fast extends that contract instead of creating a
  second state channel.
- Codex app-server 0.150.1 exposes `serviceTier` on thread and turn requests.
- The feature is capability gated so old Happy CLIs cannot present a false
  active state.
