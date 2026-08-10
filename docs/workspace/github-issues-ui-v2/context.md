# Context: `github-issues-ui-v2`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Approved UI, repository association, CRUD presentation, and Session dispatch
  live under one feature Module. Host files should contain only route/shortcut
  seams.
- See `contexts/implement.jsonl` for the bounded implementation set.

## Verification context

- Verify through the feature Interface first, then the complete applicable Happy
  app test family and live desktop/mobile acceptance.
- See `contexts/check.jsonl`.

## Notes

- Triage remains a repository/Agent workflow. Happy constructs the explicit
  dispatch task but does not implement or visualize the Triage state machine.
- Existing Device Flow, secure storage, direct GitHub transport, and CRUD are
  retained unless a task explicitly identifies a contract defect.
- Implementation is serial on `myartings/github-issues-ui-v2`; see
  `execution-plan.md`. No writer subagents are authorized by the current plan.
