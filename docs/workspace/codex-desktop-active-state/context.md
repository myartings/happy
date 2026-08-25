# Context: `codex-desktop-active-state`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Parse persisted task lifecycle messages in one compatibility helper and use
  it from Desktop sync before applying a session update.

## Verification context

- Prove modern and legacy lifecycle shapes, unrelated-message neutrality, and
  Happy App type safety.

## Notes

- Live evidence from session `cmt8ontnxikh6zc0unf7ny533` showed Codex emitted
  `task_started` and retained `thinking=true` while Desktop could report idle.
- The CLI persists modern lifecycle envelopes as `{ role: "session", content:
  { ev: { t: "turn-start" | "turn-end" } } }`, while Desktop currently reads
  only `content.data.ev.t`.
