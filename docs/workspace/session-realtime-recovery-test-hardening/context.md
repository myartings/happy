# Context: `session-realtime-recovery-test-hardening`

## Goal

Close the three medium-confidence test gaps found during local runtime
acceptance of `session-realtime-recovery` without changing its user-visible or
wire behavior.

## Accepted scope

- Exercise visible-session reconciliation through the real `Sync` host,
  `InvalidateSync`, and incremental `/messages?after_seq=...` request path.
- Exercise the health-reconnect sequence with a Socket.IO fake that drives the
  registered disconnect/connect handlers.
- Exercise the lifecycle state consumer used by `runCodex`, including primary,
  child, duplicate completion, and abort sequences.
- Make only the smallest production refactors needed to expose these stable
  seams. No protocol, payload, server, persistence, or UI behavior change.

## Repository boundary

- Repository: `/Users/myartings/workspace/happy`
- Branch: `feature/session-realtime-recovery`
- Existing staged changes belong to the parent fix and must remain intact.
- Protected/generated paths from `.ai/project.json` remain out of scope.
- This is a local-only immediate follow-up on the same uncommitted branch; no
  tracker, PR, delegation, or delayed pickup boundary is needed.

## Validation

Use the role-scoped manifests in `contexts/implement.jsonl` and
`contexts/check.jsonl`. Record every RED/GREEN and final command in
`validation.md`.
