# Goal

Fix https://github.com/myartings/happy/issues/108 so a daemon bundle handoff under a systemd user service with `KillMode=control-group` does not silently terminate active daemon-spawned sessions.

# Accepted scope

- Work only in the personal repository `myartings/happy` on this dedicated branch/worktree.
- Preserve active Happy session identity and agent-native thread identity across daemon bundle replacement, either by keeping session processes alive or by reliable automatic recovery.
- Cover the two-concurrent-session acceptance scenario from Issue #108.
- Follow repository `AGENTS.md`, the personal-feature lifecycle, TDD where applicable, and the risk gate for session/process lifecycle changes.

# Completed work

- Root cause was diagnosed from runtime evidence: rebuilding the source-linked CLI rewrote `packages/happy-cli/dist`; the daemon detected the bundle mtime change and exited for handoff.
- The systemd user service uses `Restart=always` and `KillMode=control-group`, so exiting the daemon caused its daemon-spawned child sessions to be killed with the old service cgroup.
- The affected Codex threads remained manually resumable, showing that conversation state was intact and process ownership/lifecycle was the failure boundary.
- The bounded bug report was created as `myartings/happy#108`.
- The mistakenly created upstream issue `slopus/happy#1751` was closed; do not reopen or mutate it.

# Validation

- Observed two active daemon-spawned Codex sessions disappear during the same daemon bundle handoff.
- Daemon log contained `Daemon bundle replaced on disk, handing off to new daemon` followed by a clean exit.
- No agent error, OOM, or user stop explained the session loss.
- Both original Codex thread IDs were successfully resumed manually after the incident.

# Dirty state

- This worktree was created from clean `dev` at `1e03026a5febe5815a47687c7b220aa6c6dba758`.
- This `handoff.md` file is intentional launch/resume evidence and is currently the only new file in this worktree.
- A separate `daemon-upgrade-recovery` worktree contains unrelated/uncommitted work; do not modify, reuse, or delete it.

# Blockers

None known.

# Stop conditions

- Do not push, open a PR, merge, release, or mutate Issues without explicit user authorization.
- Do not modify the official upstream repository or upstream Issue #1751.
- Do not overwrite or absorb the dirty `daemon-upgrade-recovery` worktree.
- Avoid rebuilding the live source-linked CLI bundle while unrelated daemon-spawned sessions are active unless the reproduction is isolated and controlled.

# Next action

Read Issue #108 and repository instructions, initialize the accepted personal-feature workflow for this branch, define a controlled failing test for the systemd/cgroup handoff boundary, then implement and verify the smallest robust fix.
