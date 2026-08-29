# AI Coding Workflow

## Host environment boundary

Workflow semantics and persisted repository identities are host-neutral. Linux
and macOS use the supported POSIX route with `python3`. Native Windows is also a
supported core host when using PowerShell 7, Git for Windows, and Python 3.11 or
newer through `py -3` or `python`. Ubuntu remains the complete hosted safety
lane; one bounded native-shell `windows-latest` smoke covers platform-sensitive
seams. Native Windows support does not impose a per-delivery real-device
evidence gate or a duplicate macOS/Windows full-suite matrix. See
`docs/workflow/host-environment.md`.

## Task boundary

The repository has one explicit boundary, not a diff classifier:

- **No accepted Trellis task** — clear, bounded, normal-risk single-session
  work follows Matt in the current context. It creates no Workspace, archive,
  or lifecycle gate evidence.
- **Accepted Trellis task** — complex, high-risk, cross-session, durable, or
  coordinated work enters the complete lifecycle below after user consent.

The standing solo-project preference skips Trellis for small work. Ask before
creating a task when a trigger applies; do not repeatedly ask for ordinary
work. If the user declines task creation for broad or high-risk work, split or
clarify it instead of silently implementing the broad scope inline.

Durable solo delivery is Issue-first: deferred, cross-session, cross-device,
dependency-bearing, multi-slice, dedicated-worktree, and later-discovered work
starts from a human-visible Issue. Immediate bounded normal-risk work remains
Issue-optional in the current session. One durable implementation Issue maps to
one independently deliverable slice; broader outcomes use separately accepted
child slices.

Before durable Issue publication or agent-ready triage, record the right-sizing
assessment in `docs/workflow/ticket-task-contract.md`. A tracker-backed
Workspace revalidates and snapshots it through `workflow-state.py right-sizing`
before implementation. Independent delivery boundaries—not hierarchy, file
count, duration, or token estimates—control splitting; exact artifacts and
interfaces control dependencies.

After an Issue worktree is prepared, sustained Root implementation uses the
public Issue route's binding classification. An exact registered Issue worktree
and matching confirmed native-handoff/fresh-session evidence, or the explicit
named-Issue isolation opt-out, is required for `current-root`. A path, branch,
working-directory override, or caller assertion alone returns the inert
`manual-start-required` boundary; launch capsules never create or authorize a
session.

A named Issue imperative authorizes read-only inspection and a bounded
preparation proposal. It does not itself accept or create a Trellis Workspace.
Workspace activation still requires explicit acceptance through
`workflow-state.py`; mutable Issue state never supplies a local gate receipt.

`workflow-ci.py` accepts a no-task submission only when no task is active and
the diff does not mutate lifecycle evidence. It validates complete archived
evidence when an accepted task is submitted.

## Accepted-task loop

```text
Start -> Plan -> Scope -> Build + Targeted Verify -> Final Check -> Review -> Finish -> Archive -> Combined Staged CI -> Authorized Delivery Commit
```

### Start

Inspect repository rules, dirty state, active workflow, recent evidence, and the
smallest next action. Resume from files, not chat memory.

### Plan

After explicit task acceptance, create or resume one
`docs/workspace/<slug>/` for the accepted delivery slice
and link its stable ticket, spec section, or local source. Add a detailed
`docs/tasks/` checklist only when the slice has multiple implementation steps,
acceptance criteria, internal dependencies, or a high-risk audit need.
Structured state, scoping, validation, review, finish, and terminal archive
remain required for that task. Lightweight tasks may use a concise contract.
Role contexts and session scaffolding exist only when actual dispatch or
cross-session recovery needs them. See
`docs/workflow/ticket-task-contract.md`. High-risk work resolves decisions and
records rollback before implementation.

### Scope

Confirm the contract, boundaries, implementation context, decision and risk
assessments, test seams, and final command family. Revalidate the right-sizing
assessment for tracker-backed work; `split-required` returns to explicit scope
reconciliation rather than entering Build. When two or more independent
ready units actually exist, inventory dependencies, shared contracts, and
ownership, then route through `batch-plan`. Serial work needs no parallel
receipt. Record task scoping before Build.
Task checklists annotate dependencies, likely ownership, and parallel candidates
as early planning input; those annotations do not authorize dispatch.

