# Decisions: `codex-fast-mode-toggle`

## D1 — Scope and persistence

- Question: Is Fast a global Codex preference or a Happy session mode?
- Options: edit the machine's global `config.toml`; keep device-local UI state;
  sync a per-session mode and reassert it on every turn.
- Constraints: Happy already syncs permission, model, and effort picks through
  session metadata; remote turns can be resumed from another device.
- Evidence: `SessionAgentModesPatch`, `sessionSetAgentModes`, and
  `resolveMessageModeMeta` already implement the required optimistic/synced
  path. Codex 0.150.1's generated `TurnStartParams` accepts `serviceTier` as a
  per-turn override that persists for subsequent turns.
- Owner: product owner accepted a native Happy switch; implementation owner
  selects the narrowest behavior preserving current session semantics.
- Reversibility: high; the additive metadata field can be ignored by older
  clients and removed without migrating stored data.
- Cost of being wrong: a global write would unexpectedly affect non-Happy
  Codex sessions; device-local state would drift across remote clients.
- Decision: **passed** — Fast is a synced per-session mode, reasserted on every
  Codex message. Happy never edits the user's global Codex configuration.

## D2 — User interaction

- Question: Where should the native control live?
- Options: settings screen default; nested gear menu; direct composer toggle.
- Constraints: Fast changes credit consumption for the very next turn and must
  remain visible near model and effort controls on desktop and mobile.
- Evidence: `AgentInput` owns the existing per-turn mode controls and already
  has desktop mode chips plus a compact mobile action row.
- Owner: implementation owner.
- Reversibility: high; presentation remains behind capability/model checks.
- Cost of being wrong: a hidden setting makes accidental high-credit use hard
  to notice; a global default expands scope beyond the requested session UI.
- Decision: **passed** — add a direct lightning Fast toggle in the composer.
  It is visibly selected while enabled and is absent when unsupported.

## D3 — Standard semantics

- Question: Does an off toggle inherit `config.toml` or explicitly request the
  standard service tier?
- Options: `null`/inherit; explicit `default`.
- Constraints: an unchecked switch must truthfully mean Fast is off.
- Evidence: the generated Codex protocol accepts a string tier override; the
  official Fast documentation distinguishes Fast from Standard.
- Owner: implementation owner.
- Reversibility: high.
- Cost of being wrong: inherit can silently remain Fast when the global config
  is Fast, contradicting the UI and continuing elevated credit consumption.
- Decision: **passed** — off sends `serviceTier: "default"`; on sends `"fast"`.

## D4 — Compatibility boundary

- Question: How does the app avoid offering Fast to an old Happy CLI or an
  unsupported model?
- Options: guess by version; always show and rely on server rejection; publish
  an additive capability and combine it with model support.
- Constraints: old Happy CLIs strip unknown message metadata, causing silent
  false success; model families do not all support Fast.
- Evidence: session metadata is passthrough/additive, while current old
  `MessageMetaSchema` omits `serviceTier`; model options already carry optional
  `serviceTiers`.
- Owner: implementation owner.
- Reversibility: high.
- Cost of being wrong: the UI can claim Fast while turns run Standard or fail.
- Decision: **passed** — the new Happy CLI advertises supported service tiers
  in session metadata; the app shows Fast only when both the CLI capability and
  selected model include it. Unsupported model changes normalize to Standard.
