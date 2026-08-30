# Journal: `session-transport-reliability`

## `2026-08-30`

- Started workflow.
- Added PRD, feature spec, task queue, accepted decisions, and cleared-with-controls risk assessment.
- Passed acceptance, decisions, risk, and scoping gates; entered implementation.
- Installed dependencies and ran focused CLI/server/wire baselines. Existing tests pass, but the required failure matrix remains materially incomplete.
- RED/GREEN: fixed permanent outbox reorder for backlogs larger than 50 by switching tail batching to FIFO.
- RED/GREEN: fixed duplicate delivery when a Socket update wins an in-flight REST catch-up; receive cursor now advances only as each contiguous record is consumed.
- Added deterministic out-of-order/corrupt-record, ack-loss replay, daemon restart persistence, and bounded dead-RPC tests.
- Replaced the resource-sensitive 20-way daemon child burst with five bounded 3-way rounds and added a real new-PID restart/resume-state test; full authenticated daemon integration now passes.
- Real Codex integration was attempted but current Codex 0.150.1 emitted no first-turn response, so it never reached the resume action; retained as a documented external evidence limit.
- Verification RED/GREEN: catch-up now continues when live delivery overtakes an entirely stale `hasMore` page, preventing a missed later page.
- Review RED/GREEN: a 2xx response must acknowledge every batch localId before the CLI deletes the outbox batch; malformed success responses now retry idempotently.
