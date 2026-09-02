# Risk Assessment: `publish-launch-pinned-codex-effort`

## Result

**Cleared with controls.** The Slice changes the Codex session lifecycle and
therefore has medium workflow consequence, but it is local, reversible, and
requires no data migration or server deployment.

## Blast radius and false-success cost

- Affected users: fresh Happy Codex Sessions; resume/fork/reconnect are adjacent
  compatibility surfaces.
- Data and permissions: no new sensitive data or permission authority. Existing
  model/effort identifiers and permission/sandbox settings cross the same local
  App Server boundary.
- False success could silently downgrade effort, display a false effective
  route, create duplicate threads, or start an inference before user intent.
- Partial failure could create a thread without publishing its identity/pair or
  publish Session metadata without the daemon projection.

## Controls and stop conditions

- Only a complete valid `thread/start` response may update effective metadata.
- Assert eager initialization produces one `thread/start` and zero
  `turn/start`/user-input requests.
- Assert the first real message reuses the eager thread and preserves the launch
  pair unless an explicit user selection changes it.
- Keep resume/fork/reconnect paths on their existing confirmation flow and cover
  them with regression tests.
- If App Server configuration or eager thread creation is rejected, fail closed
  before the message loop; never publish argv, requested state, or Medium as
  effective evidence.
- Require focused RED-to-GREEN evidence, CLI typecheck, applicable structured
  checks, and independent Spec/Standards review.

## Rollback

Revert the optional thread effort configuration and eager fresh-thread
orchestration, restoring lazy first-message creation. No database, persisted
schema, external API migration, or destructive cleanup is required.
