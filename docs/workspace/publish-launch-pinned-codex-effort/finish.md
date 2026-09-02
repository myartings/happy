# Finish Review: `publish-launch-pinned-codex-effort`

## Summary

Issue #103 is implemented as one atomic CLI/App candidate. Fresh Codex launch
now creates one no-turn thread with the requested model and effort, publishes
the complete App Server-confirmed pair durably to Session and daemon before
Happy can process the first message, and preserves explicit first-turn route
overrides on the same thread.

## Verification

- Focused CLI remediation suites: 92/92 passed.
- Complete CLI build/unit suite: 1031/1031 passed.
- Candidate-bound configured check run
  `afbfd0e4-4292-4718-a439-83ec7f794979`: 8/9 commands passed for candidate
  `5c0d3a1577b4…`; command index 5 contains only the three user-accepted
  `core.autocrlf=true` workflow-runtime fixture failures.
- App 1951/1951 and Server 112/112 passed inside the candidate check; App and
  Server typechecks, workflow validators, strict audit, and diff check passed.

## Whole-diff review

- Fifth independent Spec review: accepted with no findings.
- Fifth independent Standards review: accepted with gaps and no
  candidate-blocking findings. The only formal gap is the already accepted
  workflow fixture set; lack of a real-server end-to-end run was noted as
  non-blocking.

## Rollback or mitigation

Rollback is code-only: remove eager fresh-thread initialization, launch-effort
thread configuration, pending/effective route projection, and offline readiness
gating together. No schema migration, data rewrite, server rollout, or client
installation is involved. Terminal authentication/cancellation rejects before
Codex/MCP resources are created and cancels the owned reconnect handle.

## Lessons promoted

- `CONTEXT.md`: none; the behavior is feature-specific and covered by code/spec.
- `docs/ARCHITECTURE.md` or ADR: none; no durable architectural boundary changed.
- Skill/workflow rule: none; the accepted `core.autocrlf=true` fixture defect is
  existing workflow work, not reusable Issue #103 guidance.

## Follow-up

- `blocking-prerequisite-defect`, accepted as a candidate-external gap: repair
  the three `core.autocrlf=true` merge/archive workflow fixtures in a separate
  workflow-owned slice.
- `optional-hardening-or-new-threat-model`, non-blocking: add a real-server
  end-to-end launch smoke test if a stable test environment becomes available.
- Tracker recommendation only: after an authorized delivery commit/PR, link the
  candidate evidence to Issue #103 and close it when merged. No tracker mutation
  was authorized or performed in this session.