### Build

Load the accepted task contract and any role context required by actual
dispatch, preserve unrelated changes, and implement in small verifiable slices.
Prefer TDD for logic with a stable seam.

Scoping freezes the accepted contract. Every work item discovered afterward is
classified before it can expand implementation, tests, checks, or blocking
review findings. Only an accepted-contract gap, a candidate-introduced
regression, or an explicit applicable binding-authority violation may block.
Prerequisite repair, material-growth routing, severity independence, mandatory
test authority, and follow-up reporting are defined once in
`docs/workflow/discovered-work-scope-containment.md` and consumed by Build,
check, initial/remediation review, continuation, finish, and actual handoff.

### Targeted verify and candidate preparation

Use deterministic commands from `.ai/project.json`. Start with the narrow
reproduction or targeted test during Build. Once implementation feedback is
green, stage only the accepted delivery paths; that explicit index snapshot is
the final candidate boundary. Unrelated unstaged or untracked paths remain
outside it and cannot be accepted implicitly. Record exact commands, outcomes,
limitations, and skipped or unavailable checks in `validation.md`.
A check that is unavailable is an explicit gap, never an implied pass.

During a batch, append `parallel-reassess` only when completing or integrating a
slice materially changes remaining readiness, dependencies, or ownership. An
unchanged graph requires no receipt. Parallel reporting is an explicitly
invoked diagnostic and never part of finish.

### Final check and review

After targeted feedback is green, stage the accepted delivery candidate and run
`workflow-check.py --applicable --record <slug> --staged --base <ref>`. This
is the single final deterministic family and binds its result to the exact Git
candidate.

Generate temporary review input with `workflow-review.py package <slug> --base
<ref> --staged`. The input lives under Git-private storage and is not committed.
Dispatch separate Spec and Standards reviewers in parallel read-only clean
contexts over that same package. Record one final outcome per axis with
`workflow-state.py review-conclusion`, then record the aggregate review gate.
Durable state retains only the checked/reviewed candidate identity, final axis
outcomes, accepted gaps, and bounded evidence references.

A delivery-byte change invalidates the final check and review. Remediation
returns to implementation, targeted feedback, a fresh final check, and a fresh
dual-axis review. Repeated blocked boundaries use the continuation
right-sizing/diagnosis route and append a right-sizing continuation receipt.
Historical Workspaces remain passive Git evidence;
current commands do not migrate or replay their review histories.

### Finish

Reconcile acceptance, capture rollback and reusable learning, and record finish.
External fallbacks remain bounded and observable; correctness-critical missing
data fails closed. Stage the complete pre-archive work candidate and run
staged work-candidate CI before terminal generation.

### Archive

Generate immutable terminal archive state from that exact staged checked and
reviewed candidate. Stage the combined work plus canonical terminal projection
and run staged CI. Only an explicit authorization may create the one archived
delivery commit. Result identity is the submitted-branch commit that first
introduces the append-only archive row; terminal content stores the typed
relationship rather than its future SHA. Candidate and submission guards reject
stale review/check evidence, noncanonical terminal bytes, unrelated or foreign
lifecycle changes, and post-review engineering drift. See ADR 0004.

### Pre-push integration

Staged CI proves one candidate before commit; it does not prove that several
locally accumulated completed deliveries form one valid hosted submission.
Merge-mode workflow CI proves only inherited lifecycle and provenance integrity.
Conflict-resolution or other novel non-lifecycle bytes remain an ordinary
engineering diff that requires applicable checks and fresh Matt review; source
task evidence is not reused for those bytes.
Immediately before a normal push, fetch the exact target branch and validate
the actual outgoing range, for example:

```bash
git fetch origin main
python3 scripts/workflow-ci.py --base origin/main
```

For a local merge made while the feature branch is checked out, committed CI
defaults to parent 1 as the submitted source. Hosted pull-request and main-push
merge commits set `WORKFLOW_SOURCE_PARENT=auto`: the exact event base parent is
the target and the other parent is the submitted source. Do not guess parent
orientation from ancestry alone.

