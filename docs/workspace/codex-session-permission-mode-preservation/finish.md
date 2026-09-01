# Finish Review: `codex-session-permission-mode-preservation`

## Summary

Preserved one Codex session's effective permission mode across Happy client
replies. The App now shares one resolver for composer projection and outbound
metadata, legacy YOLO recovery requires an absent newer field plus exact Codex
boolean evidence, and the CLI publishes the concrete launch mode in initial
encrypted session metadata.

## Verification

- Review-remediation RED reproduced non-Codex legacy-marker elevation; the
  internal flavor guard made the focused resolver test GREEN.
- Resolver/outbound authorization matrix: 36/36 passed, including false, null,
  absent, non-boolean, non-Codex, explicit reset, and Auto/Default/YOLO cases.
- Nearest App regression suite: 59/59 passed; focused CLI metadata/remote-mode
  suite: 19/19 passed; App and CLI typechecks passed.
- Final configured run `6b493757-9fdb-47f2-9712-b97e7206cbc8` bound candidate
  `aefae2341ca433f1074f8ae781eceecf6fd86595870263c79b9caeb33c48302b`:
  7/9 commands passed. The user explicitly accepted command indexes 2 and 3:
  one untouched Studio wiring assertion and two untouched Windows local-storage
  route assertions. A transient blob timeout passed focused 9/9 and in the
  fresh full rerun.

## Whole-diff review

Fresh independent capable Spec and Standards reviews accepted the same final
candidate with no actionable findings. The earlier review blocker produced the
Codex flavor guard and complete authorization-boundary test matrix before the
candidate was repinned and rereviewed.

## Rollback or mitigation

Revert the isolated App resolver/consumer changes and CLI initial metadata
field to restore prior behavior. No server schema, migration, native project,
credential, deployment, or cleanup step is involved. Existing App-side mode
synchronization remains available during rollback.

## Lessons promoted

- `docs/specs/codex-session-permission-mode-preservation.md`: retains the
  reusable per-session precedence and compatibility contract.
- `CONTEXT.md`: no change required; its session-protocol and cross-device risk
  boundary already applies.
- `docs/ARCHITECTURE.md` or ADR: not required; this refines an existing optional
  encrypted metadata contract without a new architecture decision.
- Skill/workflow rule: not required; focused regression tests are the durable
  enforcement mechanism.

## Follow-up

- Non-blocking baseline-quality candidates: repair the untouched Studio
  source-string assertion and the two Windows local-storage route tests in
  separately accepted scopes. They are unrelated quality work, not Issue #87
  acceptance gaps.
- Installed Android/iOS handoff reproduction remains an optional final product
  signal when devices are available; no install or release was authorized.
- Recommended tracker reconciliation after delivery: link the eventual commit
  or PR to Issue #87, summarize the verified fix, then remove `needs-triage` and
  close when accepted. No tracker mutation is authorized in this session.
- Commit, push, PR, release, installation, and worktree cleanup remain pending
  explicit authorization.
