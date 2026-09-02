# Runtime-confirmed Codex Route Specification

## Boundary

This feature adds an optional effective Codex route pair to existing Happy
Session metadata and transports App Server-confirmed values through the
existing daemon Session projection. `modelMode` remains requested/current UI
state and is not an authority signal.

It does not change routing policy, defaults, model pickers, permissions,
service tiers, sandboxing, launchers, Session content, or non-Codex agents.

## Public metadata interface

For a Codex Session, metadata may contain both fields:

```json
{
  "effectiveModel": "gpt-5.6-luna",
  "effectiveReasoningEffort": "max"
}
```

The fields form one atomic pair. A consumer must never observe exactly one of
them as current effective-route evidence. Both fields are optional for
backward compatibility and absent for non-Codex Sessions.

## Evidence and state rules

- Authoritative evidence is a Codex App Server response or notification bound
  to the current thread or accepted route change and containing a concrete,
  valid model plus reasoning effort.
- Requested CLI arguments, Happy mode state, defaults, picker selections,
  environment variables, process inspection, launch receipts, and previous
  metadata are never authoritative evidence.
- Valid complete evidence atomically replaces the prior effective pair, even
  when it differs from the requested route.
- Missing, null, malformed, partial, reset/default, or unbound evidence
  atomically removes or withholds the whole pair.
- A model-only or effort-only requested change cannot combine new requested
  state with an older effective counterpart. The pair remains absent until
  Codex confirms the resulting concrete pair.
- An interrupted or failed route change cannot publish its request as
  effective. Existing evidence may remain only when Codex still confirms it as
  current; otherwise the pair is cleared.

## Lifecycle behavior

- Initial thread creation publishes the complete pair returned by App Server.
- Thread resume/reconnect republishes the complete pair returned by App Server
  and cannot reuse stale Session metadata as confirmation.
- A supported thread fork publishes the complete pair returned for the forked
  thread.
- A later accepted model or effort change clears or withholds effective-route
  evidence until App Server confirms the complete resulting pair, then
  publishes it atomically.
- Explicit reset/default requests stay fail-closed until App Server resolves
  and confirms concrete values.

## Projection, compatibility, and privacy

- The existing Session metadata path and daemon list projection expose the
  optional fields without a new store or polling protocol.
- Older producers and consumers may omit or ignore the fields.
- Non-Codex metadata is unchanged.
- The pair contains only model and reasoning-effort identifiers; no prompts,
  credentials, tokens, raw logs, or Session content are added.
- `modelMode` and its current display/picker behavior remain unchanged.

## Acceptance criteria

- AC1: The typed Session metadata contract accepts optional
  `effectiveModel` and `effectiveReasoningEffort` fields.
- AC2: Complete App Server confirmation publishes both fields in one metadata
  update, and an unchanged pair preserves metadata identity when practical.
- AC3: Missing, null, malformed, partial, reset/default, or unconfirmed
  evidence clears or withholds both fields without fallback.
- AC4: Initial thread start publishes the exact App Server-confirmed pair.
- AC5: resume/reconnect and supported fork paths publish the exact confirmed
  pair for their current thread.
- AC6: Later model-only, effort-only, and combined requests expose no mixed or
  requested-as-effective pair before confirmation, then publish the confirmed
  result atomically.
- AC7: A requested/effective mismatch publishes the App Server-reported pair.
- AC8: Existing `modelMode`, startup flags, remote state, Session display,
  reconnect behavior, non-Codex agents, and older metadata remain compatible.
- AC9: The existing daemon Session projection exposes the pair and no
  additional sensitive state.
- AC10: A deterministic Luna Max fixture reaches the projection and the
  unchanged launcher parser accepts it as a verified matching route.
- AC11: Focused negative fixtures cover absent effort, stale metadata,
  reset/default, resume, mismatch, and partial route changes.
- AC12: Focused suites, complete Happy CLI unit tests, CLI typecheck, applicable
  workflow checks, and independent Spec/Standards review pass.

## Evidence mapping

| Criteria | Planned evidence |
| --- | --- |
| AC1-AC3 | metadata helper/type tests, including atomic clear and malformed/partial evidence |
| AC4-AC7 | App Server client and `runCodex` lifecycle fixtures for start, resume, fork, and later changes |
| AC8 | existing requested-mode, startup, reconnect, and non-Codex regression suites |
| AC9-AC11 | bounded daemon/session projection fixture plus unchanged launcher parser fixture |
| AC12 | focused Vitest commands, `pnpm --filter happy test`, `pnpm --filter happy typecheck`, applicable workflow check, independent review |

## Risk controls and rollback

- The sole authority seam is typed complete App Server evidence.
- Pair construction and clearing are centralized and unit tested; callers do
  not update the two fields independently.
- Deterministic negative fixtures cover false-success and stale-state paths.
- The final candidate requires independent Spec and Standards review.
- Rollback removes the optional fields and propagation, returning downstream
  verification to its current manual fail-closed behavior without data
  migration.