One hosted push range remains one delivery unit. When local history contains
multiple independently completed deliveries, push their
terminal commits chronologically as separate fast-forward updates and rerun the
remote-base command after each update. If remote divergence cannot be resolved
without combining delivery ranges, stop and create a separately accepted
integration workflow; do not rebase provenance-bound commits or use force-push
as an evidence repair.

When a workflow is created while another workflow is already active, the new
workflow records that previous ACTIVE entry. Archiving the new workflow restores
the previous entry when its workflow remains non-terminal. Commit-bound CI
accepts that restored workflow only when `ACTIVE.md` is unchanged by the
submitted diff, the active slug differs from the archived slug, and the active
workflow evidence is structurally valid. This lets an isolated completed task
integrate without clearing unrelated resumable work.

## Canonical state

- PRD, architecture, specs, tracker Issues or approved local-only sources, and ADRs are
  durable project contracts. Files in `docs/tasks/` are conditional execution
  checklists, not a second delivery queue.
- `docs/workspace/<slug>/` is resumable execution state and evidence only for
  an accepted Trellis task.
- `docs/workspace/<slug>/workflow.json` is the machine source of truth for
  layout, intensity, phase, right-sizing and parallel assessments, gate
  receipts, and transition history.
- Lightweight tasks may use a concise contract. Context manifests and session
  summaries are conditional on actual dispatch and cross-session recovery.
- `contexts/implement.jsonl` and `contexts/check.jsonl` are role-scoped,
  repository-relative context manifests. `context.md` is their readable index.
- `session-index.md` and `sessions/` hold structured summaries when work spans
  sessions, agents, worktrees, or machines; `journal.md` remains the light log.
- `state.md` is generated from `workflow.json`; do not edit either file by hand.
- Tracker Issues are conditional coordination/queue boundaries. They do not
  replace repository acceptance criteria or verification evidence.

## Concern ownership and routing axes

Every capability has exactly one semantic owner. When Matt Skills already own
an engineering capability, a Trellis skill for the same capability is excluded
rather than blended. A non-owner may store or transport the owner's outputs and
validate only their artifact shape; it cannot judge the owned behavior or
introduce a second execution protocol:

`docs/workflow/capability-owners.json` is the machine-readable ownership
registry. The prose below explains its boundaries but cannot assign another
owner.

- Matt owns requirements clarification, TDD, implementation discipline,
  diagnosis, and semantic Spec/Standards review.
- Trellis owns explicit task activation, Plan/Execute/Finish, durable task
  state, recovery, archive, and learning. Those semantics are inactive until a
  task is accepted. Trellis brainstorming, implementation-agent, and semantic
  review protocols remain excluded overlaps.
- Repository integration owns deterministic acceptance verification and
  submission safety plus the operational right-sizing receipt. It never creates
  a task from a diff or replaces Matt's engineering/Trellis lifecycle ownership.
- Project or platform adapters own platform-specific commands and behavior.
- Safeguards constrain those owners; they do not create a second lifecycle.

`check` is deterministic acceptance verification. `review` is the separate
Matt-owned semantic gate. Neither can stand in for the other.

Assess three independent axes: change intensity sets evidence depth, decision
uncertainty determines whether choices must be resolved, and execution topology
selects the session/worktree/agent shape. A branch, session, or worktree change
does not alter the accepted product contract or its intensity.

Scoping records implementation topology before applying model guidance.
`current-root` or `isolated-writer` fixes the implementation owner; capability
guidance cannot create delegation. Luna High is the starting recommendation for
bounded deterministic work. Root judgment, architecture, diagnosis, independent
review, and High-risk boundaries use Sol Medium or a higher effort justified by
uncertainty or consequence. A Git branch alone is not isolated-writer evidence.

When a Luna Root materially crosses a Sol boundary, the workflow states the
reason and exact `gpt-5.6-sol` effort, then asks the operator to perform
`/model` and verify it with `/status`. The workflow never performs or silently
claims the switch, and a Sol subagent cannot satisfy it. If the client cannot
verify the change or the context is no longer suitable, start a fresh suitable
Root in the same accepted task, branch, and worktree. Model choice creates no
lifecycle receipt, automatic downgrade, repeated escalation loop, or durable
failure/identity state.

