# AI Coding Workflow

## Main loop

```text
Start -> Plan -> Scope -> Build -> Verify -> Review -> Finish -> Archive
```

### Start

Inspect repository rules, dirty state, active workflow, recent evidence, and the
smallest next action. Resume from files, not chat memory.

### Plan

Create or resume `docs/workspace/<slug>/` and link the smallest durable contract
that fits the task. A compact `Plan / Verify / Progress / Finish` task file may
hold acceptance, but structured state, role contexts, scoping, validation,
review, finish, and terminal archive remain required. High-risk work resolves
decisions and records rollback before implementation.

### Scope

Confirm the contract, boundaries, implementation context, decision and risk
assessments, test seams, and final command family. Record scoping before Build.

### Build

Load `contexts/implement.jsonl`, preserve unrelated changes, and implement in
small verifiable slices. Prefer TDD for logic with a stable seam.

### Verify

Use deterministic commands from `.ai/project.json`, then semantic review. Start
with the narrow reproduction or targeted test, then run the complete applicable
test family so parallel implementations and neighboring paths cannot hide behind
a local pass. Record exact commands, outcomes, limitations, and skipped or
unavailable checks in `validation.md`.
A check that is unavailable is an explicit gap, never an implied pass.

### Review

Review the whole diff after deterministic verification. High-risk work requires
an independent reviewer. Record the review receipt only after findings close.

### Finish

Reconcile acceptance, capture rollback and reusable learning, and record finish.
External fallbacks remain bounded and observable; correctness-critical missing
data fails closed.

### Archive

Enter immutable terminal archive state with `commit=pending`, stage implementation
and evidence together, and run `python3 scripts/workflow-ci.py --staged`. Only
then make an authorized atomic commit. Same-diff enforcement binds the pending
result without a self-referential hash; see ADR 0004.

When a workflow is created while another workflow is already active, the new
workflow records that previous ACTIVE entry. Archiving the new workflow restores
the previous entry when its workflow remains non-terminal. Commit-bound CI
accepts that restored workflow only when `ACTIVE.md` is unchanged by the
submitted diff, the active slug differs from the archived slug, and the active
workflow evidence is structurally valid. This lets an isolated completed task
integrate without clearing unrelated resumable work.

## Canonical state

- PRD, architecture, specs, tasks, and ADRs are durable project contracts.
- `docs/workspace/<slug>/` is resumable execution state and evidence.
- `docs/workspace/<slug>/workflow.json` is the machine source of truth for
  intensity, phase, gate receipts, and transition history.
- `contexts/implement.jsonl` and `contexts/check.jsonl` are role-scoped,
  repository-relative context manifests. `context.md` is their readable index.
- `session-index.md` and `sessions/` hold structured summaries when work spans
  sessions, agents, worktrees, or machines; `journal.md` remains the light log.
- `state.md` is generated from `workflow.json`; do not edit either file by hand.
- Human-visible tracker items, such as GitHub Issues, Linear/Jira tickets, or a
  recorded local-only exception, provide queue and acceptance boundaries for
  durable work. They do not replace repository acceptance criteria and
  verification evidence.

### External tracker adapter

`.ai/project.json.tracker` declares the provider, target, semantic category
labels, and workflow-state labels. `tracker-workflow` resolves that adapter and
keeps external writes behind explicit user authorization. Use the tracker as a
durable queue and acceptance boundary; snapshot accepted Issue context into the
local spec/task/workspace contract before implementation. See
`docs/workflow/tracker-workflow.md` for lifecycle and interface guidance.

## Machine gates

Every formal workflow uses guarded transitions:

```text
planning -> implementation -> verification -> finish -> archived
```

Create a workflow with an explicit intensity:

```bash
python3 scripts/workflow-state.py create <slug> --intensity feature
```

Decision and risk assessments are recorded for every workflow; evidenced
`not_required` is allowed only when no material trigger exists. Record receipts:

```bash
python3 scripts/workflow-state.py gate <slug> acceptance passed \
  --evidence "docs/specs/<feature>.md; docs/tasks/<feature>.md"
python3 scripts/workflow-state.py transition <slug> implementation \
  "Implement the accepted task slice"
python3 scripts/workflow-audit.py <slug> --strict --require-active
```

The state machine rejects forward transitions when required receipts are absent,
blocked, or structurally invalid. `archive` additionally requires completed
acceptance coverage and substantive finish evidence, then writes the immutable
`archived` terminal state and result metadata. Pass the implementation/validation
commit explicitly with `--commit`; use `pending` when no commit exists rather
than attributing the result to an older HEAD. Existing unstructured workflows
must use `migrate`; migration preserves their phase but leaves unknown receipts
pending instead of inventing history.

Legacy Low-risk state with automatic core waivers must use:

```bash
python3 scripts/workflow-state.py upgrade-policy <slug>
```

This preserves old receipts in history, returns to planning, and never fabricates
a pass. Archived state remains immutable and cannot be upgraded in place.

Create a structured cross-session summary when continuity needs more than the
running journal:

```bash
python3 scripts/workflow-state.py session <slug> <agent-or-scope>
```

Update an existing downstream repository through the explicit, dry-run-first
allowlist:

```bash
python3 scripts/sync-template.py /path/to/project
python3 scripts/sync-template.py /path/to/project --apply
python3 scripts/sync-template.py --all
python3 scripts/sync-template.py --all --apply
```

The sync manifest is `.ai/template-sync.json`. It never deletes target-only
files and preserves project contracts and state declared by the manifest. It
merges missing `requiredProjectChecks` into `.ai/project.json` without replacing
the project name, adapters, protected paths, or existing commands.
Template maintainers keep the derived-project inventory in
`scripts/downstream-projects.txt`. Batch mode continues past missing/failing
entries, reports a final summary, and exits non-zero when the inventory drifts.

## External frameworks

This template absorbs useful ideas without requiring their runtimes:

- Matt-style clarification, TDD, systematic diagnosis, and shared language.
- Trellis-style repository state, context curation, journal, and learning promotion.
- Superpowers-style isolation, independent review, and verification before completion.

See `docs/workflow/source-mapping.md` for the stack-neutral source mapping and
anti-goals.

See ADR 0001 for compact acceptance contracts and ADR 0003 for why they operate
inside the complete formal lifecycle.

See `docs/workflow/execution-isolation.md` for when to keep implementation in
the main session and when to use batch planning, worktrees, or writer subagents.
