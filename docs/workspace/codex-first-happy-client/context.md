# Context: `codex-first-happy-client`

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

- This workflow supersedes the product direction of the archived
  `codex-visual-theme` and Studio theme workflows. Those records remain useful
  implementation and visual evidence, but their "visual reference only" and
  "preserve Happy macro layout" decisions are not authoritative here.
- Current product intent and accepted decisions live in `docs/PRD.md` and
  `decisions.md`.
- Primary historical evidence includes `docs/specs/codex-visual-theme.md`,
  `docs/tasks/codex-visual-theme-tasks.md`, `docs/design/studio-main-window-v2.png`,
  and the existing `packages/happy-app/sources/features/studio-*` modules.
- Fresh current Codex and Happy macOS runtime evidence is required before the
  feature specification can claim visual or interaction parity.
- Add feature-specific source and test files to the role manifests only after
  the implementation boundary is accepted.
