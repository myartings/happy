# Session Phase-Aware History Tasks

## Objective

Implement `docs/specs/session-phase-history.md` as one backward-compatible
vertical slice without changing provider execution or stored-history retention.

## Dependency graph

```text
T1 Optional phase contract and Codex mapping
└─ T2 App normalization and phase-aware grouping
   └─ T3 Integration verification and review
```

## T1 — Optional phase contract and Codex mapping

**Status:** Completed.

**Scope:** Happy Wire text-event schema and the historical/live Codex mapping
boundaries.

**Acceptance:** supported phases survive mapping; unsupported or absent values
remain absent; old envelopes remain valid.

**Validation:** focused Happy Wire and Codex mapper/client tests.

## T2 — App normalization and phase-aware grouping

**Status:** Completed.

**Depends on:** T1.

**Scope:** App normalized message, reducer message, display message type, and
`groupMessagesForDisplay` behavior.

**Acceptance:** final answers remain visible; only explicit commentary is
eligible for agent-work folding; unclassified text is preserved; tool grouping
and interactive questions retain their current behavior.

**Validation:** focused raw-message, reducer, and grouped-message tests.

## T3 — Integration verification and review

**Status:** Completed with explicitly accepted unrelated baseline gaps.

**Depends on:** T2.

**Scope:** whole diff, compatibility evidence, typechecks, relevant suites,
strict workflow audit, and independent review required by the protocol risk
control.

**Acceptance:** all specification criteria have deterministic evidence and no
unrelated product behavior changes.

**Validation:** Happy Wire/CLI/App typechecks, focused tests, applicable full
test families, workflow checks, review, and diff inspection.

## Boundaries

- Allowed product files are limited to Happy Wire session protocol/tests,
  Codex mapping/tests, App normalization/reducer/message grouping/tests.
- Server routes, encryption, storage schema, permissions, authentication,
  generated paths, and protected paths are out of scope.
- This is immediate single-owner local work; no tracker item is required.
