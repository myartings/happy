# Task: Dev Desktop and local CLI RPC compatibility

## Plan

### Goal

Make one macOS Dev refresh establish and verify a compatible Desktop/CLI/daemon
runtime set, or fail before an incompatible Desktop is installed or launched.

### Scope

- macOS `devtools/happyctl` refresh orchestration and reporting.
- Focused shell smoke fixtures for paired runtime success and failure.
- Supporting devtools documentation and lifecycle evidence.

### Out of scope

- App fallback or old-CLI product messaging, npm publication,
  official-baseline behavior, and Windows/Linux refresh changes.

### Execution candidates

| Task | Dependencies | Likely ownership | Parallel candidate | Verification |
| --- | --- | --- | --- | --- |
| T1: Add failing paired-refresh and missing-RPC fixtures | Accepted spec | `devtools/tests/` | No; fixtures define the shared orchestration seam | Focused shell smoke exits with the expected RED failures. |
| T2: Add workspace CLI build/install, daemon health, and installed-bundle compatibility helpers | T1 | `devtools/happyctl` | No; shared command surface | Focused helper success/failure fixtures. |
| T3: Integrate the fail-closed order, dry-run text, and report fields | T2 | `devtools/happyctl`, `devtools/README.md` | No; overlaps T2 and one transaction | Full paired-refresh smoke suite. |
| T4: Verify product contracts and whole candidate | T3 | CLI/App focused tests and workflow evidence | No; integration gate | CLI/App focused tests, devtools smokes, applicable workflow check. |
| T5: Perform authorized real forced refresh and runtime observation | Checked/reviewed candidate and delivery boundary | local Happy Dev runtime | No; consequential terminal validation | Refresh report, daemon status, installed RPC bundle, App launch, New Session observation. |

All units are serial because they share the `happyctl` transaction and its test
fixtures. No writer delegation or batch topology is selected.

## Verify

- [x] Paired-refresh success and missing-RPC failure fixtures pass.
- [x] Dry-run proves no CLI/Desktop/daemon/report mutation.
- [x] CLI Saved Projects RPC tests and build pass.
- [x] App Saved Projects/New Session focused tests pass.
- [x] `python3 scripts/workflow-check.py --applicable` completed for the reviewed source candidate with only explicitly accepted exact gaps.
- [x] Independent Spec and Standards review accepted the reviewed source candidate.
- [x] The authorized real macOS forced refresh and runtime observation pass.

## Progress

- 2026-09-02: accepted contract and serial execution plan created; status `planned`.
- 2026-09-02: T1-T3 completed RED-to-GREEN. Paired orchestration, fail-closed
  stage reporting, replacement-daemon PID proof, compiled-chunk RPC verification,
  dry-run behavior, and documentation pass focused devtools smokes.
- 2026-09-02: T4 focused CLI/App validation passed; candidate-bound applicable
  check and independent review remain.
- 2026-09-02: canonical full check pinned candidate `aa46e4aba73c`; 7/9
  configured commands passed. Verification pauses at an explicit gap/prerequisite
  decision for one flaky App timeout and one independently rejectable workflow
  CRLF/LF fingerprint defect (three fixtures).
- 2026-09-02: the user accepted those two exact gaps. First Standards review
  then found an executable-identity gap; a new RED-to-GREEN fixture proves the
  daemon uses the exact npm-linked workspace CLI even with a decoy `happy` on
  `PATH`, and rejects an unreplaced post-install PID.
- 2026-09-02: second dual-axis review found two convergent contract gaps:
  composite `cli:install` still touched PATH daemon lifecycle, and command
  failures were coerced to 1. A continuation right-sizing receipt retained the
  same Slice; link-only installation plus distinctive 23/24 failure fixtures
  now prove atomic stages, exact executable use, and original status retention.
- 2026-09-02: terminal documented-candidate Spec review found the same status
  contract also applies inside the RPC compatibility stage. That intermediate
  scanner preserved `find`/`grep` statuses; the final AST verifier supersedes
  it and preserves graph-analysis status 2 while ordinary incompatibility is 1.
- 2026-09-02: delivery-candidate Spec review found upper package-derived
  helpers could still coerce `npm root -g` failure. Full-chain fault injection
  now proves exit 27 across install identity, bundle, executable, daemon, and
  RPC consumers.
- 2026-09-02: integrated-candidate Spec review found report writing could
  override an earlier operational failure. The transaction now retains the
  primary status, with direct stop/start and npm-link realpath mismatch
  regression coverage.
- 2026-09-02: final Standards review found the all-dist scan could accept an
  orphan chunk. An orphan-marker RED fixture now stays rejected while the
  actual built `dist/index.mjs` graph reaches the Saved Projects registration.
- 2026-09-02: final Spec review tightened evidence again: Acorn now identifies
  actual reachable imports and `registerHandler` calls, rejecting pseudo-import
  comments/strings and marker-only constants; exact-CLI status confirms the
  replacement PID. A following dual-axis review exposed that CLI status treats
  HTTP failure as inconclusive, so the final gate now performs its own required
  successful `/list` probe tied to the replacement state PID and control port.

## Finish

Status: `complete`

### Outcome

- PR #101 merged the reviewed source to `dev@87c6aa7e`; the authorized real
  refresh then installed and launched the verified CLI/daemon/Desktop set.

### Evidence

| Command or review | Result | Notes |
| --- | --- | --- |
| Focused checks | passed | Devtools smokes, CLI build/20 tests, App focused 16 tests, and diff check passed. |
| Applicable check | accepted gaps | Candidate `68ea8f22fca5`, run `e7d66ca0-279b-4a9c-9aeb-e6ed2a327ad9`; only the accepted CRLF/LF workflow fixture gap remained, while App 245/1946 and Server 112 passed. |
| Independent review | passed | Fresh capable Spec and Standards axes accepted with no findings. |
| Real forced refresh | passed | Report `20260902-165849-refresh-desktop.md`: daemon 49414 -> 61895, HTTP `/list` 200, RPC registration in reachable `types-FRle7Gof.mjs`, signed app installed/launched, New Session UI observed. |

### Remaining limits

- Accepted exact gaps remain external to Issue #98: three CRLF/LF workflow
  merge/archive fingerprint fixtures; the earlier App blob timeout passed in
  the final run but remains a nonblocking harness follow-up candidate.

### Reusable learning

- No general guidance promotion is warranted; exact executable identity and
  link-only refresh orchestration are captured in the accepted spec/decisions.
