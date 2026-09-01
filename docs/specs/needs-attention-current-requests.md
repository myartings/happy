# Needs Attention: Current Requests

## Status and sources

Accepted implementation contract for
[GitHub Issue #70](https://github.com/myartings/happy/issues/70). This is the
current permission-and-communication slice of the broader Needs Attention 2.0
design. The source design was verified at Git blob
`ae8f16b1eb9fd29933b6b9b1c9243d74d43a4db8`; only the behavior explicitly
selected by Issue #70 is accepted here.

## Goal

Make the existing leading Needs Attention section reliably surface current
permission and agent-communication requests. A user can see the primary reason,
open the existing Session flow, and reach a current matching request without a
list action responding to or mutating that request.

## Existing behavior

- The section already promotes non-archived permission-required and generic
  unread Sessions when `needsAttentionSessionsEnabled` is enabled.
- Pending communications already produce `input_required` while a Session is
  online, but they are not included by the list projection.
- Offline presentation currently outranks request presentation in
  `SessionState`, so request membership cannot safely depend on that value.
- Permission and communication response ownership already lives inside the
  unchanged Session flow.

## Accepted behavior

### Projection

1. Derive current request reasons directly from pending `agentState.requests`
   and pending communications, independently of online presentation state.
2. A non-archived Session with either reason appears in the existing leading
   Needs Attention section when the setting is enabled, including while
   offline.
3. A Session appears at most once even when it occurs in multiple input groups
   or carries both current reason kinds.
4. Permission is the primary reason ahead of answer-required. Rows then sort by
   primary-reason priority, canonical Session activity descending, and stable
   Session ID. Pinning or favorites do not outrank current-request severity.
5. Preserve the existing generic-unread promotion as compatibility behavior in
   this slice. A current permission or answer reason outranks generic unread
   presentation.
6. Keep every current permission and communication reason in a bounded,
   metadata-only Session row projection. Do not copy tool arguments, prompts,
   paths, questions, titles, or raw request payloads into that projection.

The observable row projection is equivalent to:

```ts
type CurrentAttentionReason = {
    kind: 'permission_required' | 'answer_required';
    sourceId: string;
    observedAgentStateVersion?: number;
    detailKind?: 'form' | 'unsupported';
};

type CurrentSessionAttention = {
    primaryReason: CurrentAttentionReason;
    reasons: CurrentAttentionReason[];
};
```

Exact names are not normative. `observedAgentStateVersion` enables exact focus
only when it is a non-negative safe integer. Within one reason kind, choose a
primary source by missing `createdAt` first, then the oldest finite non-negative
`createdAt`, then stable source ID.

### Presentation

1. Permission rows show localized visible and accessibility text equivalent to
   “Permission required” and expose a navigation-only Review affordance.
2. Communication rows show localized visible and accessibility text equivalent
   to “Answer required” and expose a navigation-only Answer affordance.
3. Unsupported communication kinds remain answer-required and their existing
   Session explanation remains reachable. List copy never includes their raw
   title, kind payload, or provider arguments.
4. Session details/current-state UI continues to expose every still-current
   permission and communication through the existing structured controls.
5. Disconnected styling remains visible without hiding or relabeling the
   primary request reason.

### Navigation and stale state

1. A list action uses the existing Session route and carries only a bounded
   focus hint: reason kind, source ID, and observed agent-state version.
2. The destination reads the latest synchronized Session state before applying
   the hint. Exact focus is allowed only when the observed version is a
   non-negative safe integer, equals the latest `agentStateVersion`, and the
   same source ID is still pending with the same reason kind.
3. When valid, focus the existing permission tool control or existing supported
   communication form/card when a stable existing target is available.
4. A missing or malformed version, any version mismatch, a missing source, a
   same-ID replacement observed at a newer version, or an unavailable exact
   target opens the general current Session state without retargeting or
   submitting anything.
5. Navigation carries no answer draft. Resolving a request on another device
   removes its reason after ordinary synchronization; merely opening the
   Session removes no current request.

## Safety and compatibility

- The list and route-focus code must not call permission approval/denial,
  communication answer/cancel, provider, pending-promise, agent-state write, or
  settings mutation operations.
- Existing Session controls remain the sole owners of final confirmation,
  response, cancellation, error, and draft behavior.
- No server, CLI, provider adapter, encrypted-state schema, notification,
  Session protocol, or RPC contract changes are allowed.
- Existing ordinary Session routes, deep links, unread behavior, and the
  disabled-feature list remain compatible.
- Projection work is linear in visible Sessions plus their bounded current
  request collections and performs no transcript fetch or per-row request.

## Non-goals

- Terminal success, failure, cancellation, seen, or acknowledgement reasons.
- Goal-derived reasons or Goal Mode implementation.
- Direct list approval, denial, answer, dismissal, or any new response RPC.
- Provider/CLI handler changes, a separate inbox/activity route, notification
  redesign, or persistence beyond existing synchronized state.

## Risk assessment

**Cleared with controls.** The feature routes toward permission-bearing and
answer-bearing controls, but adds no authority to execute them. False exact
focus could present the wrong current request, so every focus is fail-closed on
version and stable source identity. The change is reversible through the
existing feature setting and requires no data rollback.

Stop implementation if exact focus would require a response-handler change, a
new protocol/state field, raw sensitive payload in list data, or a weaker stale
state check.

## Acceptance criteria

1. Every non-archived Session with a pending permission or pending agent
   communication appears once in Needs Attention while enabled, including
   offline Sessions and duplicate list inputs.
2. Permission outranks answer-required; each row retains every current reason,
   then rows sort by reason, canonical activity, and stable ID without pinning
   changing severity.
3. Rows provide localized visible and accessibility reason text. Unsupported
   communications remain visible as answer-required and their existing
   explanation remains reachable without exposing raw payload in the list.
4. Review and Answer only navigate. A current matching source with an unchanged
   valid `agentStateVersion` may focus its existing Session control.
5. Missing, invalid, fractional, negative, changed, or mismatched versions and
   missing/replaced sources fall back to general current state with no draft,
   response RPC, provider/promise effect, or agent-state write.
6. Opening a Session resolves nothing; ordinary synchronization after another
   device resolves a source removes only the corresponding current reason.
7. Goal and terminal reasons remain absent, response handlers/protocols stay
   unchanged, and disabling Needs Attention restores the existing ordinary
   list and routes.

## Acceptance-to-evidence mapping

| Criterion | Planned evidence |
| --- | --- |
| 1-2 | Pure projection and `useVisibleSessionListViewData` tests covering permission, communication, offline state, archive state, duplicate IDs, precedence, activity/ID ordering, and pin/favorite interaction. |
| 3 | Projection metadata assertions plus compact/flat row rendering tests for localized visible/accessibility text and unsupported-kind safety. |
| 4-5 | Pure destination-focus resolution tests plus route/navigation interaction tests for unchanged source, resolution, same-ID replacement, unrelated version update, missing/malformed versions, and zero mutation calls. |
| 6 | Projection reprojection tests after source removal plus navigation tests proving open alone changes no source. |
| 7 | Disabled-feature regression, negative Goal/terminal fixtures, existing pending-communication selector tests, and App typecheck. |

## Verification

```bash
pnpm --filter happy-app exec vitest run \
  sources/features/needs-attention \
  sources/hooks/useVisibleSessionListViewData.test.ts \
  sources/sync/pendingCommunicationsSelector.spec.ts
pnpm --filter happy-app typecheck
python3 scripts/workflow-check.py --applicable
```
