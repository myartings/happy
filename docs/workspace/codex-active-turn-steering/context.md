# Context: `codex-active-turn-steering`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Codex app-server types and client request lifecycle.
- Codex inbound user-message routing and existing queue fallback.
- Focused client and routing tests.

## Verification context

- Accepted feature specification and task list.
- Complete changed diff and workflow validation evidence.

## Notes

- The Happy wire protocol and application composer are intentionally unchanged.
- Codex 0.148.0 exposes stable `turn/steer`; older app-server versions degrade
  to the existing queue behavior.
