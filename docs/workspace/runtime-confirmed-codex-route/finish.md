# Finish Review: `runtime-confirmed-codex-route`

## Summary

Issue #80 now publishes an optional atomic effective Codex model/reasoning pair
only from App Server-confirmed lifecycle evidence. Requested-state `modelMode`
remains compatible; missing, malformed, reset, partial, stale, unbound, or
failed-reconnect evidence clears both effective fields.

## Verification

- Focused remediation suite: 6 files, 73/73 passed after CLI build/typecheck.
- Complete Happy CLI suite: 98 files, 985/985 passed.
- Final structured staged run: `e45fcc74-5e97-432e-8390-4dc90ec8f986`.
- Check gate: `accepted_gaps`; seven of nine commands passed. The owner accepted
  index 2's unchanged App parallel-load large-blob timeout and index 5's three
  pre-existing `core.autocrlf=true` raw-byte fingerprint failures.
- Candidate-local launcher v0.5 fixture proves Luna Max `verified`, missing or
  partial evidence `unobservable`, and another complete route `mismatch`.

## Whole-diff review

- Independent Spec axis: passed; AC1-AC12 satisfied.
- Independent Standards axis: passed; no blocking correctness, regression,
  security/privacy, maintainability, atomicity, interruption, or test findings.

## Rollback or mitigation

- Remove the two optional metadata fields and the focused Codex metadata helper
  calls to stop publication without migrating persisted Session metadata.
- Remove `/session-effective-route` and its control-client call to disable only
  the daemon projection; existing daemon session management remains intact.
- Runtime projection is best-effort, generation-bound, non-blocking, and
  latest-state coalesced, so an unavailable daemon cannot delay user turns.

## Lessons promoted

- `CONTEXT.md`: none; the learning is feature-specific.
- `docs/ARCHITECTURE.md` or ADR: none; no new cross-system architecture policy.
- Skill/workflow rule: none.

## Follow-up

- `unrelated-refactor-or-quality-suggestion` (non-blocking): when a future
  launcher parser version changes this contract, add a separately versioned
  compatibility fixture instead of mutating the frozen v0.5 fixture. No tracker
  mutation was authorized or performed.
- Issue #80 is ready for a delivery commit/PR and closure recommendation after
  separate authorization; this session did not commit, push, open a PR, comment,
  label, or close the Issue.
