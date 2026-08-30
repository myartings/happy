# Discovered-Work Scope Containment

Freeze the accepted contract when scoping passes. For an accepted task, that
contract is its Spec, decisions, task links/checklist when present, and
acceptance receipt. For immediate bounded no-task work, it is the user's request
plus applicable repository authority; no Workspace or lifecycle receipt is
created.

Classify every prerequisite, defect, edge case, hardening idea, refactor, test,
or review observation found after that boundary into exactly one primary class
before it expands implementation, tests, checks, or blocking review findings:

| Class | Blocking status | Disposition |
| --- | --- | --- |
| `accepted-contract-gap` | Blocking | Correct it inside the current Slice and trace the change and tests to the existing criterion. |
| `candidate-introduced-regression` | Blocking | Correct the candidate-caused regression even when the accepted examples did not name it. |
| `binding-authority-violation` | Blocking while an explicit repository, safety, security, or architecture authority applies to the candidate | Correct it when bounded; pause for the owning contract, decision, risk, or waiver authority when compliance materially changes the boundary. Preferences and generic best practices do not qualify. |
| `blocking-prerequisite-defect` | Conditional | Apply only a bounded minimal repair that preserves every delivery boundary below; otherwise pause and propose a separately accepted prerequisite Slice or contract reconciliation. |
| `optional-hardening-or-new-threat-model` | Non-blocking until explicitly accepted | Report it as a follow-up candidate. Route a severe new threat model to an explicit risk/scope decision. |
| `unrelated-refactor-or-quality-suggestion` | Non-blocking | Do not add it to implementation or mandatory tests; report it when useful. |
| `new-product-or-acceptance-outcome` | Non-blocking under the frozen contract | Pause only when the user must decide whether to reconcile the contract; never add it automatically. |

Only an accepted-contract gap, a candidate-introduced regression, or an
explicit applicable binding-authority violation may block the current
candidate. Severity is orthogonal to classification. It may change priority or
trigger a risk decision, but it cannot turn new scope or reviewer preference
into current acceptance.

## Prerequisite and material-growth routing

A minimal prerequisite repair may continue only when it preserves the accepted
user-visible outcome, dependency inputs and outputs, consequence/risk class,
review/rejection boundary, merge and rollback boundary, and expected
context/session boundary. Record that preservation rationale in existing task
evidence. Failure of any preservation test is material growth.

Detect material growth on first classification, without waiting for the
two-boundary continuation breaker. A new user-visible outcome, subsystem or
dependency contract, risk or waiver decision, migration/deployment/rollback
path, independently rejectable deliverable, or acceptance behavior outside the
frozen contract routes to exactly one existing authority:

- contract reconciliation for new acceptance or conflict with the frozen
  outcome;
- the applicable risk or decision gate for a new threat model, waiver, or
  material policy/architecture choice;
- diagnosis for an unknown-root-cause blocker without a stable red signal; or
- a dependency-aware prerequisite/remainder Slice proposal for independently
  rejectable work.

None of these routes edits the accepted contract, activates another Workspace,
or mutates a tracker automatically.

## Representative evaluation matrix

This test-only matrix is a falsifiable oracle for the policy decisions. It is
not a production classifier or finding ledger: agents still apply the accepted
contract and cited authority to real discoveries.

<!-- SCOPE_SCENARIOS_START -->
| Scenario | Class | Blocks current Slice | Mandatory current test | Route | External artifact/mutation |
| --- | --- | --- | --- | --- | --- |
| `accepted-gap` | accepted-contract-gap | yes | yes | current-slice | none |
| `candidate-regression` | candidate-introduced-regression | yes | yes | current-slice | none |
| `bounded-binding-violation` | binding-authority-violation | yes | yes | current-slice | none |
| `material-binding-violation` | binding-authority-violation | pause | no-new-test | risk-or-decision | none |
| `bounded-prerequisite` | blocking-prerequisite-defect | conditional | yes | bounded-repair | none |
| `material-prerequisite` | blocking-prerequisite-defect | pause | no-current-test | prerequisite-slice | none |
| `unknown-root-blocker` | blocking-prerequisite-defect | pause | no-current-test | diagnosis | none |
| `optional-hardening` | optional-hardening-or-new-threat-model | no | no | follow-up | none |
| `severe-new-threat` | optional-hardening-or-new-threat-model | decision | no | risk-or-decision | none |
| `unrelated-refactor` | unrelated-refactor-or-quality-suggestion | no | no | follow-up | none |
| `reviewer-preference` | unrelated-refactor-or-quality-suggestion | no | no | follow-up | none |
| `untouched-remediation-scope` | unrelated-refactor-or-quality-suggestion | no | no | follow-up | none |
| `new-product-outcome` | new-product-or-acceptance-outcome | no | no | contract-reconciliation | none |
| `no-task-accepted-gap` | accepted-contract-gap | yes | yes | current-bounded-work | no-artifact |
| `reported-follow-up` | optional-hardening-or-new-threat-model | no | no | finish-or-handoff | none |
| `issue-19-persistence` | new-product-or-acceptance-outcome | no | no | separate-issue-19 | none |
<!-- SCOPE_SCENARIOS_END -->

## Consumer and evidence rules

Implementation classifies before editing. Deterministic checking classifies
before expanding the mandatory check matrix. Initial and remediation review use
the same blocking-authority rule; a reviewer may challenge the frozen contract
or applicable binding standards, but reviewer preference cannot create a new
acceptance criterion. New tests must trace to an accepted criterion, a
candidate-introduced regression, or an applicable binding invariant.

Record a concise classification and rationale whenever a discovered item
changes, blocks, or is carried out of the run. Finish and an actual handoff
report non-blocking follow-up candidates with classification and rationale, or
state that none were found. Reporting never creates an Issue, comment, label,
or other external mutation without explicit authorization. Issue #19 may later
persist stable finding and fix identities without redefining this taxonomy.
