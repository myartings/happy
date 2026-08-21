# Tasks: Local Main Push Guard

## T1 — Guard contract and RED coverage

- [x] Add focused real-push fixtures for rejected feature/direct/product pushes
  and accepted authorized/non-main pushes.
- [x] Record the intended RED failure before production behavior exists.

## T2 — Tracked hook and Happyctl integration

- [x] Add the tracked `pre-push` hook and candidate validation command.
- [x] Add idempotent hook installation and doctor drift detection.
- [x] Scope the authorization marker to the Bash and PowerShell main pushes.

## T3 — Durable branch instruction

- [x] Replace the conflicting `HEAD:main` instruction with the guarded
  `upstream/main -> main -> dev` workflow.

## T4 — Verification and review

- [x] Run focused smoke tests and syntax checks.
- [x] Run applicable devtools and repository workflow checks.
- [x] Review the whole diff for bypasses, false positives, and unrelated edits.
