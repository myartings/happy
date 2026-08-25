# Codex Desktop Active State

## Accepted behavior

- A Codex `thinking=true` lifecycle/activity update is not overwritten by an
  `update-session` handler that began decrypting from an older session snapshot.
- Decrypted metadata and agent state still apply with their incoming versions.
- Existing session-protocol and ACP/Codex lifecycle normalization keeps its
  current behavior.
- The fix does not change the wire protocol or heartbeat delivery contract.

## Implementation tasks

- [x] Add a focused stale-session merge regression test and confirm it fails.
- [x] Re-read the latest session after asynchronous decrypts and merge only server-owned fields.
- [x] Run the targeted suite and Happy App typecheck.
- [x] Review the complete diff and archive workflow evidence.

## Out of scope

- Changing the wire/session protocol.
- Changing server persistence or heartbeat delivery.
- Changing status colors, labels, or animation.
- Releasing or deploying Desktop builds.
