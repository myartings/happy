# Finish Review: `main-push-guard`

## Summary

- Added a tracked fail-closed `pre-push` guard for every push targeting
  `refs/heads/main`, including URL-addressed remotes.
- Added idempotent Bash and PowerShell installation, doctor drift detection,
  and a narrowly scoped authorization marker used only by the guarded
  `happyctl` main synchronization path.
- Replaced the unsafe `HEAD:main` repository instruction with the personal
  `upstream/main -> main -> dev` branch model.

## Verification

- Linux real-push smoke tests, adjacent happyctl/iOS tests, Bash parsing, the
  installed-hook real-origin dry run, and all configured workflow checks pass.
- Windows PowerShell 5.1 parsing, Git for Windows real-push smoke tests, and an
  isolated PowerShell guarded `main -> dev` synchronization pass.
- AC1-AC7 are verified with exact commands and results in `validation.md`.
- The real Windows Happy workspace remained clean and did not receive candidate
  hook configuration during isolated validation.

## Whole-diff review

- Review covered branch-switch persistence, direct and URL-addressed main
  pushes, stale installed hooks, marker scoping, allowlist reuse, and rollback.
- No blocking correctness, security, or unrelated-change findings remain.

## Rollback or mitigation

- Disable the clone-local installation with
  `git config --local --unset core.hooksPath`; the tracked implementation remains
  reviewable and reinstallable with `devtools/happyctl install-git-guards`.
- The guard does not modify remote branch protection and cannot prevent pushes
  from other unconfigured clones; install it separately in every working clone.
- If hook content drifts, `happyctl doctor` fails and installation can refresh
  the stable copy under the Git common directory.

## Lessons promoted

- `CONTEXT.md`: not required; no new product-domain knowledge.
- `docs/ARCHITECTURE.md` or ADR: not required; this is local repository
  operations rather than product architecture.
- Skill/workflow rule: promoted into root `AGENTS.md` and `devtools/AGENTS.md`.

## Follow-up

- After this feature commit is integrated into a Windows clone, run
  `.\devtools\happyctl.ps1 install-git-guards` there; isolated validation did
  not mutate the real Windows workspace.
- No external tracker or pull request is linked to this local-only change.
