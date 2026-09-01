# Risk Assessment: `codex-first-happy-client-dev-integration`

## Result

`cleared-with-controls`

## Blast radius and reversibility

- The candidate combines an already validated UI feature with 19 current-`dev`
  commits spanning App, CLI, Server tests, wire metadata, native tooling, mobile
  planning, and workflow enforcement.
- No production service, installed application, registry, daemon, scheduled
  task, credential, or user data is mutated by the planned local merge/build.
- Before commit, the exact inputs and Git index preserve full recovery. After a
  normal pushed merge, one ordinary revert restores the prior feature head; no
  history rewrite is needed.

## Failure modes and controls

| Failure mode | Control / stop condition |
| --- | --- |
| Feature or target PRD/archive evidence is silently dropped | Pin both parents; inspect index stages; compare heading/row sets; reject duplicate, missing, or conflict-marker output. |
| Textually clean App auto-merge changes runtime behavior | Run focused overlapping public seams, then complete App/CLI/wire families; TDD-repair only candidate-only failures. |
| Session/cross-device transport semantics drift | Treat incoming transport implementation as authoritative; do not edit protocol code unless an integration-only RED proves necessity; run its deterministic tests. |
| Old workflow state becomes invalid under the incoming core | Re-read merged instructions; run the repository upgrade helper if required; strict audit and candidate-bound CI must pass before commit. |
| A parent baseline failure is mislabeled as an integration defect or false pass | Reproduce against the relevant parent when needed; record exact fingerprints and use only the merged accepted-gap mechanism. |
| Generated native output or protected paths enter source | Keep build output in declared generated paths; scan protected paths, binaries, dependencies, and secrets before staging. |
| Invalid state reaches collaborators | Do not commit until checks/review/finish pass; do not push until staged and committed workflow CI pass; verify remote SHA and PR state after push. |
| Merge or validation is interrupted | Once the merge begins, preserve and resolve the merge state rather than rewriting history. Stop before commit/push and resume from pinned inputs and workflow journal. |
| Merge-local workflow support weakens lifecycle provenance | TDD with a real pending two-parent merge and `core.autocrlf=true`; allow only the active workflow root before archive or the single matching terminal row after archive; validate the same structured check/review candidate; keep inherited paths equal to a parent and archive rows equal to the exact parent union plus at most that row. |
| Checkout filters fabricate lifecycle drift or hide staged bytes | Enumerate and read stage-0 index blobs for staged merge comparisons. Keep the checkout snapshot only for canonical parser execution, never as the byte-identity authority. |

## Rollback and limits

- Pre-push: the branch remains recoverable at feature head `e9c76eee`; failed
  validation leaves the merge uncommitted for diagnosis.
- Post-push: use a normal revert of the integration merge if required; never
  force-push the published branch.
- The integration may build but must not install, launch as acceptance proof,
  sign, publish, release, or merge PR #78 under this authority.
