# Codex Session Permission Mode Preservation Tasks

## Delivery slice

One high-risk Issue #87 slice. These are serial internal work units, not child
Issues or independently deliverable outcomes.

## T1 - Shared effective-mode contract (RED)

- Scope: add focused public-interface tests for explicit synchronized modes,
  explicit null, exact legacy true, false/absent/ambiguous markers, non-Codex
  sessions, and CLI compatibility rejection.
- Likely files: Happy App session-mode resolver and `messageMeta` tests.
- Depends on: accepted spec and decisions D1-D2.
- Ownership: current Root; not a parallel candidate because later tasks consume
  the resolver contract.
- Acceptance: AC1-AC5 fail for the current defect and preserve existing
  unsupported-mode behavior.
- Validation: focused Vitest invocation for the resolver/message-meta tests.

## T2 - Converge composer and outbound resolution (GREEN)

- Scope: introduce the smallest shared effective Codex permission resolver and
  use it in both composer projection and outbound message metadata without
  changing Rig or non-Codex behavior.
- Likely files: `sources/sync/`, `SessionView.tsx`, focused tests.
- Depends on: T1.
- Ownership: current Root; serial.
- Acceptance: AC1-AC5 pass, including explicit-null suppression of the legacy
  marker and fail-closed unsupported modes.
- Validation: focused App tests and Happy App typecheck.

## T3 - Initial launch-mode persistence (RED to GREEN)

- Scope: publish the concrete Codex launch mode in initial encrypted session
  metadata and test Auto and YOLO creation/reconnect shapes. Retain App-side
  later mode synchronization.
- Likely files: Happy CLI metadata creation/run-Codex seam and tests; App start
  tests only if needed to prove the handoff contract.
- Depends on: decisions D3-D4; can begin after T1 but integrates after T2.
- Ownership: current Root; serial due to shared final candidate and high-risk
  metadata contract.
- Acceptance: AC6-AC8 pass without server or native changes.
- Validation: focused CLI metadata/Codex tests and existing App creation/storage
  synchronization tests.

## T4 - Whole-slice regression and verification

- Scope: run related App/CLI regressions, typecheck, applicable configured
  workflow checks, then independent high-risk review of one pinned candidate.
- Depends on: T2-T3.
- Ownership: current Root for checks; independent reviewers at the review gate.
- Acceptance: AC9-AC10 pass; no default, policy, Rig, Claude, server, native,
  tracker, release, or installation changes.
- Validation: recorded workflow check and two-axis review receipts.
