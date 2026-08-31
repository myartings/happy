# Decisions: `github-issue-canonical-session-binding`

The user reconciled the product boundary on 2026-08-31: Happy is the
viewer/controller, the Session runs on a selected Windows, macOS, or Linux
daemon, and the feature must work with the official Happy Server without a
server deployment. D1-D8 from the prior dedicated-server design are
superseded. Their implementation and review evidence is historical only.

## Current decisions

| ID | Question | Status | Decision |
| --- | --- | --- | --- |
| D9 | Where is the current association coordinated? | resolved | Participating Happy clients use the official account-scoped UserKVStore; MMKV is only a local cache. |
| D10 | What is unique? | resolved | One current Session per Issue and one current Issue per Session for the signed-in account, across supported daemon platforms. |
| D11 | How are races resolved? | resolved | One atomic `kvMutate` compares and updates both opaque directions before the first Issue task is sent; losers refetch and converge. |
| D12 | What history is retained? | resolved | No full association history. A former Session may retain one direct encrypted transfer marker pointing to the current Session. |
| D13 | What is the compatibility boundary? | resolved | The guarantee covers compatible Happy clients using this protocol; old clients and direct CLI/daemon prompts cannot be constrained. |
| D14 | What may change? | resolved | Client code only. No Happy Server, daemon, CLI, native platform, PostgreSQL, migration, deployment, or mobile acceptance changes. |
| D15 | What blocks implementation? | resolved | Nothing at the delivery-source boundary: the user authorized reconciliation, and GitHub Issue #79 now matches the accepted client-only AC1-AC10 contract. |

## D9-D11 — Existing KV as client coordination authority

- The official server already exposes account-scoped KV reads and atomic
  multi-key mutation with compare-and-set versions.
- Clients derive stable opaque keys for both directions and encrypt values with
  the account key. Repository coordinates, Issue title, URL, and prompt content
  are not stored as server-readable KV keys or values.
- A claim/replacement updates the Issue-to-Session and Session-to-Issue keys in
  one `kvMutate`. The request carries the versions last observed for every key.
  A conflict causes a refetch; the client never sends Issue work from a losing
  candidate Session.
- This is an account-scoped coordination invariant, not a property of one
  physical daemon. A Session may be hosted by any supported desktop daemon.

## D12 — Current pointer, not a ledger

The feature answers “where should I continue this Issue now?” It does not
reconstruct every historical association. Replacement atomically moves the
two current pointers. The former Session remains a normal Session and may show
one encrypted `transferred-to` marker for direct navigation. No chain walking,
audit table, or historical uniqueness is required.

## D13-D14 — Honest guarantee and delivery boundary

Only compatible Happy clients can perform the claim-before-send protocol.
Because the official server sees encrypted ordinary messages, a pure-client
feature cannot prevent an old client or direct daemon/CLI user from manually
sending Issue work elsewhere. The UI must state this limitation through
behavior and tests rather than claiming server-enforced global exclusivity.

The accepted slice changes `packages/happy-app` only. Existing official
UserKVStore behavior is a dependency, not a modification target. Desktop
platform means the daemon that hosts the Session; it does not add native
platform code or a mobile acceptance matrix.

## Completion contract

- **Evidence:** repository inspection of `apiKv.ts`, `kvMutate.ts`,
  `inTx.ts`, account encryption, Session creation, and realtime KV invalidation
  on 2026-08-31; official Codex worktree/remote-control and Linear linking
  practices were used as product references.
- **Conclusion:** the accepted behavior is feasible as a client-only feature
  using the existing official service.
- **Limits:** it cannot constrain incompatible clients or direct daemon/CLI
  prompts, and it deliberately retains no full association history.
- **Delivery stop:** product implementation waits for explicit authority to
  reconcile GitHub Issue #79 or to replace it as the delivery source.
