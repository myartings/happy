# Decisions: `studio-overlays-pages`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which surfaces belong in the first batch? | resolved | Shared `FloatingOverlay`, Session actions, and Command Palette are isolated shell-level consumers with stable ownership. Subpages and question sheets remain later work. |
| D2 | How is Studio gated? | resolved | Reuse the existing visual-style resolver as a read-only contract; require Tauri plus resolved `studio`, including the existing preview override. |
| D3 | How should L5 surfaces look? | resolved | Apply the evidence-backed shared family: near-opaque surface, neutral hairline, candidate radius `17`, and broad `0 8 24` neutral shadow. |
| D4 | Should non-blocking popovers dim the app? | resolved | No for Studio. The visual spec explicitly requires an invisible click-away layer for L5. Default behavior remains unchanged. |
| D5 | How should Command Palette be treated without matched modal evidence? | resolved | Make colors theme-aware and use a restrained, separately modeled provisional L6 candidate. Preserve the explicit evidence gap and require user screenshot acceptance. |
| D6 | Does this need a risk gate? | resolved | No configured risk trigger applies: this is local conditional presentation with no auth, permission, protocol, persistence, privacy, migration, deployment, destructive action, or sync change. |
| D7 | How is parallel ownership enforced? | resolved | Do not touch composer, Permission selector, sidebar, conversation, semantic text, shared visual-style contract, routes, or global theme tokens. Parent owns integration. |
