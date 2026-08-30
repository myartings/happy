# Codex Stalled-Turn Recovery Hardening

## Outcome

Close the reliability gaps found in the final review of
`codex-stalled-turn-recovery`: an uncertain acknowledgement or a failed
recovery must never silently drop or blindly duplicate a user message, and a
detached inactivity recovery must never reject without an owner.

## Contract

1. Reconciliation has three observable outcomes: delivered, confirmed absent,
   or unknown. Automatic retry/queue fallback is allowed only for confirmed
   absence.
2. A timed-out `turn/steer` whose first history read is unavailable is
   reconciled again after bounded recovery. If delivery remains unknown, the
   original input remains pending for later reconciliation and is not blindly
   submitted a second time.
3. Recovery failure cannot discard the original input or claim that it has
   already been queued. The input remains pending and can be reconciled or
   retried after transport recovery.
4. A timed-out `turn/start` is reconciled using its stable client message ID.
   A delivered start is not repeated; a confirmed-absent start is retried once;
   an unknown result remains pending rather than being dropped or duplicated.
5. Detached inactivity recovery catches and reports its own failure, completes
   local waiting deterministically, and does not create an unhandled promise
   rejection.
6. User-visible automatic recovery status describes the actual outcome; it
   must not say that a thread resumed before resume succeeds.

## Safety controls

- Preserve the existing stable client message ID across reconciliation and any
  confirmed-absent retry.
- Bound recovery and history reads with the existing timeouts.
- Do not change cross-device message schemas or persisted data.
- Cover each timeout/failure branch with deterministic tests before changing
  production behavior.
- Rollback is the staged hardening diff; no migration or external deployment is
  part of this workflow.

## Acceptance criteria

| ID | Criterion | Evidence |
| --- | --- | --- |
| H1 | Steer timeout plus unavailable history never duplicates a message that was accepted. | Router/host regression test. |
| H2 | A recovery exception leaves the original steer input preserved and avoids a false queued status. | Router/host regression test. |
| H3 | Start timeout reconciles delivered, absent, and unknown outcomes without drop or blind duplicate. | App-server/host regression tests. |
| H4 | Inactivity recovery rejection is handled and completes deterministically. | App-server client fake-timer test. |
| H5 | Recovery visibility reports resume success or failure accurately. | App-server client test. |
| H6 | Targeted Codex suites, CLI typecheck, diff checks, and workflow checks pass. | Validation ledger. |
