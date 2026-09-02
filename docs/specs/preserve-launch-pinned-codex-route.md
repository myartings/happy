# Preserve Launch-Pinned Codex Route

## Status and source

- Status: accepted for implementation
- Source: [GitHub Issue #99](https://github.com/myartings/happy/issues/99)
- Related authority: `docs/PRD.md#runtime-confirmed-codex-route-metadata`
- Dependency: Issue #80 runtime-confirmed `effectiveModel` / `effectiveReasoningEffort`

## Outcome

For an existing Codex Session whose runtime-confirmed route is known, sending
the first Happy message without a per-session model or effort selection keeps
the model and reasoning effort pinned at process launch. A model or effort that
the user explicitly selects for that Session still overrides the corresponding
current route value.

## Behavioral contract

### Route authority

1. `metadata.effectiveModel` and `metadata.effectiveReasoningEffort` are an
   atomic, Codex-confirmed description of the current route only when the model
   passes the same concrete-model rules and the effort is in the supported
   Codex effort enum. They are evidence that the Session already owns a route;
   they are not themselves outbound override values.
2. `session.modelMode` and `session.effortLevel` are synced per-session route
   values. They may reflect the launch/current request or a later explicit
   user pick. When present, each value is included in outbound metadata; unlike
   a client/global default, it belongs to this Session.
3. When the effective pair is complete and the corresponding per-session value
   is absent, outbound message metadata omits that model or effort field. The
   CLI then retains its launch/current sticky value instead of receiving a
   client/global fallback.
4. A partial or malformed effective pair is not authority. Legacy, partially
   upgraded, or malformed Sessions retain the existing Codex fallback behavior
   and receive the resolved client/default model and effort.
5. Permission and service-tier metadata retain their existing behavior. This
   Slice does not change permission preservation (#87), service-tier routing,
   global defaults, or non-Codex agents.

### State transitions

| Session state | Happy message metadata | CLI route result |
| --- | --- | --- |
| Complete effective pair; no stored per-session values | omit `model` and `effort` | retain launch/current pair |
| Complete effective pair; per-session model only (including launch model) | send `model`; omit `effort` | retain/reassert model; retain effort |
| Complete effective pair; per-session effort only | omit `model`; send `effort` | retain model; retain/reassert effort |
| Complete effective pair; per-session model and effort | send both | retain/reassert or update both |
| Missing or partial effective pair | send resolved legacy/default pair | preserve compatibility with older Sessions |

The existing model-picker behavior may explicitly select a compatible effort
when a model change requires it; that resulting per-session effort remains an
explicit pick and is sent normally.

## Compatibility and constraints

- All Happy client surfaces use the shared message-mode resolver; no
  platform-specific first-message rule is introduced.
- The CLI continues to treat absent model/effort keys as “retain current” and
  explicit `null` as reset. This Slice does not change that wire meaning.
- Runtime-confirmed metadata remains observational and fail-closed as defined
  by Issue #80. Launch argv alone never counts as effective-route proof.
- No raw Session messages, logs, credentials, or machine-local evidence enter
  repository or tracker artifacts.
- The downstream launcher verification wait tracked by
  `myartings/agent-skill-registry#10` remains out of scope.

## Acceptance criteria

- **AC1 — unchanged launch route:** A Codex Session launched as Luna/Max with a
  complete effective pair sends no client/global model or effort fallback on
  its first Happy message. A synced launch-backed Luna value may be reasserted;
  an absent per-session effort is omitted rather than replaced with Medium.
- **AC2 — thread route:** The CLI resolves that absent metadata to its existing
  Luna/Max launch state for thread start.
- **AC3 — effective projection:** The existing runtime-confirmed metadata and
  daemon projection report Luna/Max after the unchanged-route first turn.
- **AC4 — explicit model:** A per-session model selection is sent and overrides
  the model while an unselected effort remains omitted.
- **AC5 — explicit effort:** A per-session effort selection is sent and
  overrides the effort while an unselected model remains omitted.
- **AC6 — explicit pair:** Explicit per-session model and effort selections are
  both sent and synchronized normally.
- **AC7 — fail-closed compatibility:** A Session without a complete valid
  effective pair, including malformed non-empty model/effort strings, keeps
  the existing resolved Codex model/effort fallback.
- **AC8 — bounded behavior:** Permission, service tier, Rig, Claude, and other
  non-Codex message metadata semantics do not change.

## Verification map

| Criterion | Planned evidence |
| --- | --- |
| AC1, AC4-AC8 | `messageMeta.test.ts` focused resolver tests, including malformed complete-pair fixtures |
| AC2, AC3 | candidate-bound `codexAppServerClient.test.ts` first-message fixture: absent message overrides retain launch state through actual `thread/start` / `turn/start`, settings event, and production daemon projection helper |
| AC1-AC8 | Happy App and CLI typecheck plus applicable repository workflow check |
| Whole contract | independent Spec and Standards review of one staged candidate |

## Risk assessment

Result: **cleared-with-controls**.

- Blast radius is every Happy client surface sending to an existing Codex
  Session, but the change is centralized and limited to two optional metadata
  keys.
- False success could silently run a model or effort different from the user's
  launch or explicit selection. Controls require complete-and-valid-pair
  gating, positive and malformed metadata fixtures, CLI retained-state and
  actual App Server request/projection coverage, and independent review.
- Partial Issue #80 metadata must take the compatibility path; it must never be
  treated as sufficient authority to omit an override.
- Rollback is a direct revert of the resolver predicate and tests; no schema,
  migration, persisted-data rewrite, or server deployment is involved.
