---
name: tracker-workflow
description: Resolve and operate the configured external tracker safely. Use when listing, creating, triaging, linking, or finishing GitHub Issues or other tracker items, or when a formal workflow requires a human-visible tracker boundary.
---

# Tracker Workflow

## Boundary

The external tracker is the human-visible queue and acceptance boundary.
`docs/specs/`, `docs/tasks/`, and `docs/workspace/` remain authoritative for
implementation scope, execution state, validation, review, and finish evidence.
Never infer a local workflow gate from an Issue label or closed state.

## Resolve the adapter

1. Read `.ai/project.json.tracker` before querying or mutating a tracker.
2. If `provider` is `none`, record a local-only reason in `task-links.md`; do not
   attempt tracker access.
3. For GitHub, use configured `target` when present. Otherwise inspect Git
   remotes read-only and normalize common HTTPS and SSH GitHub URLs to
   `OWNER/REPOSITORY`.
4. If no target resolves, or different remotes resolve to different repositories,
   stop before external access and ask for one target to be configured.
5. Prefer an installed authenticated tracker connector. For GitHub, `gh` is an
   acceptable fallback. Use the browser for interactions better served by the
   native tracker UI. Do not use public web search for private tracker data.

## Read-before-write rule

Read-only discovery is allowed when it is relevant to the user's request. Before
an external write, confirm all of the following from current state:

- provider and resolved target;
- exact Issue or PR, when editing an existing item;
- current labels, state, body, and relevant recent comments;
- the concrete mutation requested by the user.

Creating, editing, labeling, commenting on, closing, reopening, or assigning an
Issue is an external write. Perform it only when the user explicitly requested
that operation. Drafting content or recommending a transition does not authorize
publication.

## Publish work items

1. Start from an accepted spec or plan and draft independently reviewable vertical
   slices. Each slice should be demoable or verifiable on its own.
2. Present titles, dependencies, and acceptance coverage for approval before
   publishing multiple Issues.
3. Use the repository Issue template vocabulary:
   Problem, Expected outcome, Acceptance criteria, Scope, Verification,
   Dependencies, and Local contract links.
4. Apply the configured `needsTriage` state and exactly one configured category.
5. Publish blockers first so later Issues can reference real identifiers.
6. Record published URLs in the applicable workflow `task-links.md` or task file.

## Triage

Every triaged item has exactly one configured category and one configured state:

```text
needsTriage -> needsInfo | readyForAgent | readyForHuman | wontfix
needsInfo   -> needsTriage
```

Read the complete body and relevant comments, inspect the codebase for redundancy
and prior decisions, then recommend a transition before applying it. A
`readyForAgent` item must contain an actionable problem, bounded outcome, scope,
acceptance criteria, dependencies, and verification signal.

## Link execution

When work starts from a tracker item:

1. Create or resume the required local workflow.
2. Record the tracker URL, PR URL when known, and branch/worktree in
   `task-links.md`.
3. Snapshot the accepted Issue context into the local spec/task contract; do not
   rely on mutable remote text as the only execution contract.
4. If the remote item changes during execution, surface the delta and reconcile
   it explicitly instead of silently changing scope.

## Finish

After local validation, review, and finish evidence pass, report the recommended
tracker transition and PR linkage. Update or close the external item only when
that reconciliation was explicitly requested. Prefer a linked PR with
`Closes #<number>` over manually closing an implementation Issue before merge.
