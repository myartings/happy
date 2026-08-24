# Client Performance Bounded State Tasks

## T1 — Establish the baseline

Status: completed.

- Scope: generated performance fixtures, deterministic work counters, and a
  benchmark report for Session and message scales in the accepted matrix.
- Allowed areas: focused performance utilities/tests and workflow evidence.
- Acceptance: baseline identifies the dominant full-collection paths without
  enabling production telemetry.
- Validation: focused benchmark test command plus recorded output.

## T2 — Incremental Session index

Status: completed for stable row projection; residual collection ordering scan
is recorded for post-install profiling.

- Depends on: T1.
- Scope: normalized row projections, stable unchanged row identities, and
  incremental ordering/grouping updates behind a narrow storage seam.
- Acceptance: unrelated Session updates reuse unchanged projections and retain
  flat/grouped/search/archive/pin/favorite behavior.
- Validation: projection unit tests, existing Session-list utility tests, app
  typecheck.

## T3 — Incremental turn presentation

Status: completed.

- Depends on: T1.
- Scope: reuse completed-turn display projections, recompute only the active
  turn/boundary, generate copy content on demand, and avoid target indexing
  without a target.
- Acceptance: active streaming updates do not rescan completed history while
  grouping and copy output remain behaviorally equivalent.
- Validation: grouped-message, copy, target, and ChatList-focused tests.

## T4 — Bound hidden conversation caches

Status: completed.

- Depends on: T1 and T3.
- Scope: count/estimated-byte budget for fully hidden Session caches, integrated
  with current backward pagination and protected send/outbox work.
- Acceptance: oversized hidden caches are evicted as cursor-consistent units,
  durable history remains retrievable, and protected work is never discarded.
- Validation: cache-policy, target-navigation, and existing pagination tests.

## T5 — Tune rendering from evidence

Status: completed for deterministic settings and component behavior; interactive
browser/IME smoke is unavailable in the current environment.

- Depends on: T2–T4.
- Scope: Chat/Session list window and scroll-event settings only; retain stable
  keys and anchoring behavior.
- Acceptance: recorded fixtures show reduced mounted work without scroll,
  streaming, prompt-navigation, or IME regressions.
- Validation: component tests plus desktop/native smoke evidence.

## T6 — Integration verification and escalation decision

Status: completed with recorded baseline-suite and runtime-smoke gaps. No
protocol escalation is justified until post-install profiling.

- Depends on: T2–T5.
- Scope: rerun the full fixture matrix and applicable repository checks.
- Acceptance: record before/after counters and remaining hotspots. Protocol work
  is opened only if evidence attributes a material residual bottleneck to the
  existing transport contract.
- Validation: Happy app focused/full tests, typecheck, workflow checks, and
  whole-diff review.
