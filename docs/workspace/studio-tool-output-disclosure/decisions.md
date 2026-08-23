# Decisions: `studio-tool-output-disclosure`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Preserve less data or disclose less data? | accepted | Preserve the existing bounded structured result; change only presentation disclosure. |
| D2 | What belongs in the main timeline? | accepted | Persistent one-line summary plus a state-dependent bounded preview; complete content belongs in a dedicated transcript surface. |
| D3 | Which states open automatically? | accepted | Running shows a 5-line tail; failure/cancelled-with-diagnostics shows a 2-line head plus 8-line tail; successful completion collapses. |
| D4 | How is user intent preserved? | accepted | Manual expand/collapse overrides automatic transitions for the mounted session view; reopening recalculates semantic defaults without synchronized UI state. |
| D5 | Can inline expansion grow without bound? | accepted | No; cap it at the smaller of 40% conversation viewport or 480 logical pixels and scroll internally. |
| D6 | How are pathological long lines bounded? | accepted | Apply budgets after visual wrapping, not only by newline or character count. |
| D7 | How do activity groups disclose children? | accepted | Groups reveal child summaries first; only active or failed children receive bounded automatic previews. |
| D8 | What existing behavior is excluded? | accepted | Structured diffs, ordinary messages, protocol/storage/sync, permissions, execution, Default/Web/mobile, and full-transcript data remain unchanged. |
| D9 | What constitutes visual acceptance? | accepted | Packaged Studio success/running/failure/long-line/group states in light and dark require direct evidence; an inaccessible or blank state is an explicit gap. |
| D10 | Can the existing detail route host the full transcript? | accepted | Yes. Reuse message detail and `ToolFullView`; refine the current `CodexBash` full-view mapping because it omits successful enriched output. Do not add a second transcript data model. |
| D11 | What is the visual-line implementation seam? | accepted | Use a feature-local contract plus actual rendered line/clamp behavior. Installed RN Web supports visual clamping through `numberOfLines`; newline/character counting alone is insufficient. |
| D12 | How will scroll anchoring be verified? | accepted | Pure policy and mounted wiring tests cover deterministic behavior; packaged interaction evidence owns real inverted-FlatList anchoring because no current ChatList mounted harness proves it. |
| D13 | Does a configured risk trigger apply? | accepted | No. Product writes are Studio presentation only; protocol, sync, persistence, protected paths, permissions, execution, and deployment are excluded. Risk gate is not required unless scope changes. |
| D14 | What execution boundary applies? | accepted | One main-session Feature branch from `dev`, local-only and immediate pickup; no tracker, batch plan, delegated writer, or extra worktree required. TDD owns T1-T5. |
