# Finish Review: `client-long-session-performance`

## Summary

- Completed T1-T7 of the client long-Session performance correction on the
  `quiet-forest` worktree from personal `dev`.
- Corrected draft lifecycle flushes and incremental draft persistence/row
  projection, added 24 ms per-Session socket coalescing, replaced normal-path
  full message sorting with an indexed ordered collection, and added a
  correctness-first idle visible-tail staging/rebase path.
- Preserved the `session-drafts` key/shape, server history, protocol, encryption,
  authentication, cross-device synchronization, demand-driven older paging,
  hidden-cache limits, Session/turn projections, and existing client behavior.
- No dependency install, app install/replacement, commit, push, PR, tracker
  mutation, distribution, message send, or live draft mutation was performed.

## Verification

- T1-T6 focused implementation gate: 29 files, 234 tests passed.
- Post-review affected gate: 17 files, 83 tests passed.
- Happy App and Happy Server exact package typechecks passed using temporary
  ignored executable/workspace links that were removed afterward.
- Complete Happy App suite: 191 files/1,631 tests collected; 187 files/1,616
  tests passed. Four unmodified baseline files retain 15 named failures; the
  user explicitly accepted this gap on `2026-08-28`.
- Workflow adoption validation, 14 workflow-core tests, 14 workflow-CI tests,
  strict active audit, and tracked/untracked whitespace checks passed.
- The exact app-only no-sign workspace Tauri bundle built and launched without
  replacing `/Applications/Happy (dev).app`. Its arm64 executable SHA-256 is
  `895ae821e66280145885cb371e0a87213aa87a5a97495d8fab8cc6a1d6728689`.
- Ten idle samples held the validation app at 94,896 KiB RSS and its associated
  WebContent at 131,888-131,904 KiB, both at 0.0% CPU.
- Packaged long/short input P95, streaming/scroll smoke, and three eligible
  rebase-cycle RSS evidence remain unavailable because approved Computer Use
  and window capture could not bind/capture the Tauri validation window. The
  user explicitly accepted this evidence gap on `2026-08-28`; AC15 budgets are
  intentionally not marked passed.

## Whole-diff review

- Passed with no unresolved blocking, high, or medium finding.
- Review covered draft Session-switch/background/unmount failure semantics,
  persistence atomicity and compatibility, scheduler FIFO/generation/deletion
  races, ordered-message identity/order/fallback behavior, rebase boundary and
  staged reducer equivalence, atomic commit/rollback/cursor restoration,
  multi-view scroll/composer protections, diagnostics allocation boundaries,
  and independent rollback seams.
- Review receipt is recorded as `review=passed`; the post-review 83-test gate is
  green.

## Rollback or mitigation

- T2 draft lifecycle can be reverted independently to the prior hook path.
- T3 draft persistence/projection can restore the aggregate list rebuild while
  retaining T2.
- T4 can remove the scheduler and restore immediate per-message draining
  without stored-state or protocol changes.
- T5 can route all ordered updates through its retained full-rebuild fallback
  while keeping T4.
- T6 can disable visible-tail rebase scheduling/eligibility; hidden-cache
  eviction and T2-T5 remain independent.
- Rebase failures already retain the live cache, while draft persistence
  failures retain the latest value for retry. The two accepted verification
  gaps remain visible in `validation.md` for any later manual rerun.

## Lessons promoted

- `CONTEXT.md`: none; the implementation contracts are feature-specific and
  already durable in the accepted spec/tasks.
- `docs/ARCHITECTURE.md` or ADR: none; no protocol, persistence-format, server,
  or repository-wide architecture decision changed.
- Skill/workflow rule: none; the capture limitation is machine permission/tool
  state rather than a reusable repository rule.

## Follow-up

- A commit remains optional and requires explicit authorization. If authorized,
  keep product code and workflow evidence in one atomic commit and pass staged
  workflow CI first.
- Installation, signing, release, push, PR creation, and distribution remain
  separate explicit workflows.
- The four unrelated full-suite baseline files may be repaired separately.
- A later manual packaged run may fill the accepted AC15 typing/scroll/rebase
  evidence gap without reopening the completed implementation.
