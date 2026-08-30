# Journal: `codex-fast-mode-toggle`

## `2026-08-30`

- Started workflow.
- Classified as a feature with a required session-protocol risk gate.
- Confirmed Codex 0.150.1 generated protocol accepts `serviceTier` on
  `thread/start`, `thread/resume`, `thread/fork`, and `turn/start`.
- Chose a synced per-session direct composer toggle with capability and model
  gating; no global `config.toml` mutation.
- Implemented the app/CLI contract, synced selection, accessible composer
  controls, model normalization, per-message reassertion, and app-server
  `turn/start.serviceTier` transport.
- Focused app/CLI tests, both changed-package typechecks, the complete Happy CLI
  unit suite (873 tests), server checks, and workflow checks passed.
- The complete app suite retained 15 failures in four unmodified Studio
  rich-text/tool-presentation files; recorded as an unrelated verification gap.
