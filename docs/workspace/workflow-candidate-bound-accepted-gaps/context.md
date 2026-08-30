# Context: `workflow-candidate-bound-accepted-gaps`

## Diagnosis

- Preserved staged run `f956b565-030a-4f9c-a55d-83aacfc816bc` contains all
  nine configured commands: indexes 2 and 3 failed, and seven passed.
- `workflow-state.py check-receipt --help` exposes only `passed` and `blocked`.
- `formal_run_errors` rejects every non-zero command, while the generic
  `gate check accepted_gaps` path clears structured bindings.
- Final review and both workflow-CI terminal paths require those bindings and
  independently call the all-success validator.

## Implementation context

- `scripts/workflow-check.py` — structured-run validation.
- `scripts/workflow-state.py` — public receipt, state binding, audit semantics.
- `scripts/workflow-ci.py` — pre-archive and archived delivery enforcement.
- `scripts/test-happy-workflow-runtime.py` — public CLI integration authority.

## Execution

- Serial `current-root` implementation in the existing human-facing Windows
  Native session root.
- No writer delegation or role manifest is needed because the runtime and its
  state/CI contract overlap.
- Independent read-only Spec and Standards review remains required after the
  final candidate is frozen.
