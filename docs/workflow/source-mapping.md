# Workflow Source Mapping

This document audits how AICodingTemplate absorbs ideas from iOSTemplate's
Matt-style skills, Trellis-style repository memory, and Superpowers failure-mode
observations. The template keeps only stack-neutral workflow rules.
Technology commands, project vocabulary, and domain constraints belong in each
adopting repository.

This is a high-level ownership map, not proof of upstream equivalence. See
[`upstream-semantic-traceability.md`](upstream-semantic-traceability.md) for
version-pinned Matt Skills/Trellis clauses, the pinned observational Superpowers
boundary, per-candidate judgments, and known conflicts.

## Design Boundary

AICodingTemplate combines Matt's ordinary engineering flow with a local adapter
for explicitly accepted Trellis tasks; it is not an external framework runtime:

- It does not require Matt skills, Trellis, Superpowers, or their CLIs.
- It requires `scripts/workflow-state.py` and active-task audits only after a
  Trellis task is accepted.
- It uses `scripts/workflow-audit.py --all --strict` for repository-wide health,
  including terminal archive and stranded-task consistency when ACTIVE is empty.
- It does not assume a programming language, app platform, deployment target, or
  business domain.
- It stores durable project facts in repository files so Codex, Claude Code, and
  human maintainers can resume from evidence instead of chat history.
- It treats human-visible trackers as coordination and acceptance-boundary
  surfaces, not as replacements for repository acceptance criteria and
  validation evidence.
- Durable solo delivery is Issue-first, while immediate bounded normal-risk
  work remains Issue-optional. One durable implementation Issue represents one
  independently deliverable slice.
- Issue state never supplies local execution authority: a named Issue permits
  read-only inspection and a bounded preparation proposal, while explicit local
  acceptance owns Workspace activation and every lifecycle gate.
- Durable Issue intake and tracker-backed task acceptance share one
  repository-owned right-sizing assessment. Matt remains the owner of
  single-/multi-session engineering routing, Trellis remains the accepted-task
  lifecycle owner, and Issue hierarchy never replaces dependency interfaces.

## Matt-Style Discipline

Matt is the semantic owner for overlapping engineering practices. Trellis may
persist their inputs and outputs but cannot supply a competing protocol.

| Source idea | Template landing point | Status |
| --- | --- | --- |
| Design-tree frontier clarification before scope | `grilling`, `create-prd`, `decision-map`, `generate-spec` | Matt-owned |
| Keep shared project language | `CONTEXT.md`, `AGENTS.md` | Adopted; Claude snapshots are currently unmanaged |
| Challenge changed domain language and create ADRs sparingly | `decision-map`, `update-spec`, `CONTEXT.md` | Matt-owned, conditional; no new lifecycle gate |
| TDD at an agreed public seam with independent expectations; no refactor inside RED-to-GREEN | `tdd`, `scoping`, `implement` | Matt-owned, conditional when TDD is selected; Matt's review-stage placement is recorded, while optional pre-review refinement is an explicit local conflict because formal review is read-only |
| Single-session versus multi-session routing | current-session `implement` or spec/tickets plus fresh ticket contexts | Matt-owned; ordinary bounded work stays in the current context |
| Implementation discipline | `implement`, bounded engineering skills | Matt-owned; task state is conditional |
| Diagnose through a tight red-capable exact-symptom loop before theory or patching | `diagnose`, `implement`, `check` failure routing | Matt-owned, conditional for unknown-root-cause work |
| Concise cross-session handoff | OS temporary directory, deliberate pause/transfer/request trigger, references to durable sources, redaction, and recoverable active-code state | Matt-owned standalone bridge; never activates lifecycle, transports code, or grants mutation authority |
| Separate Spec and Standards review | `review`, review gate | Matt-owned; parallel read-only contexts required |
| Architecture review for consequential changes | `risk-gate`, `review`, ADRs | Matt-owned review plus local risk controls |
| Tracker coordination | `.ai/project.json` tracker adapter and `tracker-workflow` | Conditional on an accepted multi-session task or explicit tracker request |
| External-request intake quality | `tracker-workflow`, `grilling`, `decision-map`, `generate-spec`, conditional domain modeling | Matt-owned triage semantics adapted through one operational tracker surface |

The template does not make brainstorming, a PRD, tracker creation, Workspace,
or repository handoff mandatory for ordinary work. Complex, high-risk, durable,
or cross-session work asks before creating a Trellis task. Once accepted, task
artifacts scale with consequence and the ordered lifecycle is preserved.

