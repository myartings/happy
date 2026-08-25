# Finish Review: `codex-options-after-thread-restart`

## Summary

Replaced process-wide append-prompt state with Codex-thread-keyed state. A
replacement thread now receives Happy's option instructions, while subsequent
turns on the same thread do not duplicate them.

## Verification

- RED/GREEN prompt regression: 9/9 targeted tests passed after implementation.
- Adjacent Codex prompt/router coverage passed; unrelated Windows sandbox
  assertions remain documented in `validation.md`.
- `pnpm --filter happy build` passed, including TypeScript no-emit checking.
- Repository typechecks and workflow-core/workflow-CI tests passed.
- Full CLI, app, and server baselines were run; unrelated existing failures are
  itemized in `validation.md` and do not touch the changed CLI prompt path.
- The locally linked CLI and daemon were rebuilt/restarted, and a fresh
  Happy (dev) conversation rendered `通过`, `重试`, and `停止` as three real
  clickable option buttons.

## Whole-diff review

Passed with no blocking finding. The change is limited to the Codex prompt
builder, its `runCodex` wiring, one regression test, and workflow evidence. No
renderer, wire/session protocol, authentication, or mobile source changed.

## Rollback or mitigation

Rollback is a direct revert of the three CLI source/test changes. There is no
schema, data, protocol, deployment, or migration state to unwind.

## Lessons promoted

- `CONTEXT.md`: not required; the behavior is local to Codex prompt lifecycle.
- `docs/ARCHITECTURE.md` or ADR: not required; no architecture decision changed.
- Skill/workflow rule: not required; the regression test is the durable guard.

## Follow-up

- Commit and push only after explicit user authorization.
