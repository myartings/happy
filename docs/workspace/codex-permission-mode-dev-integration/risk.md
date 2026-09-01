# Risk Assessment: `codex-permission-mode-dev-integration`

## Result

`cleared-with-controls`

The merge combines two authorization-sensitive permission-mode changes. A
false success could silently elevate a session, silently downgrade YOLO, or
make UI state diverge from active CLI behavior. No credentials, server schema,
money, migration, production deployment, or destructive data operation is
involved.

## Required controls

- Pin and inspect both merge parents; no history rewrite or force push.
- Preserve exact legacy recovery predicates and explicit-null precedence.
- Preserve Issue #88 authenticated RPC, revisions, pending-approval, Abort,
  reconnect, and cross-client race handling.
- Keep synchronized metadata out of the live authorization-command role.
- Run combined public-seam App/CLI tests and both typechecks.
- Bind configured checks and independent capable Spec/Standards review to one
  staged merge-local candidate.
- Require merge-mode workflow CI before archive, after archive, and after the
  merge commit; verify remote SHA and PR mergeability after push.

## Stop conditions

Stop if integration requires a new heuristic, changes defaults/policy mapping,
drops either parent's behavior, touches protected/native/server/release scope,
introduces a new check failure, or cannot prove exact candidate identity.

## Rollback

Before push, do not finish the merge commit. After push, revert through a new
commit; never reset or force-push. No migration cleanup is needed.
