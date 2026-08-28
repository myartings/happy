# Client Long-Session Performance — T1-T7 Implementation and Acceptance

- Date: `2026-08-28`
- Agent/scope: primary Codex session; research reconciliation, specification,
  T1-T7 implementation, verification, review, workspace bundle, and finish
- Branch/worktree: `quiet-forest` at
  `/Users/myartings/workspace/happy/.dev/worktree/quiet-forest`
- Commit: pending; none authorized

## Outcome

Implemented the accepted residual client-performance correction without a
server, protocol, persistence-format, encryption, authentication, or durable
history change. The client now avoids intermediate draft lifecycle writes,
patches one draft row instead of rebuilding the Session list, coalesces socket
bursts per Session for 24 ms, updates the ordered message collection without a
normal-path full sort, and can safely replace an eligible idle visible tail
after staging and validating complete boundaries and all concurrency cursors.

## Evidence

- Focused T1-T6 gate: 29 files, 234 tests passed.
- Post-review affected gate: 17 files, 83 tests passed.
- Happy App and Happy Server typechecks passed.
- Workflow adoption, core 14/14, CI 14/14, strict audit, and whitespace checks
  passed.
- Whole-diff review passed with no unresolved blocking/high/medium finding.
- Exact app-only no-sign workspace bundle built, launched, and remained idle at
  94,896 KiB app RSS plus 131,888-131,904 KiB WebContent RSS with 0.0% sampled
  CPU. The installed app was neither replaced nor interrupted.

## Accepted gaps

The user explicitly accepted both gaps on `2026-08-28`:

- Complete Happy App suite has four unmodified baseline files/15 failures; 187
  files and 1,616 tests pass.
- Approved desktop automation and capture could not bind/capture the Tauri
  window, so packaged long/short typing P95, streaming/scroll smoke, and three
  rebase-cycle RSS budgets remain unproven. Startup/idle evidence is valid, but
  AC15 is not described as a budget pass.

## Safety and handoff

No message was sent and no live draft was created or changed. Every
validation-only process was closed; the temporary uniquely named copy was
moved to Trash; installed PID 70203 remained running at validation close. No
dependency install, app install, commit, push, PR, tracker mutation, signing,
release, or distribution was performed.

The next optional action is an explicitly authorized atomic commit after
staged workflow CI. Installation/release and repairs to the unrelated baseline
tests remain separate workflows.
