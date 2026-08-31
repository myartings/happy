# Finish Review: `needs-attention-current-requests`

## Summary

- Delivered the accepted Issue #70 App-only slice: current permission and
  communication requests now project into one deduplicated, offline-capable
  Needs Attention section with localized reason/action text.
- Navigation remains side-effect free. Exact focus requires current
  version/source identity and an existing transcript or fallback-form target;
  every invalid or stale case opens general current Session state.
- The existing `needsAttentionSessionsEnabled` setting restores legacy list
  presentation and navigation without migration.

## Verification

- Final staged candidate:
  `13dde813971b5434ad3906841052ce7d22bba48f197290e9e3957d29bf754c7a`
  against base `cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a`.
- Focused suite: 8 files / 93 tests passed; Happy App typecheck and staged
  whitespace validation passed.
- Applicable run `7d707cfd-0dbc-420b-9506-3855e6f8ec8b`: both typechecks,
  Happy Server 112/112, workflow state upgrade, workflow validation,
  validation tests, and strict repository audit passed.
- Check status is `accepted_gaps`: only the user-accepted baseline failures
  remained—15 Studio assertions in three named files and two workflow archive
  fixtures. The verified base reproduces all of them; no candidate failure was
  accepted.

## Whole-diff review

- Fresh independent capable Spec and Standards axes both accepted exact
  candidate `13dde813971b5434ad3906841052ce7d22bba48f197290e9e3957d29bf754c7a`
  and review diff `2e35bb0ee255c3c67e76a27e37faaf66b91ba8f596e3e60c5b6db17691a638b2`
  with no blocking or non-blocking finding.
- Review covered the full diff and confirmed setting-off rollback, metadata
  safety, permission/answer/unread ordering, localized accessibility text,
  strict route parsing, stale-state fail-closed behavior, actual transcript
  message-ID resolution, and older inline-form compatibility.
- Four earlier review finding sets were remediated and rechecked before this
  final accepted review; no provider, protocol, response, Goal, terminal,
  notification, agent-state, or settings mutation path was added.

## Rollback or mitigation

- Operational rollback: disable `needsAttentionSessionsEnabled` to restore the
  ordinary list, legacy row state presentation, and ordinary Session routes.
- Code rollback: revert the candidate as one App-only slice. No schema or data
  migration, provider change, or server rollback is required.
- Safety mitigation remains destination validation of canonical route version,
  exact current source/kind, and an existing current target before exact focus.

## Lessons promoted

- `CONTEXT.md`: none; the learning is feature-local and captured in the accepted
  spec plus focused regressions.
- `docs/ARCHITECTURE.md` or ADR: none; no new architectural decision or durable
  cross-feature boundary was introduced.
- Skill/workflow rule: none; the review findings were implementation-specific
  compatibility edges, now enforced by tests.

## Follow-up

- No candidate-owned implementation follow-up remains.
- Issue #70 was re-read as OPEN with `needs-triage`, no comments, and no
  assignee. Recommended delivery is a reviewed PR containing `Closes #70`;
  tracker mutation waits for explicit authorization and merge.
- The accepted Studio and workflow fixture baseline gaps remain outside this
  slice and should only be addressed as separately scoped work.
