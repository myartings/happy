# ADR 0007: Coordinate the current GitHub Issue Session through existing account KV

## Status

Accepted on 2026-08-31 for the reconciled client-only scope of Issue #79.
This replaces the earlier, uncommitted dedicated-server-authority design.

## Context

Happy clients view and control Sessions that are executed by Happy daemons on
Windows, macOS, Linux, or other registered machines. The user wants one current
Session for a GitHub Issue across those daemon platforms while continuing to
use the official Happy Server.

The prior design added server tables, routes, socket gates, and a migration.
That design cannot be used with the official service unless upstream deploys
it. It also imposed mobile, database, audit-history, and incompatible-client
requirements beyond the user's intended personal desktop workflow.

The official service already exposes account-scoped UserKVStore operations:

- opaque values stored as bytes;
- versioned compare-and-swap;
- atomic mutation of up to 100 keys;
- Serializable transactions with bounded retry; and
- user-scoped KV update notifications.

## Decision

Implement an account-scoped, client-managed current association with no Happy
Server or daemon changes.

For each association, compatible clients derive two domain-separated opaque KV
keys:

- Issue direction: stable GitHub repository id plus Issue node id to current
  Session id.
- Session direction: Happy Session id to the current Issue key.

The key suffixes are account-keyed opaque digests. Values are separately
encrypted with an account-derived payload key. Repository name, Issue number,
title, URL, Session id, and replacement details are not stored as server
plaintext.

Claim and replacement use one existing KV batch mutation with expected
versions. A client creates a Session on the selected daemon, wins the
association, and only then sends the first Issue task. On a version conflict or
ambiguous acknowledgement it refetches both directions and follows the winner.
An unclaimed losing Session receives no Issue task and is stopped or archived
best-effort.

There is no browsable association history. Explicit replacement changes the
Issue and new-Session records atomically and leaves a lightweight encrypted
marker on the former Session pointing to the new current Session. The former
Session itself is never deleted.

MMKV caches valid decrypted projections for offline display. KV remains the
cross-machine coordination source. Reconnect, account change, and Issue open
refetch the exact relevant keys; KV notifications are an acceleration, not the
only recovery mechanism.

## Guarantee boundary

The current association is unique across participating clients in the same
Happy account, regardless of which Windows, macOS, or Linux daemon hosts the
Session. Platform and machine id are display/routing information, not identity.

The feature cannot constrain an old or official client that does not implement
this protocol, nor can it recognize an Issue prompt typed directly into a CLI
or daemon Session. Such Sessions remain unbound. This limitation is visible in
the Spec and is not described as server-enforced global uniqueness.

## Consequences

- The official Happy Server and every daemon remain unchanged.
- No PostgreSQL migration, custom API, capability gate, or mobile client is
  required.
- Compatible clients retain atomic bidirectional claim and replacement using
  an existing generic service primitive.
- Hard Session deletion is detected by client reconciliation and shown as
  repair-required; there is no server delete hook.
- Feature-off preserves official behavior and does not infer associations from
  titles, tags, prompts, branches, worktrees, or GitHub workflow state.
- The existing official KV contract becomes an implementation dependency; an
  unavailable or incompatible KV endpoint disables the feature safely.

## Rejected alternatives

### Dedicated server authority

Rejected because the user uses the official Happy Server and did not authorize
operating or deploying a personal server.

### Device-local MMKV only

Rejected because it cannot coordinate Sessions hosted by different daemon
platforms or recover on another viewing client.

### Session metadata or title

Rejected because it creates weak reverse lookup, overloads existing identity,
and cannot atomically prevent two current Sessions.

### Full replacement history

Rejected as unnecessary complexity for a personal current-navigation feature.
The old Session remains independently available and may show only its direct
transfer marker.

## References

- `docs/specs/github-issue-canonical-session-binding.md`
- `docs/tasks/github-issue-canonical-session-binding-tasks.md`
- `packages/happy-app/sources/sync/apiKv.ts`
- `packages/happy-server/sources/app/kv/kvMutate.ts` (existing official
  capability; unchanged by this feature)