Session–worktree affinity constrains Root execution topology without adding a
lifecycle phase: sustained Root implementation remains in the current
human-facing session root, or resumes after a native client handoff or a
user-authorized fresh session binds the target worktree. Command-level working
directory changes are not a session handoff. See
`docs/workflow/execution-isolation.md`.

### External tracker adapter

`.ai/project.json.tracker` declares the provider, target, semantic category
labels, and workflow-state labels. `tracker-workflow` resolves that adapter and
keeps external writes behind explicit user authorization. Use the tracker as a
conditional durable queue and acceptance boundary. For an accepted tracked
task, snapshot Issue context into the local contract and bind it with
`workflow-state.py source` before implementation. See
`docs/workflow/tracker-workflow.md` for lifecycle and interface guidance.

## Machine gates

Every accepted Trellis task uses guarded transitions:

```text
planning -> implementation -> verification -> finish -> archived
```

Create a workflow with an explicit intensity:

```bash
python3 scripts/workflow-state.py create <slug> --intensity feature
```

Lightweight accepted tasks use the same current Workspace schema with concise
acceptance, scope, validation, decision, and risk evidence. Ordinary small work
does not create task state.

Decision and risk assessments are recorded for every workflow; evidenced
`not_required` is allowed only when no material trigger exists. Record receipts:

```bash
python3 scripts/workflow-state.py gate <slug> acceptance passed \
  --evidence "<stable ticket/local source>; docs/specs/<feature>.md"
python3 scripts/workflow-state.py transition <slug> implementation \
  "Implement the accepted task slice"
python3 scripts/workflow-audit.py <slug> --strict --require-active
```

The state machine rejects forward transitions when required receipts are absent,
blocked, or structurally invalid. `archive` additionally requires completed
acceptance coverage, substantive finish evidence, and the exact staged
checked/reviewed candidate, then writes the deterministic immutable terminal
projection. New state uses `archive-introducing-commit` result identity; legacy
full-SHA and `pending` shapes remain passive history with no migration route.

Audit current repository authorities even when no task is active:

```bash
python3 scripts/workflow-audit.py --all --strict
```

The repository audit checks current authorities and the active Workspace when
one exists. Historical Workspace and archive files are passive evidence;
current commands do not migrate, repair, or reinterpret them.

Run a targeted configured profile for incremental feedback and the complete
applicable family for a formal check receipt:

```bash
python3 scripts/workflow-check.py --profile workflow --record <slug>
python3 scripts/workflow-check.py --applicable --record <slug> --staged --base <ref>
python3 scripts/workflow-review.py package <slug> --base <ref> --staged
python3 scripts/workflow-check.py --applicable --record <slug> --staged --base <ref> --reuse
```

Selection falls back to `full` when any changed path is unclassified. `--reuse`
accepts only an exact successful run with identical scope, configuration, and
ordered commands. Recorded facts live in `evidence/checks.jsonl`; the table in
`validation.md` is generated. Targeted profiles never pass the formal gate. A
passed formal gate is bound to its structured run identity; generic
`workflow-state.py gate ... check passed` mutation is rejected, and audit/CI
fail if the bound run is missing, rewritten, incomplete, failed, or stale.

Mechanical planning and implementation transitions may use `workflow-run.py`
`begin` and `verify`; the runner requires caller-authored evidence. Terminal
completion stays with the guarded check, review, finish, archive, combined
staged-CI, and one authorized delivery-commit boundaries and has no convenience
close command.

## Current upstream authority

`docs/workflow/upstream-sources.json` owns selected immutable baselines and
source roles. `docs/workflow/upstream-semantic-traceability.md` owns current
classifications, local deviations, exclusions, conflicts, and re-evaluation
conditions. Explicit upstream upgrades assess affected current clauses and
deviations; ordinary delivery does not replay historical proposal governance.

Create a structured cross-session summary when continuity needs more than the
running journal:

```bash
python3 scripts/workflow-state.py session <slug> <agent-or-scope>
```

