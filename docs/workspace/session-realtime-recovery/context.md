# Context: `session-realtime-recovery`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Codex primary-turn state: App Server client, Codex runner, and focused tests.
- App recovery: user-scoped socket, Sync visible-message reconciliation, existing
  activity accumulator/cache policy, and focused tests.
- Server ping handler is read-only context; no server production change is
  planned.

## Verification context

- Accepted PRD/spec/tasks and risk decisions.
- Complete product and test diff, package checks, and workflow validation.

## Notes

- Work is local-only on `feature/session-realtime-recovery`; no tracker write,
  PR, deployment, installation, or commit is authorized.
- Official issues #988 and #989 are evidence, not accepted upstream root-cause
  decisions.
- Scoping result: ready. The two slices share no new wire contract, have stable
  automated seams, and remain owned by the main Session in this worktree.
