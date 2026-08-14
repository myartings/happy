# Decisions: `remote-workspace-project-discovery`

## Outcome currently blocked

No product decision currently blocks the implementation-neutral feature
specification.

## D1: V1 UI surfaces

- Status: accepted
- Owner: user/product owner
- Options:
  - Full New Session only in V1; build reusable picker-data logic so Home Dock
    can adopt it in a follow-up.
  - Full New Session and Home Dock in the same V1.
- Constraints: both surfaces currently derive paths separately and use distinct
  picker item types; the feature must not produce divergent normalization,
  caching, fallback, or stale-Machine behavior.
- Evidence: `packages/happy-app/sources/app/(app)/new/index.tsx:833` and
  `packages/happy-app/sources/components/HomeDock.tsx:503` show independent
  Session-history path derivation. Both can consume a shared pure data layer,
  but each needs separate UI integration and regression coverage.
- Recommended decision: Full New Session only in V1. This proves the remote RPC,
  compatibility fallback, and discovery UX at the lower-risk surface while
  preserving a clean follow-up seam for Home Dock.
- Decision: Full New Session only in V1, accepted by the user on 2026-08-14.
  Shared picker-data logic must keep Home Dock adoption possible without
  duplicating normalization or discovery behavior.
- Reversibility: high; Home Dock can adopt the shared data layer later without a
  persisted-data migration.
- Cost of being wrong: shipping both immediately increases UI regression scope;
  shipping only New Session may temporarily surprise users who primarily start
  Sessions from Home Dock.

## D2: Source presentation

- Status: accepted
- Owner: product contract
- Decision: Present `Recent` and `Workspace Projects` as separate sections;
  Recent wins deduplication.
- Alternatives considered: one mixed list with source badges.
- Constraints/evidence: the handoff explicitly preserves Recent priority, and
  separate sections make loading, empty, truncated, and unavailable discovery
  states understandable without changing existing Recent semantics.
- Reversibility: high; presentation can change without changing the RPC.
- Cost of being wrong: a mixed list would obscure provenance and fallback state.

## D3: Project marker labels

- Status: accepted
- Owner: implementation planning
- Decision: Do not require marker labels in V1. The scanner may return markers
  for classification and future display, but selection must remain name/path
  focused.
- Constraints/evidence: marker labels are not needed for any acceptance outcome
  and would increase density work across two different picker components.
- Reversibility: high.
- Cost of being wrong: users with same-named projects may have slightly less
  disambiguation; absolute and relative paths remain searchable and visible.

## D4: Scan limits

- Status: accepted with validation condition
- Owner: engineering evidence
- Decision: Specify hard configurable scanner bounds with starting defaults of
  depth 3, 200 projects, and a 3-second caller timeout. Confirm or reduce the
  timeout through a representative workspace benchmark before finish.
- Constraints/evidence: discovery must be bounded and non-blocking; the handoff
  proposes depth 3, about 200 results, and a 2-3 second timeout.
- Reversibility: high; values are not persisted and do not change protocol
  semantics.
- Cost of being wrong: limits that are too low omit valid projects; limits that
  are too high make the picker slow. Truncation must be explicit either way.

## Risk assessment: remote path privacy and Machine RPC boundary

- Result: cleared-with-controls
- Trigger: privacy. Discovery returns absolute project paths from a remote
  Machine across the existing encrypted Machine RPC channel.
- Affected data/users: the selected user's directory names and project paths on
  one online Machine. No source contents, credentials, money, or permissions are
  intentionally accessed or changed.
- Blast radius: the optional scanner/RPC and full New Session picker. Server,
  database, Sync Engine, Session protocol, metadata, spawn flow, and Home Dock
  are excluded.
- Reversibility: high. The handler and App discovery integration can be removed
  without migration because no result is persisted.
- Failure modes: root escape through links; unbounded traversal; permission or
  disappearing-directory failures; timeout; stale result after Machine change;
  old daemon method absence; accidental logging or committed evidence of private
  paths; partial App/daemon rollout.
- Required controls: daemon-owned fixed workspace root; no user root parameter;
  depth/result/time bounds; resolved-root containment; no external symlink
  following; tolerant per-entry errors; Machine-keyed request generations and
  memory cache; non-blocking fallback for every RPC failure; encrypted existing
  channel only; no full result logging or evidence; scanner, fallback, and stale
  response tests; whole-diff forbidden-surface inspection.
- Stop conditions: any need for Server persistence, metadata upload, Session or
  spawn protocol change, configurable arbitrary roots, shell execution, Git
  invocation, unbounded traversal, or inability to prove containment and
  old-daemon fallback returns the workflow to planning.
- Rollback: remove the optional Machine RPC registration and New Session
  discovery request/rendering. Existing Recent and manual path behavior remains
  the operational fallback, with no stored data to clean up.
- Review: Feature-level whole-diff review must explicitly inspect privacy,
  containment, logs, compatibility, and forbidden surfaces. Independent review
  becomes required if implementation expands into a configured high-risk
  boundary.
