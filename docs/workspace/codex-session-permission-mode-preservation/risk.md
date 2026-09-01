# Risk Assessment: `codex-session-permission-mode-preservation`

## Result

`cleared-with-controls`

The change is authorization-sensitive because a false positive can elevate a
session to YOLO and a false negative can silently downgrade an existing YOLO
session. The affected data is encrypted session metadata synchronized to every
client; no server schema, credential, money, deployment, or destructive
operation is involved.

## Blast radius and reversibility

- Affected users: Codex users replying to existing or newly created sessions
  from another Happy client.
- Permission surface: the per-turn Codex execution policy selected from the
  effective per-session mode.
- Data surface: existing optional encrypted metadata fields only.
- Reversibility: isolated resolver and metadata-producer changes can be
  reverted without migration or cleanup.
- False success cost: silent privilege elevation or silent loss of the user's
  established session mode across clients.

## Failure modes and controls

| Failure mode | Required control |
| --- | --- |
| Truthy, stale, false, absent, or non-Codex metadata is treated as YOLO. | Exact checks for Codex flavor, own-field absence, and boolean `true`; negative matrix tests. |
| An explicit Auto/reset loses to an old true marker. | Explicit synchronized value/null precedence tests. |
| Composer and outbound wire choose different modes. | One shared resolver contract and focused tests for both consumers. |
| A new session is visible before its launch mode is synchronized. | Put the concrete mode in initial encrypted CLI metadata; do not rely on App post-refresh writes. |
| An old CLI receives an unsupported mode. | Retain existing fail-closed compatibility validation and tests. |
| The patch changes global defaults or execution-policy meanings. | No edits to default catalogs or policy mapping; related regression suites and review. |
| A metadata update drops newer fields or adds server coupling. | Preserve passthrough metadata and existing encrypted transport; no server/native changes. |
| Partial interruption leaves an unsafe persisted state. | Initial metadata is created as one object; later App synchronization keeps existing optimistic-concurrency behavior. |

## Preconditions and stop conditions

- Preconditions: exact Issue #87 session/worktree; live Issue unchanged; accepted
  spec AC1-AC10; deterministic RED at resolver and metadata-producer seams.
- Stop if any implementation needs a heuristic beyond exact boolean true,
  changes product defaults/policy semantics, requires server/native/release
  work, or cannot distinguish explicit reset from absent legacy state.
- Stop for contract/risk reconciliation if repository evidence contradicts the
  legacy marker semantics recorded in `runCodex.ts`.

## Review and ownership

Current Root owns serial implementation. One pinned complete candidate requires
independent high-risk Spec and Standards review, explicitly checking privilege
non-escalation, cross-client consistency, compatibility, and rollback.
