# Finish Review: `preserve-launch-pinned-codex-route`

## Summary

Issue #99 is implemented as one atomic App/CLI route-preservation Slice. A
complete, valid launch-pinned Codex model/effort pair now prevents absent first
message defaults from replacing that route; explicit per-message selections
still win independently. The CLI uses one resolved route for App Server
thread/turn settings and effective daemon projection.

## Verification

- Focused App resolver suite passed 37/37 after RED coverage for seven malformed
  effective-route pairs.
- Focused CLI route/App Server/projection suites passed 68/68.
- App and CLI TypeScript checks passed.
- Structured staged check run `417d33d9-b69b-4166-9c92-922a397e31a2`
  passed seven of nine configured commands. The user explicitly accepted the
  two candidate-external gaps: the full-parallel large-blob timeout (isolated
  suite 9/9) and unchanged `core.autocrlf=true` workflow fixtures (LF control
  passed).
- AC1-AC8 are verified in `validation.md`.

## Whole-diff review

The unchanged staged candidate received independent parallel Spec and Standards
PASS conclusions. Both reviewers confirmed that malformed evidence fails closed
and that candidate-bound evidence covers absent first-message overrides through
actual App Server thread/turn requests and daemon projection. No blocking or
actionable findings remain.

## Rollback or mitigation

Revert the resolver predicate, route/projection helpers, their `runCodex`
call-site wiring, and focused tests as one candidate. There is no schema change,
migration, persisted-data rewrite, deployment step, or destructive operation.

## Lessons promoted

- `CONTEXT.md`: none; the behavior is feature-specific and fully captured by the
  accepted Spec.
- `docs/ARCHITECTURE.md` or ADR: none; no new architectural policy was created.
- Skill/workflow rule: none; no reusable workflow defect was established.

## Follow-up

No separate tracked work is required for this Slice. The reviewers noted that
the equivalent App and CLI validators are duplicated across package boundaries;
centralization is a non-blocking maintenance observation, not part of Issue #99.
Recommend linking and closing Issue #99 when an authorized PR is delivered.
No commit, push, PR creation, Issue comment, label, or closure is authorized by
this finish record.
