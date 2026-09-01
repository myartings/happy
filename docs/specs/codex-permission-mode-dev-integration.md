# Codex Permission Mode Dev Integration

## Status and source

- Status: accepted merge-local integration contract.
- Source: user-authorized local integration required to make PR #90 mergeable
  after PR #89 / Issue #88 entered `dev`.
- Parents: Issue #87 delivery `5f8585f8` and `origin/dev` `633c5b94`.

## Outcome

Produce one ordinary two-parent merge that preserves both permission-mode
contracts without adding a third behavior:

1. Issue #87 preserves an existing Codex session's effective mode across
   clients, safely recovers unambiguous legacy YOLO, and publishes the concrete
   launch mode in initial synchronized metadata.
2. Issue #88 delivers explicit live Auto/YOLO changes through its authenticated,
   acknowledged, revision-ordered RPC and updates the display mirror only after
   CLI confirmation.

## Integrated contract

- Composer projection and outbound Codex messages share the Issue #87 resolver.
- Explicit local or synchronized per-session modes retain precedence; explicit
  synchronized null resets to the compatible default.
- Legacy YOLO recovery requires Codex flavor, absence of the newer own
  `permissionMode` field, and exact boolean `dangerouslySkipPermissions === true`.
- Initial Codex session metadata contains the concrete launch permission mode.
- Synchronized `permissionMode` is the cross-client per-session value, launch
  seed, and display mirror. It is not a live CLI authorization command.
- Explicit active-session changes use the Issue #88 RPC, monotonic revision,
  pending-approval, Abort, disconnect, reconnect, and cross-client controls.
- Product-wide defaults and execution-policy mappings remain unchanged.

## Merge and compatibility constraints

- Use a normal merge; no rebase, reset, amend, force push, or history rewrite.
- Preserve both parent archive rows and add only this merge-local terminal row.
- Do not rewrite either parent's Workspace evidence.
- The PR delta relative to `dev` remains the Issue #87 delivery plus this local
  integration evidence; inherited Issue #88 files remain parent history.
- No server schema, native project, migration, release, install, or Issue
  closure is included.

## Acceptance criteria and evidence

| ID | Verifiable criterion | Required evidence |
| --- | --- | --- |
| MI1 | The pending merge has parents `5f8585f8` and `633c5b94`, and no unresolved conflict marker. | Git MERGE_HEAD/status/marker inspection. |
| MI2 | Both parent archive rows are preserved exactly once and inherited lifecycle evidence is unchanged. | Archive row comparison and merge-mode workflow CI. |
| MI3 | The App preserves #87 resolver/outbound behavior and #88 acknowledged live picker behavior together. | Resolver, message metadata, and permission-mode operation tests. |
| MI4 | CLI initial launch metadata and live permission controller/approval behavior coexist. | Metadata factory, live controller, permission handler, and remote-state tests. |
| MI5 | `Metadata.permissionMode` has one compatible declaration: synchronized launch/display value, not live authorization command. | Type inspection and CLI/App typechecks. |
| MI6 | No default, policy mapping, server, native, release, or tracker-state behavior changes. | Diff inspection and whole-diff review. |
| MI7 | The exact merge-local candidate passes configured checks or records only explicitly accepted unchanged gaps. | Candidate-bound `workflow-check` receipt. |
| MI8 | Independent high-risk Spec and Standards review accept the same candidate. | Fresh two-axis review receipts. |
| MI9 | Pre-archive, archived-staged, and committed merge CI pass; PR #90 points at the pushed merge and is no longer conflicting. | Workflow CI, merge commit parents, push output, and `gh pr view`. |

## Rollback

Before push, rollback is stopping before the merge commit. After push, revert
the merge commit or the Issue #87 delivery without rewriting history. No data
migration or cleanup is required.
