# Finish Review: `codex-stalled-turn-recovery`

## Summary

Happy CLI now gives every inbound Codex message a stable delivery identity,
correlates uncertain steering acknowledgements against authoritative history,
preserves identified fallback messages as separate ordered turns, repairs
missed completion notifications, and automatically recovers an inactive
app-server instead of locally declaring a false abort.

## Verification

- Happy CLI typecheck and build passed.
- Seven selected app-server lifecycle and compatibility tests passed.
- Router suite: 6/6 passed.
- Message queue suite: 22/22 passed.
- Workflow validation/core/CI tests passed.
- Full Windows test limitations and the incomplete Prisma setup environment are
  recorded in `validation.md`; there is no Happy App or Server product diff.

## Whole-diff review

Passed. Delivery uncertainty, duplicate prevention, queue ordering, stale event
identity, inactivity semantics, interrupt/restart concurrency, thread resume,
old Codex compatibility, user visibility, protected paths, and rollback were
traced through callers and tests. A stale cross-turn activity issue found during
review was fixed and regression-tested. No blocking finding remains.

## Rollback or mitigation

Rollback is a code revert of the Happy CLI adapter and queue changes. There is
no schema, persisted-data, authentication, server, or cross-device protocol
migration. Automatic recovery remains bounded by the existing interrupt grace,
force restart, and same-thread resume behavior.

## Lessons promoted

- `CONTEXT.md`: none; no new repository-wide boundary.
- `docs/ARCHITECTURE.md` or ADR: none; the reversible adapter-local decisions
  are captured in the feature spec and workflow decisions.
- Skill/workflow rule: none; the durable behavior contract is
  `docs/specs/codex-stalled-turn-recovery.md`.

## Follow-up

- Build and install the personal Happy CLI/client release when requested.
- Consider adopting Codex's newer experimental durable `thread/queue/*` API
  after the supported runtime floor exposes those requests consistently.
- No tracker or PR mutation was requested; the workflow remains local-only.
