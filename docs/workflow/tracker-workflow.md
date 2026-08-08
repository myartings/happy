# External Tracker Workflow

## Purpose

The tracker provides a durable, human-visible queue and acceptance boundary for
work that must survive delayed pickup, coordinate multiple contributors or
agents, or deliver through a pull request. It is not the Agent execution ledger.

```text
Tracker item -> local workflow -> branch/worktree -> pull request -> merge
     queue       evidence          execution          review        closure
```

Local `docs/specs/`, `docs/tasks/`, and `docs/workspace/` remain authoritative
for accepted scope, resumable state, exact validation, review, and finish.

## Project configuration

Declare the adapter in `.ai/project.json`:

```json
{
  "tracker": {
    "provider": "github",
    "target": "OWNER/REPOSITORY",
    "categories": {
      "bug": "bug",
      "enhancement": "enhancement"
    },
    "states": {
      "needsTriage": "needs-triage",
      "needsInfo": "needs-info",
      "readyForAgent": "ready-for-agent",
      "readyForHuman": "ready-for-human",
      "wontfix": "wontfix"
    }
  }
}
```

`target` may be `null` in a fresh scaffold. A GitHub adapter can then infer one
unambiguous `OWNER/REPOSITORY` from Git remotes for read-only discovery. Configure
the target explicitly before writes when remotes disagree, such as fork-based
`origin` and `upstream` workflows. Use `provider: none` with `target: null` for a
deliberately local-only project.

New projects can set the target during creation:

```bash
./scripts/create-project.sh MyProject --profile generic \
  --github-repository OWNER/REPOSITORY
```

## Issue lifecycle

Use exactly one category and one state on each triaged Issue:

```text
needs-triage -> needs-info | ready-for-agent | ready-for-human | wontfix
needs-info   -> needs-triage
```

- `bug` and `enhancement` describe the request.
- `needs-triage` means the maintainer has not accepted an execution contract.
- `needs-info` waits for specific missing evidence or decisions.
- `ready-for-agent` has enough bounded context and verification to delegate.
- `ready-for-human` requires human judgment, access, or manual execution.
- `wontfix` records an evidenced rejection or already-satisfied request.

## From plan to Issue

Use `generate-tasks` to create dependency-aware vertical slices. When external
publication is requested, route through `tracker-workflow`, show the proposed
breakdown first, then publish blockers before dependent Issues. Record the URLs
in local task/workspace links.

## From Issue to execution

When starting work, snapshot the accepted Issue into repository contracts and
create the required structured workflow. Link the Issue, PR, and branch/worktree
in `task-links.md`. Later Issue edits are scope changes to reconcile explicitly,
not invisible updates to a running Agent.

## Finish and closure

Validation and whole-diff review pass locally before any Issue is considered
complete. Prefer linking the delivery PR with `Closes #<number>` so GitHub closes
the Issue when the PR reaches the default branch. If external mutation was not
explicitly requested, report the recommended label/comment/closure instead of
performing it.

## Interface boundary

Use GitHub's browser or mobile UI for broad browsing, Projects, complex forms,
notifications, and review. Use Agent skills for structured creation and triage.
Coding clients such as Happy should deep-link or start a Session from an Issue;
they do not need to mirror the complete tracker interface.
