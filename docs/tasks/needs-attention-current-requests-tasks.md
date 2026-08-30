# Needs Attention Current Requests — Tasks

## T1 — Current-request projection

Status: complete

- Scope: Add the App feature module that derives bounded permission and
  answer-required reasons from current encrypted agent state and carries them
  in Session row data.
- Dependencies: existing `AgentState`, pending communication selector, Session
  `agentStateVersion`.
- Ownership: Happy App feature/sync projection files.
- Parallel candidate: no; this is the shared contract for every later task.
- Acceptance: criteria 1-2 and the metadata-safety part of 3.
- Validation: focused pure projection tests.

## T2 — List membership, ordering, and reason presentation

Status: complete

- Scope: Promote communication reasons across project/flat/active inputs,
  deduplicate by Session ID, preserve offline membership and generic-unread
  compatibility, and render the localized primary reason in existing row
  variants.
- Dependencies: T1 projection.
- Ownership: visible-list utilities, Session row components, localization, and
  their focused tests.
- Parallel candidate: no; row behavior and list ordering share the projection
  shape and overlapping files.
- Acceptance: criteria 1-3 and disabled-feature portion of 7.
- Validation: visible-list and row presentation/rendering tests.

## T3 — Conservative navigation focus

Status: complete

- Scope: Carry a bounded focus hint through the existing Session route, resolve
  it against latest synchronized state at the destination, focus an existing
  safe target when valid, and otherwise open general current state.
- Dependencies: T1 projection and existing message/banner targets.
- Ownership: navigation helper, Session route/view integration, focus resolver,
  and focused tests.
- Parallel candidate: no; it touches the same projection contract and must land
  after its shape is stable.
- Acceptance: criteria 4-6.
- Validation: pure resolver permutations and route/navigation interaction tests
  asserting zero response/state effects.

## T4 — Whole-slice regression and evidence

Status: complete

- Scope: Run the accepted focused suite, pending communication regression,
  Happy App typecheck, and applicable workflow checks; map results to every
  criterion.
- Dependencies: T1-T3.
- Ownership: current Root.
- Parallel candidate: no; final candidate-bound verification.
- Acceptance: all criteria, including excluded Goal/terminal/protocol behavior.
- Validation: commands in the accepted spec and Workspace validation record.
- Review remediation: setting-aware row policy now gates structured reason,
  localized action, and focus hint together; destination tool join keys resolve
  to current transcript message IDs before scrolling.
- Second-review remediation: Session route versions now parse only canonical
  non-negative decimal safe integers; every malformed representation fails
  closed to general current state.
- Third-review remediation: a present current-request projection now owns
  severity priority over stale legacy Session state, while projection-absent
  legacy permission rows retain their existing priority.
- Fourth-review remediation: supported older inline forms without explicit
  `toolUseId` reuse their communication ID as the established transcript join
  key; fallback forms and exact message-ID validation remain unchanged.
- Final evidence: candidate `9c71abfd…` is bound to accepted-gap check run
  `782801d8-569e-4f7f-a7c7-4ebcf580d881`; fresh capable Spec and Standards
  review both accepted it with no findings.
