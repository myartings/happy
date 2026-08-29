# Task: `<feature>`

Use this optional execution checklist when a delivery slice has multiple steps,
acceptance criteria, internal dependencies, or a high-risk audit need. Link it
from `docs/workspace/<slug>/`; the stable ticket, spec, or local source owns the
acceptance boundary, while the Workspace owns machine state, role contexts,
validation, finish review, and terminal archive.

## Plan

### Goal

`<observable outcome>`

### Scope

- `<included boundary>`

### Out of scope

- `<explicit exclusion>`

### Execution candidates

| Task | Dependencies | Likely ownership | Parallel candidate | Verification |
| --- | --- | --- | --- | --- |
| `<coherent task>` | `<task IDs or none>` | `<files/module/shared contract>` | `<yes/no and reason>` | `<closest signal>` |

Candidate annotations support early discovery only. `scoping` owns the initial
`serial` or `batch-plan` decision. Record a later `parallel-reassess` only when
readiness, dependencies, or ownership materially changes.

## Verify

- [ ] `<acceptance criterion mapped to a deterministic or review signal>`
- [ ] The narrow reproduction or targeted test passes.
- [ ] The complete applicable test family passes, or each gap is named.
- [ ] The whole diff contains no unrelated, generated, credential, or runtime files.

## Progress

- `<date>`: contract created; status `planned`.

## Finish

Status: `pending`

### Outcome

- `<implemented behavior>`

### Evidence

| Command or review | Result | Notes |
| --- | --- | --- |
| `<exact command>` | `not run` | `<reason>` |

### Remaining limits

- `<gap, unavailable check, upstream dependency, or none>`

### Reusable learning

- `<evidenced rule to promote, or none>`
