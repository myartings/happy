# Specification: Fork-to-Upstream Named Issue Routing

## Goal

Allow the read-only named-Issue planner to represent the common contributor
topology where the Issue and target base live on an upstream remote while the
work branch is published through a personal-fork remote, without weakening any
identity or collision check.

## Delivery boundary

This Slice changes only planner inputs, validation, output evidence, tests, and
directly required workflow documentation. The downstream daemon fix for
`slopus/happy#1654` is a separate Delivery Slice with its own branch, worktree,
Workspace, implementation, checks, review, and rollback boundary.

## Acceptance criteria

- [ ] **AC1 — Backward-compatible default:** Omitting remote-role flags keeps
  `origin` as both roles, and a same-repository fixture produces the existing
  ready preparation semantics.
- [ ] **AC2 — Explicit fork/upstream route:** With Issue remote `upstream`,
  publication remote `origin`, Issue `slopus/happy`, and target base
  `refs/remotes/upstream/main`, the planner returns `status=ready`, the verified
  base commit, the unchanged canonical branch/worktree plan, and no mutation.
- [ ] **AC3 — Issue identity fails closed:** A missing Issue remote or any of
  its fetch URLs that does not match the Issue repository returns a blocked
  observation and `gitAction=null`.
- [ ] **AC4 — Target-base identity fails closed:** A `target` base outside the
  selected Issue remote's exact `refs/remotes/<remote>/...` namespace, or one
  attributable to more than one configured remote, returns a blocked
  observation and `gitAction=null`.
- [ ] **AC5 — Publication identity fails closed:** Missing, non-GitHub, or
  inconsistent fetch/push repository identities for the publication remote
  return a blocked observation and `gitAction=null`.
- [ ] **AC6 — Branch collision remains strict:** A reusable local Issue
  worktree accepts at most one matching remote branch under the publication
  remote, uniquely attributable to that remote; a matching branch under another
  remote, an overlapping remote-name attribution, or a divergent publication
  branch blocks reuse.
- [ ] **AC7 — Recovery evidence is complete:** Ready result and launch-capsule
  output record the Issue remote, publication remote, and publication
  repository without changing the existing Issue, repository, base, branch,
  worktree, binding, or authorization semantics.
- [ ] **AC8 — Planner stays inert:** Every tested route leaves the fixture's
  refs, worktrees, and checked-out branch unchanged unless the test harness
  explicitly executes a returned fixture-only `gitAction` to exercise reuse.

## Interfaces and data

### CLI inputs

- `--issue-remote <name>` — optional; defaults to `origin`. Its fetch URLs own
  the Issue repository identity and its remote-tracking namespace owns a
  `target` base.
- `--publication-remote <name>` — optional; defaults to `origin`. Its consistent
  fetch/push repository identity owns the expected published Issue-branch ref.

Remote names are passed as Git arguments, never shell text. Invalid or missing
remote names are rejected before base, branch, or worktree planning.

### JSON output

Successful observations add:

- `issueRemote`
- `publicationRemote`
- `publicationRepository`

The inert `launchCapsule` repeats those fields. Existing fields and status
vocabulary remain compatible. Observation failures retain the existing compact
failure envelope and never expose a `gitAction`.

## State and validation rules

1. Parse and validate the Issue URL.
2. Resolve the exact repository and session roots and shared Git directory.
3. Validate the Issue remote's fetch identity against the Issue URL.
4. Validate one consistent GitHub identity for the publication remote's fetch
   and push URLs.
5. Validate and resolve the base; a `target` ref must be beneath and uniquely
   attributable to the Issue remote namespace.
6. Apply existing branch, worktree, ancestry, session-binding, and collision
   checks, substituting only the publication remote for the expected remote
   branch and requiring unique attribution before accepting that ref.
7. Return point-in-time evidence without executing the proposed action.

## Edge cases and failure behavior

- Multiple URLs are allowed only when every URL within the applicable role
  resolves to the same required repository identity.
- A repository URL must normalize to exactly one GitHub `owner/repository`
  pair; nested paths, query strings, and fragments are not repository
  identities.
- An Issue remote may have an unusable or disabled push URL because it is a
  read/base authority; only its fetch URLs are evaluated.
- A publication remote must have usable GitHub fetch and push identities and
  they must agree.
- An explicit remote role that does not exist is blocked; the planner does not
  fall back to another remote or infer a likely match.
- Dependency bases retain their existing exact-ref/full-object behavior.
- A remote branch with the canonical Issue branch name on any non-publication
  remote remains an identity collision.
- A stale remote-tracking ref whose slash-delimited owner cannot be attributed
  unambiguously still claims the canonical Issue-branch suffix and therefore
  blocks reuse.
- Git porcelain normally rejects prefix-overlapping remote names, but a manual
  or legacy config may still contain `personal` and `personal/fork`. Any target
  base or expected publication ref with multiple possible prefix attributions
  fails closed.

## Compatibility and operational constraints

- Defaults preserve current same-repository behavior and command lines.
- The planner performs local Git inspection only and makes no network request.
- The cooperating executor must repeat the exact Issue/base/remote/branch/
  worktree tuple immediately before any authorized mutation.
- No credential, remote URL, machine identifier, or session identifier is
  written to workflow evidence beyond public repository identities and selected
  remote names.

## Non-goals

- Automatic remote-role discovery or implicit preference for `upstream`.
- Verifying GitHub fork ancestry or PR permissions.
- Supporting non-GitHub Issue URLs.
- Changing branch/worktree creation, client launch, tracker mutation, or local
  acceptance authority.
- Fixing or testing daemon behavior from Issue #1654.

## Verification plan

| Criterion | Test or evidence |
| --- | --- |
| AC1 | Same-repository route test in `scripts/test-happy-workflow-runtime.py` |
| AC2, AC7, AC8 | Fork/upstream route test plus fixture ref/worktree snapshots |
| AC3 | Missing/mismatched Issue-remote tests |
| AC4 | Wrong target-base remote and overlapping slash-remote tests |
| AC5 | Inconsistent, non-GitHub, and malformed publication-remote URL tests |
| AC6 | Matching publication branch, non-publication collision, slash-named remote, stale-ref, and overlapping-name tests |
| All | `python3 scripts/test-happy-workflow-runtime.py` |
| All | `python3 scripts/workflow-check.py --applicable` and independent review |
