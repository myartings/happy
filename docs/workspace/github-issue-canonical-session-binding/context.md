# Context: `github-issue-canonical-session-binding`

## Current boundary

The user accepted a pure-client replan on 2026-08-31. Happy is a
viewer/controller. The selected Session runs on a Windows, macOS, or Linux
daemon, while compatible Happy clients coordinate one current Issue-to-Session
association through the official account-scoped UserKVStore.

Authoritative local contracts:

- `docs/specs/github-issue-canonical-session-binding.md`
- `docs/adr/0007-canonical-github-issue-session-binding-authority.md`
- `docs/tasks/github-issue-canonical-session-binding-tasks.md`

## Scoping result

- **Disposition:** implementation in progress.
- **Blocker:** none. The user authorized tracker reconciliation, and the live
  GitHub Issue #79 body was updated and verified against
  `issue-79-body-draft.md` on 2026-08-31.
- **Owner/topology:** current Root, serial work in this registered worktree; no
  writer dispatch or role manifest.
- **Accepted surface:** feature-local
  `packages/happy-app` Issue association, existing KV API adapters, encrypted
  local projection, Session creation/adoption UI seams, focused tests, and
  localization/accessibility needed by AC1-AC10.
- **Excluded surface:** `packages/happy-server/**`, Prisma/migrations,
  daemon/CLI protocols, protected native platform directories, mobile
  acceptance, deployment/release, and unauthorized tracker mutation.
- **Test authority:** AC1-AC10, ADR 0007, and T1-T6. TDD starts with atomic
  bidirectional client KV claim and claim-before-send behavior.
- **Verification:** focused App suites and typecheck incrementally, then
  `python scripts/workflow-check.py --applicable` and fresh two-axis review of
  one pinned client-only candidate.

## Superseded candidate

The staged Stage A candidate and its fingerprint
`d52698a0623307d54aec422c602b3b74d834b833483926198092b0e7b3118375`
implemented the rejected dedicated-server design. Its checks and reviews remain
historical evidence only and do not satisfy the new contract. T2 has removed
the functional server/daemon/database candidate while preserving unrelated
user work. T3-T5 are deterministically implemented; T6 candidate-bound
verification is in progress.
