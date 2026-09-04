# Daemon Bundle Handoff Session Continuity

## Boundary

This contract covers daemon-owned Happy CLI Session processes when the daemon
runs inside a systemd user service. It preserves the existing bundle-mtime
handoff and Session identities without changing Server, wire, App, Agent, or
systemd-unit contracts.

## Terms

- **Daemon generation**: one running Happy daemon process and its local control
  server ownership interval.
- **Protected Session**: a daemon-owned Session placed outside the daemon
  service's cgroup kill domain while remaining explicitly stoppable.
- **Adoption record**: local, bounded evidence that a protected Session process
  belongs to Happy and may be tracked by a replacement daemon generation.

## Required behavior

1. On Linux, a daemon executing under systemd starts regular daemon-owned
   Sessions in a separate transient user scope. The launched Happy process
   remains the returned PID and a process-group leader.
2. If the transient scope cannot be established, spawning fails explicitly
   before Happy reports a successful Session. The daemon does not silently fall
   back to its own service cgroup.
3. Daemons outside systemd and non-Linux daemons retain the direct detached
   spawn path. Existing tmux behavior is unchanged.
4. Once a protected Session reports its Happy Session metadata and encryption
   state, the daemon persists a daemon-ownership marker and a process identity
   that can distinguish the live process from a later reuse of the same PID.
5. At startup, a replacement daemon adopts a persisted protected Session only
   when the platform supports the identity check, the record says it was
   daemon-owned and protected, the process is still alive, and its current
   identity equals the persisted identity. Otherwise the record remains resume
   history only and is not exposed as a live child.
6. An adopted Session appears in daemon list output with its original Happy
   Session ID and Agent-native identity. Explicit stop targets its complete
   process group just as it did before handoff.
7. Bundle replacement releases the old daemon generation and allows its PID to
   change without signalling protected Sessions. Each surviving Session keeps
   running; no automatic duplicate process or provider resume is created.

## Errors and edge cases

- A missing `systemd-run`, inaccessible user manager, or transient-scope start
  failure returns a bounded spawn error and leaves no reported Session.
- A Session that exits before its startup webhook is not reported as started;
  the pending spawn settles without waiting for the full webhook timeout.
- Missing, malformed, expired, non-daemon-owned, unprotected, dead, or
  identity-mismatched adoption records are never treated as live Sessions.
- An adopted process that exits is pruned by the existing heartbeat path.
- Direct terminal Sessions are not adopted from daemon persistence.

## Compatibility and operational controls

- Persisted Session fields added for adoption are optional so existing records
  remain readable and useful for manual resume.
- No secrets, environment contents, command-line arguments, or conversation
  payloads are added to adoption evidence.
- The daemon's explicit shutdown and bundle handoff retain their current
  cross-platform behavior; only systemd-owned Session placement and safe
  replacement-generation tracking change.
- Controlled systemd tests use disposable transient units/scopes and must not
  replace the installed live CLI bundle.

## Risk assessment

Status: cleared with controls. False success could still kill every active
Session during one handoff; false adoption could signal an unrelated reused PID.
The change is source-reversible and has no migration, Server, or wire effect.

Controls: fail closed when systemd isolation cannot be established; use
argument-array spawning rather than a shell; persist only an optional
daemon-owned protection marker plus non-secret process identity; require exact
identity match before adoption; preserve explicit process-group stop semantics;
test two concurrent Sessions, failure fallback, stale/PID-reuse rejection,
non-systemd compatibility, and whole-diff forbidden paths; obtain independent
high-risk review. Any unprotected successful systemd spawn, best-effort live
adoption, duplicate Session process, identity change, or Server/wire/App change
is a stop condition.

## Acceptance criteria

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | A systemd-managed daemon places a daemon-owned Session outside its service cgroup and keeps the Happy process PID as the tracked process-group leader. | Focused spawn-unit test plus disposable transient-unit probe. |
| AC2 | Isolation setup failure returns a bounded error without a successful Session or direct-spawn fallback. | Deterministic failure test. |
| AC3 | Two concurrent protected Sessions survive a bundle-handoff daemon PID change without duplicate processes or identity changes. | Controlled Linux/systemd acceptance test or bounded harness with exact PID/identity assertions. |
| AC4 | The replacement daemon adopts both surviving Sessions and list/stop retain the original Happy Session and Agent-native identities. | Adoption and daemon integration tests. |
| AC5 | Stale, dead, legacy, terminal-owned, or PID-reused records are not adopted as live Sessions. | Persistence/adoption tests. |
| AC6 | Non-systemd, non-Linux, and tmux paths preserve existing behavior. | Focused compatibility tests and diff inspection. |
| AC7 | No App, Server, wire, authentication, systemd-unit, or conversation-data contract changes occur. | Whole-diff path and contract review. |
| AC8 | Targeted CLI tests, CLI typecheck, applicable workflow checks, and independent Spec/Standards review pass. | Validation ledger and review receipts. |

## Rollback

Revert the bounded Happy CLI source, tests, and documentation changes. Optional
local adoption fields are ignored by older code, so no persisted-data cleanup or
external systemd reconfiguration is required.
