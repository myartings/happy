# Risk Assessment: `github-issue-canonical-session-binding`

Outcome: **cleared-with-controls** for the reconciled client-only design. No
risk waiver is accepted. Tracker mismatch remains a separate scoping blocker.

## Exposure and blast radius

- **Users:** one signed-in Happy account using compatible Happy clients.
- **Data:** opaque Issue and Session KV keys, encrypted current-association
  records, KV versions, and an optional encrypted direct transfer marker.
- **Systems:** `packages/happy-app` and the existing official UserKVStore API.
  GitHub is read-only for this feature; server, daemon, CLI, native platform,
  and database schemas are out of scope.
- **Blast radius:** one account and the two current-association directions
  touched by a single atomic mutation.

## Failure modes and controls

| Failure mode | Required control |
| --- | --- |
| Two clients claim the same Issue concurrently | Compare all observed KV versions and update both directions in one `kvMutate`; loser refetches and navigates to the winner. |
| One Session becomes current for two Issues | Include the candidate Session direction in the same compare-and-set mutation and reject an occupied direction. |
| A losing candidate sends the first Issue task | Claim before enqueue/send; on conflict keep the draft and archive/stop the still-empty candidate best-effort. |
| A write succeeds but the response is lost | Treat ambiguous transport failure as unknown; refetch both directions before retrying or cleaning up. |
| Replacement leaves one stale direction | Compare and mutate the old Issue, old Session, new Session, and any conflicting Issue directions atomically. |
| Account changes during an operation | Bind derivation, transport, cache, and completion to one account-generation token; discard stale results. |
| Server learns private Issue identity | Domain-separated opaque keys and account-encrypted values; tests reject plaintext coordinates/title/URL in KV material. |
| Realtime invalidation is missed | KV notifications are hints; reconnect and foreground paths refetch authoritative current keys. |
| Local cache is corrupt or stale | MMKV is projection only; validation failure or version conflict falls back to KV refetch. |
| KV is unavailable | Feature fails closed before first send and preserves the user draft; ordinary non-Issue Session behavior remains unchanged. |
| Former Session suggests obsolete continuation | Optional direct `transferred-to` marker points only to the current Session and is refreshed from KV. |
| Old client or direct CLI creates parallel work | Documented limitation; no false claim of enforcement outside compatible clients. |

## Preconditions

1. AC1-AC10, ADR 0007, and T1-T6 are the current accepted local contract.
2. GitHub Issue #79 is reconciled, or the user explicitly designates the local
   contract as the delivery source, before product implementation resumes.
3. The old dedicated-server candidate is removed without deleting unrelated
   user work; TDD starts from a client public-interface RED test.
4. No live account KV mutation, client launch/sign-in, release, deployment, or
   tracker write occurs without its own authorization.

## Stop conditions

- Stop if atomic two-direction replacement cannot be expressed within the
  existing 100-operation `kvMutate` limit.
- Stop if plaintext GitHub identity, credentials, title, body, URL, or prompt
  would be exposed to the server.
- Stop if correctness requires changing Happy Server, daemon/CLI, protected
  native directories, or adding PostgreSQL.
- Stop and diagnose if RED is caused by setup drift or the same GREEN root
  cause fails twice.

## Ownership and review

The current Root owns implementation in this worktree. The final checked
client-only candidate requires independent Spec and Standards review. The user
retains authority over tracker mutation, live account fixtures, launch,
release, and deployment.
