# Finish Review: `saved-main-projects`

## Summary

Implemented Issue #84 as one Saved Projects Slice. Happy CLI now owns a
validated, atomic machine-local project registry and resolves durable project
identity immediately before normal session spawn. New Session lists only the
current machine's saved projects, persists project identity in the shared
draft/start flow, and fails closed for old CLI or Rig targets that cannot
resolve the CLI-owned identity.

## Verification

- Focused CLI: 15/15 tests passed.
- Focused App: 69/69 tests passed.
- Happy CLI and Happy App TypeScript checks passed.
- Candidate-bound applicable check for `3d08b0febdad`: 7/9 configured commands
  passed; the two failed full-suite commands contain only user-accepted,
  unrelated baseline gaps recorded in `validation.md`.
- Fresh independent Spec and Standards reviews both accepted the exact staged
  candidate with no blocking findings.
- Strict active-workflow audit passed with only the then-pending finish gate.

## Whole-diff review

The final staged diff remains within the accepted registry, Machine RPC, App
Saved Project model, New Session picker/draft/shared-start integration, tests,
and lifecycle evidence. Scanner compatibility is retained. There are no auth,
Server persistence, native project, deployment, user-directory mutation, or
tracker changes. Review remediation closed corrupt identity, Git metadata,
symlink replacement, stale response, cross-machine snapshot, old-CLI fallback,
and Rig identity-forwarding boundaries.

## Rollback or mitigation

Remove the additive Saved Project App/RPC/module seams and leave
`projects.json` inert. No directory, migration, or Server cleanup is required;
corrupt registry bytes remain preserved for recovery. Rig saved-project starts
currently report unavailable instead of accepting an identity Rig cannot
authoritatively resolve.

## Lessons promoted

- `CONTEXT.md`: not required; the behavior is fully captured by the feature
  spec and localized module contracts.
- `docs/ARCHITECTURE.md` or ADR: not required; no repository-wide architecture
  decision was introduced.
- Skill/workflow rule: not required; findings were candidate-specific and are
  covered by regression tests.

## Follow-up

- Recommend posting the final verification summary to GitHub Issue #84 and
  closing it after delivery is committed. Tracker mutation was not authorized
  in this session, so no external issue state was changed.
- Future Rig support requires a Rig-owned authoritative project registry or a
  trusted cross-daemon resolution protocol; cached App paths must not be used.
