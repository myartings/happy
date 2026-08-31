# Codex-first Happy Client Latest-`dev` Refresh Specification

## Status and inputs

- Accepted by the user on 2026-08-31 as the continuation of PR #78 integration.
- First parent: `ddb3034e2e3006b9b70f1e38d6cced99cdef1de0`.
- Target parent: `87b5385e82d96b5eaab68bc65a968cf36167e9c5`.
- Common integration base: `68cfb6f915fb25f5ecd444df2aefafeccae92fa8`.
- Product authorities: `docs/specs/codex-first-happy-client.md` and
  `docs/specs/needs-attention-current-requests.md`.

## Intent

Make PR #78 mergeable against the latest `dev` without rewriting its history,
while retaining both the packaged-Windows Codex-first client and the newly
merged current-request Needs Attention behavior.

## Observable behavior

- Packaged Windows continues selecting the Codex-first runtime, workspace
  chrome, responsive layout, and session navigation; Linux and standalone/mobile
  continue using their accepted legacy presentation paths.
- Needs Attention continues projecting current permission and answer requests,
  including offline sessions, once per Session with permission before answer
  before unread and stable ordering within a tier.
- A legacy Session whose state is `input_required` but whose richer attention
  metadata is unavailable remains visible as answer-level actionable work.
- When richer attention metadata exists, it determines the request reason;
  stale legacy state cannot promote an answer-only projection to permission.
- Pinning never changes attention severity order. Disabling Needs Attention
  restores ordinary list structure and navigation behavior.
- Review/Answer remains navigation-only. Focus is accepted only through the
  incoming version/source validation; no list action sends a response RPC or
  mutates provider/request state.

## Merge and compatibility constraints

- The result is an ordinary two-parent merge commit whose parents are the exact
  pinned inputs above.
- `archive.md` is a lossless, duplicate-free union. `SessionView` and
  `SessionsList` retain both import families and all auto-merged calls.
- Existing parent tests are retained. Integration-only production repair must
  follow the focused RED-to-GREEN sequence in `scoping.md`.
- Conflict markers, unresolved index stages, dropped rows/imports, duplicate
  attention rows, severity inversion, and Codex-first runtime regression are
  hard failures.

## Non-goals

- New request kinds, direct list responses, protocol changes, notifications
  redesign, or changes to current-request copy.
- Rebase, amend, reset, force push, PR merge/close, branch deletion,
  installation/replacement, signing, publication, or release.
- Repair of failures reproduced unchanged on a pinned parent without a separate
  accepted scope.

## Acceptance criteria

| ID | Verifiable outcome | Required evidence |
| --- | --- | --- |
| LR-001 | History contains a normal merge of exact parents `ddb3034e` and `87b5385e`, with no history rewrite. | Merge-parent inspection and reflog/log evidence. |
| LR-002 | Archive rows from both parents and this workflow's eventual terminal row are present exactly once, with no conflict markers. | Parent row-set comparison, strict validator, diff scan. |
| LR-003 | `SessionView` and `SessionsList` retain both Codex-first and current-request imports/callers and typecheck. | Conflict-stage inspection, symbol scan, App typecheck. |
| LR-004 | Packaged Windows remains Codex-first while Linux and standalone/mobile retain legacy behavior. | Existing Codex-first runtime/contract tests and App suite. |
| LR-005 | Current permission/answer projection, offline visibility, deduplication, severity ordering, stable tie-break, pin isolation, feature-off rollback, and legacy `input_required` fallback all coexist. | Existing parent tests, focused RED→GREEN, complete visible-list and current-request suites. |
| LR-006 | Current-request row/detail focus remains version-safe and navigation-only inside the Codex-first Session shell. | Focus/navigation tests, zero-response assertions, App typecheck. |
| LR-007 | The exact merged candidate passes the complete applicable profile and Windows non-install build/smoke signals, with only exact parent-reproduced gaps eligible for acceptance. | Structured check receipt and native evidence. |
| LR-008 | No unauthorized protected, secret, generated, binary, dependency, protocol, install, or release delta is introduced. | Source scans, whole-candidate review, strict workflow audit/CI. |
| LR-009 | The completed branch is normally pushed, remote head equals local head, and PR #78 is no longer `CONFLICTING`; the PR is not merged or closed. | Push output, `git ls-remote`, `gh pr view`, clean status. |

## Acceptance-to-signal map

- LR-001--LR-003: Git stages/parents, exact source comparison, typecheck, and
  marker/whitespace scans.
- LR-004--LR-006: Codex-first, visible-list, current-request projection/focus,
  navigation, row/detail, and App regression suites.
- LR-007--LR-008: `workflow-check.py --applicable`, Windows doctor/smoke and
  uninstalled native build, strict audit, staged/committed CI, and independent
  Spec/Standards review.
- LR-009: explicit local/remote/PR verification after the authorized normal push.