External-request intake and tracker mutation are separate capabilities. Matt
owns intake quality: complete context, redundancy/prior-decision search,
maintainer recommendation, claim verification, and behavioral agent-ready
shaping. Repository integration owns the configured adapter and explicit-write
safety. Ordinary immediate solo work still requires neither an Issue nor
tracker triage. The pinned mandatory AI-comment disclaimer and
`.out-of-scope/` rejection store are explicit local exclusions, not accidental
omissions or competing implementations.

The local clarification protocol follows Matt Skills v1.2.3: ask the whole
currently unblocked design-tree frontier per round. Trellis
`trellis-brainstorm` uses a competing one-question protocol and is explicitly
excluded rather than blended.

## Trellis Task Lifecycle

Trellis owns task activation, Plan/Execute/Finish, durable task state, recovery,
archive, and learning only after explicit task acceptance. It does not own an
engineering practice already assigned to Matt.

| Source idea | Template landing point | Status |
| --- | --- | --- |
| Task-creation consent and no-task opt-out | `AGENTS.md`, `docs/workflow.md`, routing skills | Trellis-owned boundary; a normal small task may proceed directly |
| Durable lifecycle state | `docs/workflow.md` and `workflow-state.py` | Local adapter for an accepted Trellis task |
| Project spec as durable context | `docs/PRD.md`, `docs/specs/`, `docs/tasks/` | Adopted |
| Workspace memory for active tasks | `docs/workspace/<slug>/` | Adopted |
| Role-scoped context selection | `contexts/implement.jsonl`, `contexts/check.jsonl` | Created only for actual dispatch; Codex inline task work needs no manifest |
| State, journal, session, and validation records | `workflow.json`, generated `state.md`, `journal.md`, `session-index.md`, `sessions/`, `validation.md` | Adopted |
| Continue from repository state | `start`, `continue`, `workflow-state.py` | Adopted for accepted tasks; otherwise inspect current repository state normally |
| Versioned explicit downstream adoption | `.ai/template-release.json`, `workflow-release.py`, `.ai/template-sync.json`, `sync-template.py` | Repository-owned CalVer batching and Canary planning over the adopted Trellis-style explicit-adoption boundary |
| Learning promotion | `finish-work`, `update-spec`, `finish.md` | Adopted |
| Parallel task tracking | `children.md`, `children.json`, `integration.md` | Adopted when needed |
| `trellis-brainstorm` questioning protocol | Not included | Excluded overlap; Matt `grilling` owns clarification |
| Trellis implement/check agent protocols | Not included | Excluded overlap; Matt owns implementation and semantic review while repository integration owns deterministic checks |
| Trellis Plan/Execute/Finish transition semantics | `workflow-state.py`, `finish-work` | Preserved for accepted tasks; inactive for no-task work |
| `.trellis/` directory and Trellis CLI | Not included | Deliberately omitted |

The omission is intentional: adding `.trellis/` would create a second source of
truth beside `docs/PRD.md`, `docs/specs/`, `docs/tasks/`, and
`docs/workspace/`.

## Superpowers Observational Failure Modes

Superpowers is a registered observational upstream, pinned at `v6.3.0` /
`b36e0829c6d0140e93cfef2ca599b1b07d4a7797`. It supplies failure-mode evidence
and candidate safeguards, not capability ownership or a default runtime layer.

