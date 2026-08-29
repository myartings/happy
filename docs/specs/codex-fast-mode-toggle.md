# Codex Fast Mode Toggle

## Outcome

Happy users can turn Codex Fast mode on or off for the active session from the
message composer. The selected state is visible, syncs across devices, and is
applied to the next and subsequent Codex turns without changing global Codex
configuration.

## Boundary

The feature covers native Happy Codex sessions backed by `codex app-server`.
It extends the existing permission/model/effort session-mode path with one
service-tier field.

Non-goals:

- editing `~/.codex/config.toml`;
- adding an account-wide Fast default;
- exposing API-key Priority billing controls;
- adding Fast controls to Claude, Gemini, OpenClaw, Agy, or Rig sessions;
- inventing support for models whose catalog does not advertise Fast.

## Observable behavior

1. A native Happy Codex session whose CLI advertises Fast and whose selected
   model supports Fast shows a lightning Fast toggle in the composer.
2. The off state is Standard and the on state is Fast. The active state is
   visually and accessibly distinguishable.
3. Changing the toggle updates the local session immediately and synchronizes
   the selected service tier through the existing session metadata channel.
4. Every Codex user message carries the effective tier (`default` or `fast`),
   including messages after abort, reconnect, resume, and cross-device sync.
5. The Happy CLI accepts only `default` and `fast`; malformed values are ignored
   while retaining the last valid tier.
6. `turn/start.serviceTier` receives the validated tier. Thread start/resume/
   fork may also receive it when available, but per-turn reassertion remains the
   source of truth.
7. Switching to a model that does not advertise Fast normalizes the session to
   Standard before a new message can be sent.
8. Old Happy CLIs and unsupported/custom models do not show the control. Their
   existing message and session behavior remains unchanged.

## Data and compatibility contract

- Session metadata advertises `serviceTiers?: string[]` for native Codex.
- Synced session metadata stores `serviceTier?: string | null`.
- User message metadata carries `serviceTier?: string | null`.
- The app treats absent capability as unsupported and absent selection as
  Standard.
- The CLI validates wire values before passing them to Codex app-server.
- All new fields are additive and optional so older app/CLI versions continue
  parsing sessions and messages.

## Failure handling

- A failed metadata sync keeps the optimistic local selection, matching the
  existing agent-mode behavior, and logs the failure for later reconciliation.
- An invalid inbound tier never reaches Codex app-server.
- An app-server rejection surfaces through the existing Codex turn error path;
  Happy does not claim a successful mode change based on the request alone.

## Acceptance criteria and evidence

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | The composer exposes an accessible Fast toggle only for supported native Codex sessions/models and visibly marks the on state. | AgentInput presentation/component tests; model option tests |
| AC2 | Selecting Fast or Standard updates and syncs the per-session `serviceTier` without affecting other sessions. | storage/ops focused tests |
| AC3 | Codex messages reassert `fast` or `default`; other agent messages do not gain the field. | `messageMeta` tests |
| AC4 | CLI mode state accepts only `fast`/`default`, retains valid state when input is absent, and ignores invalid input. | `remoteModeState` tests |
| AC5 | The validated tier is serialized as `serviceTier` in Codex `turn/start`. | `codexAppServerClient` tests |
| AC6 | Unsupported models normalize to Standard and old CLIs do not expose the toggle. | model/session compatibility tests |

## Operational controls

- Default to Standard to prevent accidental elevated credit consumption.
- Capability- and model-gate the control to prevent false success.
- Keep rollback additive: removing the control and ignoring optional metadata
  restores prior behavior without data migration.
