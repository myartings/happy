# Decisions: `fork-upstream-issue-routing`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How are upstream target and fork publication distinguished? | accepted | Add explicit Issue-remote and publication-remote roles; user accepted this contract on 2026-08-31. |
| D2 | Should the planner infer roles from remote URLs or configuration? | accepted | No. Defaults remain `origin`; any non-default role must be named explicitly so authorization can repeat an exact tuple. |
| D3 | Which URLs define each role? | accepted | Every Issue-remote fetch URL must match the Issue repository. Publication fetch and push URLs must all resolve to one consistent GitHub repository. A disabled upstream push URL is irrelevant because the Issue remote is read/base authority only. |
| D4 | Which remote owns a `target` base? | accepted | The exact remote-tracking namespace of the selected Issue remote, with exactly one configured remote-prefix attribution. Dependency-base semantics remain unchanged. |
| D5 | Which remote owns an existing canonical Issue branch? | accepted | Only the publication remote, with exactly one configured remote-prefix attribution; cross-remote, stale, overlapping-name, and divergent identities remain fail-closed. |
| D6 | Should the output expose the selected roles? | accepted | Yes. Result and inert launch capsule record Issue remote, publication remote, and publication repository. |
| D7 | Does this Slice modify #1654 or perform GitHub/Git mutations? | accepted | No. It changes only the read-only planner, tests, and direct documentation. #1654 remains a separate accepted boundary after this Slice finishes. |

## Decision assessment

- Owner: repository maintainer; choices were explicitly accepted in the branch
  and Workspace authorization response.
- Reversibility: local code/docs change, fully reversible without data
  migration.
- Cost of error: a false-ready route could prepare a branch/worktree from the
  wrong repository or miss a remote collision; a false block delays work but
  preserves state.
- Evidence source: current planner implementation, current Happy remote model,
  the blocked live #1654 observation, and temporary-repository behavior tests.
- ADR: not required. The roles are a narrow public CLI contract with reversible
  defaults and are fully explained by the Spec, decisions, and operator docs.

## Risk assessment — cleared with controls

- Affected surface: all named-Issue session preparation consumers; no user data,
  money, permissions, production deployment, or external write occurs inside
  the planner.
- Failure modes: wrong Issue repository, wrong target base, ambiguous
  publication repository, overlapping remote-prefix attribution,
  missed/divergent branch collision, compatibility regression, or incomplete
  recovery evidence.
- Controls: explicit role selection, backward-compatible defaults, exact
  remote/ref validation, no network or mutation, deterministic RED/GREEN
  fixtures, full applicable checks, independent Spec/Standards review, and
  rerun-before-execution requirement.
- Stop conditions: any behavior requires remote inference, Git mutation,
  external publication, relaxed collision checks, or #1654 product edits.
- Rollback: restore the prior planner and operator documentation; no state or
  data migration is required.
