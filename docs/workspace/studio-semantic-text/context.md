# Context: `studio-semantic-text`

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

- Goal: make packaged Happy Desktop conversation text approach Codex's visual
  clarity through Studio-only semantic roles while preserving message content
  and interaction behavior.
- Accepted scope: Markdown heading/emphasis/link/inline-code hierarchy,
  structured command/path/status/tool colors, and a bounded ANSI SGR display
  parser. ANSI support is presentation-only: cursor movement, erase commands,
  OSC, and other terminal controls stay inert or are stripped.
- Platform boundary: macOS and Windows Tauri clients only. iOS, Android, and
  standalone browser Web are not acceptance targets and must retain Default.
- Codex is the primary visual reference; Otty is historical supporting evidence. Final
  acceptance requires the repository's desktop visual-match loop, not color
  values chosen without screenshots.
- Parallel boundary: this branch is based on `dev` at `a99c6328` and may proceed
  with a self-contained semantic-role model, pure ANSI SGR parser, adversarial
  tests, and deterministic fixtures. These pieces must not import unfinished
  Studio modules or edit files owned by `feature/codex-visual-theme`.
- The Studio checkpoint is integrated from `dev` at `fb26bb46`. T5 may proceed,
  but only inside the parallel ownership boundary: semantic-text, Markdown,
  MessageView, and tool text components; do not edit Sidebar,
  ChatList/SessionView layout, AgentInput, or overlay shells.
- T1-T4 were restored after checkpoint integration. The bounded T5 child batch
  now maps Markdown hierarchy, fenced-code presentation, command metadata, and
  agent-event status text in packaged Studio desktop only. Tool shells remain
  untouched for parallel safety; final screenshots and human acceptance belong
  to the parent Studio integration session.
