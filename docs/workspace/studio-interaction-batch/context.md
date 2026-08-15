# Context: `studio-interaction-batch`

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

- Accepted predecessor is local `dev` at `f6617997`, containing the user-accepted
  Studio integration merge `80d3f10f`.
- The user authorized the proposed next batch: tool presentation, Composer
  states, and desktop dark/hover/focus/keyboard states.
- Packaged screenshot acceptance remains parent-owned; child tests are entry
  conditions for integration, not visual approval.