| Source idea | Template landing point | Status |
| --- | --- | --- |
| Test-driven development | `tdd` | Excluded overlap; Matt `tdd` owns the capability |
| Systematic debugging | `diagnose` | Excluded overlap; Matt diagnosis owns the capability |
| Verification before completion | `check`, `finish-work`, gate receipts, `validation.md` | Repository-owned gate; Superpowers is failure-mode evidence only |
| Independent review | `review` | Excluded overlap; Matt two-axis review owns semantics and topology |
| Subagent/worktree isolation | `batch-plan`, intensity matrix, `execution-isolation.md` | Repository-owned topology informed by Superpowers failure modes |
| Root session–worktree affinity | `start`, `scoping`, `implement`, `handoff`, `execution-isolation.md` | Repository-owned client-neutral safeguard; native harness handoff is preferred, with a fresh-session fallback when rebinding is unavailable |
| Branch/worktree finish discipline | `finish-work`, `batch-plan`, `task-links.md` | Repository-owned; Superpowers is failure-mode evidence only |
| Preserve modified or untracked files during owned-worktree cleanup | `execution-isolation.md`, `batch-plan` | Repository-owned safeguard informed by Superpowers v6.3.0 |
| Mandatory scratch ledger | Not included | Deferred until repeated state-loss evidence |
| Mandatory subagent implement/review loop | Not included | Deferred until repeated review-drift evidence |
| Mandatory workflow behavior pressure tests | `scripts/test-workflow.py`, `scripts/test-workflow-ci.py` | Repository-owned controls informed by observed failure modes |
| Near-unconditional skill-first dispatch from `using-superpowers` | Not included | Explicitly rejected: it conflicts with registered capability ownership and conditional repository routing |
| Consequence-scaled ceremony with explicit verification | Matt direct work or accepted-task evidence scaled to consequence | Official task/no-task routing plus local applicable checks |
| Same-shape batching and continuous execution | `scoping`, `batch-plan`, applicable checks | Assessed only when an accepted task has multiple independent ready units |
| Delivery-Slice right-sizing | `tracker-workflow`, `ticket-task-contract.md`, `scoping`, `continue`, `workflow-state.py right-sizing` | Repository-owned intake/lifecycle adapter preserving Matt route judgment and Trellis task authority |
| Simple Sol/Luna guidance and no nested delegation | direct Agent defaults and one-level Spec/Standards reviewers | Adopted where runtime support exists; model guidance creates no execution owner and Matt review topology remains owner |

Superpowers is used as a failure-mode reference, not as a second workflow layer
or an owner of a Matt-owned engineering capability.
If agents repeatedly claim completion without evidence, lose long-task state, or
review their own work unreliably, tighten the relevant local skill instead of
installing the whole framework by default.

## Generic Workflow Mapping

| Generic phase | Main surfaces | Key rule |
| --- | --- | --- |
| Route | `start`, `continue`, Matt routing, `docs/workspace/ACTIVE.md` | Resume an accepted task when present; otherwise keep bounded work in the current session. |
| Plan | `grilling`, `create-prd`, `decision-map`, `generate-spec`, `generate-tasks`, `risk-gate` | Use the smallest adequate contract; durable Trellis artifacts require accepted task creation. |
| Scope | `scoping`, optional role manifests | Resolve boundaries, risks, tests, and actual execution topology without manufacturing task evidence. |
| Build | `implement`, `tdd`, `batch-plan` | Implement small slices with relevant context and preserved user changes. |
| Verify | `check`, `.ai/project.json`, conditional `validation.md` | Run exact applicable commands; persist results only for an accepted task. |
| Review | `review`, code diff | Applicable engineering diffs use Matt's parallel read-only Spec/Standards review. |
| Finish | Matt commit flow or Trellis `finish-work` | Direct work ends after checks/review and authorized commit; accepted tasks also learn and archive. |

## Audit Result

The current template machine-checks repository contracts, required evidence,
skill mirrors, and structural invariants. Those checks do not prove Agent
behavioral adherence; Matt-owned engineering behavior still requires semantic
review or a purpose-built behavioral evaluation. “Style” means a locally owned
adaptation unless the detailed trace classifies a behavior as preservation:

- Matt-owned frontier clarification, TDD, implementation, diagnosis, and
  two-axis semantic review.
- Trellis task activation and ordered lifecycle, with repository state,
  role-scoped context, validation, archive, and learning materialized only for
  accepted tasks and overlapping engineering protocols excluded.
- Superpowers failure-mode evidence informing repository-owned verification and
  execution isolation, without importing its overlapping review protocol.

The main anti-goals are also represented:

- No stack profiles in the workflow core.
- No domain-specific quality gates.
- No `.trellis/` second source of truth.
- No manual phase advancement for an accepted task outside the local adapter.
- No Micro, Record-only, Workspace, writer-subagent, context manifest, or
  scratch-ledger layer for ordinary no-task work; applicable Matt review keeps
  its two independent read-only contexts.
- No external dispatcher as the default execution path.

Residual risk: future project adapters may reintroduce stack or domain
assumptions. Keep adapters in `.ai/project.json`, project-local specs, and
project-local skills; do not promote adapter rules back into this core template
unless they are true for ordinary coding projects.

Reusable practices may still be discovered and proven in downstream templates.
Use `promote-downstream-practice` to execute the downstream-to-upstream
promotion under `docs/workflow/downstream-practice-promotion.md`. After
acceptance, this repository owns the generic contract;
`adopt-upstream-template` handles its separate downstream distribution.

Historical workflow proposals remain passive Git evidence. Explicit upstream
upgrades use `upstream-sources.json` for selected baselines and
`upstream-semantic-traceability.md` for current classifications and local
deviations.
