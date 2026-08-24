# Finish Review: `session-phase-history`

## Summary

Implemented phase-aware synchronized session history. Supported Codex
`commentary` and `final_answer` values now survive the Wire, live and historical
CLI mapping, App normalization, reducer, and display pipeline. Agent-work
grouping requires an explicit final answer and remains conservative whenever
assistant text is unclassified.

All acceptance criteria passed: supported phases are validated and propagated;
final answers remain visible; only explicit commentary and eligible tools are
folded; unclassified or final-less turns stay expanded; existing interactive
question, active-turn, thinking, and tool-group behavior remains covered.

## Verification

- Happy Wire full suite: 27 passed.
- Codex mapper suite: 31 passed.
- Focused Codex App Server phase test: passed.
- Focused App phase suites: 143 passed.
- Happy Wire, CLI, App, and Server typechecks: passed where configured/run.
- Whole-diff semantic review and `git diff --check`: passed.
- The user explicitly accepted the unrelated App/Server baseline failures and
  Windows test-harness limitations recorded in `validation.md`.

## Whole-diff review

Passed with no blocking findings. The optional protocol field is bounded to
`commentary | final_answer`, unknown producer values are omitted, older payloads
remain valid, and display grouping never mutates or deletes source messages.
Changed product files remain within the accepted Wire, Codex mapping, App
normalization/reducer, and grouping boundaries.

## Rollback or mitigation

Remove phase emission/consumption and restore the previous grouping predicate.
Existing stored envelopes remain readable because `phase` is optional. No
database migration, server deployment, credential change, external tracker
mutation, installation, or push occurred.

## Lessons promoted

- `CONTEXT.md`: not required; the accepted compatibility policy is recorded in
  the feature spec and decisions log.
- `docs/ARCHITECTURE.md` or ADR: not required; this is an additive protocol
  field and conservative presentation rule, not a new system boundary.
- Skill/workflow rule: not required; no reusable workflow change was found.

## Follow-up

- Commit remains pending because no feature commit was requested.
- The two unrelated full-suite baseline failures can be fixed in separate,
  scoped work.
