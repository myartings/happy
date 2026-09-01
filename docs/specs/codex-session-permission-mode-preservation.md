# Codex Session Permission Mode Preservation

## Status and source

- Status: accepted for implementation
- Source: GitHub Issue https://github.com/myartings/happy/issues/87
- Delivery boundary: one authorization-sensitive, cross-device compatibility
  slice spanning Happy App mode resolution and initial Happy CLI session
  metadata.

## Problem

An existing Codex session launched with YOLO can have no synchronized
per-session `permissionMode`. A Happy client then displays and transmits its
current Auto default, silently changing the live session when the user replies.
New sessions also expose a window because the App writes the synchronized mode
only after the session appears and refreshes.

## Invariants

1. A reply never replaces an existing Codex session's effective permission
   mode merely because another client has a different default.
2. Explicit per-session choices remain authoritative and synchronize normally.
3. Compatibility recovery may prevent an unintended downgrade but must never
   elevate a session from ambiguous evidence.
4. A new Codex session publishes its concrete launch mode with its initial
   encrypted metadata before any client can observe and reply to it.

## Effective permission-mode contract

For a non-Rig Codex session, all client surfaces that need the effective mode
use one behaviorally equivalent resolution order:

1. a valid explicit per-session mode already mirrored locally;
2. a valid synchronized `metadata.permissionMode` string;
3. if the synchronized property exists with `null`, the compatible current
   Codex default (an explicit reset, with no legacy fallback);
4. only if the synchronized property has never existed and
   `metadata.dangerouslySkipPermissions === true`, `yolo`;
5. otherwise the compatible current Codex default.

The chosen value must still pass the existing CLI-version compatibility check.
An unsupported explicit or recovered value fails closed using the established
unsupported-mode behavior; it is not replaced with a different permission.
Rig and non-Codex resolution behavior is unchanged.

## Creation and synchronization contract

- A newly launched Codex session's initial encrypted metadata contains the
  concrete launch `permissionMode` selected by the spawn request or CLI launch
  default.
- The field is present in the metadata supplied to initial session creation and
  reconnect setup; it is not deferred to an App refresh/write round trip.
- Existing App-side `sessionSetAgentModes` behavior remains responsible for
  later explicit user changes and cross-device synchronization.
- Legacy metadata is not rewritten merely by reading it. A subsequent explicit
  selection may persist through the existing synchronization path.

## Observable client behavior

- Android, iOS, web, and desktop project the same effective mode for the same
  synchronized session record.
- Outbound Codex message metadata matches the mode projected by the composer.
- A legacy Codex session with an absent `permissionMode` and an exact true
  danger marker projects and transmits YOLO.
- False, null, missing, non-boolean, or non-Codex legacy markers do not select
  YOLO.
- Changing a session explicitly to Auto or YOLO is reflected on other clients
  and on subsequent messages through the existing metadata update path.

## Non-goals

- Changing the product-wide Auto default.
- Redefining Auto, Workspace, Read, Default, or YOLO execution policies.
- Adding approval UI, server schema, database migration, native-platform code,
  release/install behavior, or tracker automation.
- Inferring mode from sandbox configuration, platform, device, stale UI state,
  or any truthy value other than the exact boolean legacy marker.

## Acceptance criteria and evidence

| ID | Verifiable criterion | Planned evidence |
| --- | --- | --- |
| AC1 | Existing legacy Codex YOLO resolves to YOLO when and only when `permissionMode` is absent and `dangerouslySkipPermissions === true`. | Focused resolver tests covering true, false, null, absent, non-boolean, and non-Codex metadata. |
| AC2 | An explicit synchronized mode overrides legacy launch evidence. | Resolver tests for Auto/Default/YOLO with a stale true marker. |
| AC3 | An explicit synchronized null resets to the compatible default and suppresses legacy recovery. | Resolver test with own `permissionMode: null` plus true marker. |
| AC4 | Composer projection and outbound Codex message metadata use the same effective-mode result. | Session-option resolver test and `messageMeta.test.ts`. |
| AC5 | Unsupported modes continue to fail closed instead of being substituted. | Existing and focused unsupported CLI-version tests. |
| AC6 | New Codex sessions include the concrete launch mode in their initial synchronized metadata. | CLI metadata producer test for Auto and YOLO launch modes. |
| AC7 | Launch-mode persistence occurs before App post-refresh reconciliation can be required. | Inspection/test of the metadata passed to initial create/reconnect; App creation regression test retained. |
| AC8 | Later explicit mode changes continue through the existing synchronized metadata path. | Existing `sessionSetAgentModes` and storage synchronization tests plus focused regression where needed. |
| AC9 | Product-wide Codex default and non-Codex/Rig behavior remain unchanged. | Existing agent-default, Rig, Claude, and message-meta regression suites. |
| AC10 | The complete candidate passes configured checks and independent high-risk Spec/Standards review. | Recorded workflow check and review receipts. |

## Compatibility and rollback

Old sessions remain readable. Only the exact historical true launch marker can
recover YOLO, and only while the newer synchronized field is absent. Rolling
back the isolated resolver and initial metadata publication restores prior
behavior without a server migration or data cleanup.