Update an existing downstream repository through the explicit, dry-run-first
allowlist:

Routine distribution batches coherent changes behind a CalVer release. Inspect
the next name and produce the immutable staged-adoption plan before opening any
downstream workflow:

```bash
python3 scripts/workflow-release.py next
python3 scripts/workflow-release.py plan --release workflow-YYYY.MM.N
```

The plan partitions the ordered downstream registry into Canary and rollout
targets. Accept Canary verification before rollout; deterministic matching
updates use branch/CI automation, while AI handles only incompatible,
customized, or failing targets. Planning is read-only and never creates a tag or
starts downstream adoption.

```bash
python3 scripts/sync-template.py /path/to/project
python3 scripts/sync-template.py /path/to/project --apply
python3 scripts/sync-template.py --all
python3 scripts/sync-template.py --all --apply
```

The sync manifest is `.ai/template-sync.json`. Ordinary target-only files and
declared project contracts remain preserved. Schema v2 `retiredPaths` entries
grant deletion authority only to explicit historical paths whose complete tree
identity matches an accepted fingerprint and whose path-local Git index and
worktree status is clean. Existing retirement paths in non-Git targets fail
closed; Git metadata, project identity, configured protected paths, and their
case-folded Unicode aliases remain outside retirement authority. Unrelated target
paths do not affect the retirement decision. Dry-run reports absent, safe,
customized, and unsafe retirements; any blocked retirement leaves that target
unchanged. Apply revalidates destination ancestry, retirement identity, and Git
status before its first write and at the closest write/delete seam, materializes
a declared replacement, then retires the historical path. Apply stages content
in a private transaction directory and uses component-wise POSIX dirfd,
`O_NOFOLLOW`, direct-entry rename, quarantine verification, and rollback for the
final install and retirement operations. Before destructive cleanup it creates
a second fd-safe recovery set; partial cleanup failures restore from that intact
set, while concurrent changes to installed targets retain recovery evidence
instead of overwriting either version. Platforms without these primitives fail
closed. Abrupt process or machine termination is not a committed transaction and
may require Git-based recovery; normal refusal and file-operation failures roll
back before returning. If a concurrent actor recreates a retired path while
rollback is restoring it, synchronization fails closed and retains the private
transaction directory as explicit recovery evidence so neither version is lost.
The recovery set gains rollback authority only after its complete copy succeeds;
an incomplete copy rolls back from the primary transaction. Directory modes are
preserved throughout the recovery copy. The commit point is reached only after
the primary transaction is fully removed and final installed content, retirement
Git/index state, and replacement identities are verified. Recovery-set cleanup
then becomes post-commit housekeeping: an incomplete cleanup emits a warning with
the retained recovery path, but does not roll back or report the committed target
as a failed batch item.
Rollback uses platform-native atomic no-replace rename (`renameatx_np` on macOS
or `renameat2` on Linux). Installed destinations are first moved into a unique
private recovery slot and verified there; concurrent destination creation keeps
every version and fails closed instead of unlinking by pathname.
The synchronizer also merges missing `requiredProjectChecks` into
`.ai/project.json` without replacing the project name, adapters, protected paths,
or existing commands.
Template maintainers keep the derived-project inventory in
`scripts/downstream-projects.txt`. Batch mode continues past missing/failing
entries or file-operation failures, reports a final summary, and exits non-zero
when any target fails.

## External frameworks

This template absorbs useful ideas without requiring their runtimes:

- Matt-owned clarification, TDD, implementation discipline, systematic
  diagnosis, and semantic review.
- Trellis-style repository state, context curation, journal, archival records, and
  learning promotion, excluding overlapping engineering protocols.
- Superpowers-informed isolation and verification safeguards that do not
  redefine a Matt or repository-owned capability.

See `docs/workflow/source-mapping.md` for the stack-neutral source mapping and
anti-goals.

See ADR 0001 for conditional execution checklists and ADR 0003 for why
they operate inside the complete formal lifecycle.

See `docs/workflow/execution-isolation.md` for when to keep implementation in
the main session and when to use batch planning, worktrees, or writer subagents.
