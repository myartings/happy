# Risk Assessment: `codex-first-happy-client`

## Result

**Cleared with controls.** The feature may proceed as a client-presentation and
navigation change. It is not cleared to alter authorization payloads,
authentication, encryption, synchronization, server behavior, Machine RPC, or
Session protocols.

## Affected surface and blast radius

- **Users**: every authenticated packaged macOS Happy user, across Codex,
  Claude, and other supported Agent backends.
- **Data**: existing local/synced settings, Session and Machine metadata,
  drafts, message/tool output, attention state, attachments, and panel state are
  displayed or selected but must not be migrated or reinterpreted.
- **Permissions**: the UI presents existing one-time, Session-scoped,
  accept-edits, bypass, deny, abort, and Agent-question decisions. The handlers
  and payload contracts remain authoritative.
- **External systems**: existing Happy services, remote Machines, Agents, and
  optional GitHub Issues remain reachable through existing APIs. Search and
  shell navigation introduce no new external calls.
- **Operational surface**: the final development App may replace the installed
  development client only through the existing backup/verify procedure. It
  does not replace the official-baseline client or publish externally.

The visual shell is broad, but the permitted implementation layer is bounded.
A rendering defect can affect the complete daily loop; a payload or protocol
defect could authorize unintended Agent action, lose a draft, or break
cross-device compatibility and therefore has a much higher cost of false
success.

## Reversibility

- Source and presentation changes are reversible through a development-only
  rollback to the pre-convergence packaged desktop presentation.
- No data migration is allowed, so rollback does not require transforming user
  data.
- Generated App bundles are replaceable. Installation must create or retain a
  recoverable backup and verify the exact bundle target before replacement.
- External operations such as sign-out, GitHub mutations, permission approval,
  Agent execution, public distribution, and notarization are not used as
  destructive verification steps.

## Failure modes and controls

| Failure mode | Consequence | Required control |
| --- | --- | --- |
| Approval labels/actions are reordered or wired to the wrong payload | Unintended authorization, denial, abort, or broad Session permission | Freeze current handlers; add provider/action payload matrix tests before presentation edits; submit guard proves exactly-once behavior |
| Broad permission is visually promoted as a harmless default | User grants more authority than intended | Preserve semantic hierarchy; broad/destructive choices remain explicit; focused accessibility and review inspection |
| Unsupported backend control is shown | Misleading state or invalid request | Pure backend capability projection and representative Codex/Claude matrices; existing spawn/message request assertions |
| Search or navigation triggers an external action | Unintended remote or account mutation | Search indexes local state only; results activate existing routes/actions; destructive/system commands retain confirmation or current behavior |
| Sign-out or restore becomes an easy accidental primary action | Session interruption or local-state loss | Keep low-frequency/destructive actions in account/Settings surfaces with existing confirmation/authorization boundaries |
| New shell hides Happy-only features | Functional regression despite visual parity | Route-reachability inventory, gap matrix, deviation ledger, and one-to-one daily-loop capability checks |
| Draft or selection is lost during navigation/start failure | Lost user work | Preserve existing draft/confirmation logic; start failure and duplicate-submit tests |
| Session status becomes contradictory or stale | User acts on false runtime state | Derive shell/row/transcript/composer presentation from current authoritative state; lifecycle/reconnect fixture matrix |
| UI changes leak to standalone Web or mobile | Cross-platform regression | Central packaged-desktop runtime gate and explicit non-Tauri projection tests |
| Stored settings fail after the global default changes | Startup failure or appearance reset | No destructive migration; parse old/default/current settings fixtures; rollback independent of synced data |
| Private reference or Session content enters source/evidence | Privacy disclosure | Screenshots remain in `/Users/myartings/Sync/tmp`; tracked evidence stores only facts, hashes, measurements, and redacted paths |
| Packaged validation replaces the wrong App | Loss of the active client or installed state | Resolve exact source and target paths, retain backup, verify bundle ID/signature/version, and avoid official-baseline target |
| Work is interrupted midway | Partially converted shell | Keep slices independently testable, preserve rollback throughout convergence, and record workflow state after each slice |

## Preconditions

- Feature branch/worktree is based on the current personal `dev` integration
  branch before product-code edits.
- PRD, specification, tasks, decisions, reference evidence, gap matrix, and
  deviation ledger validate in the active workflow.
- T01 lands the central packaged-desktop and rollback contract before host
  surfaces are converted.
- Existing permission, spawn, message, Session, and settings behavior provides
  the compatibility oracle.
- Strict workflow audit passes before implementation.

## Stop conditions

Stop autonomous implementation and require a new contract or authority if:

- parity requires a change to an approval payload, authentication,
  authorization, encryption, sync, Server, Machine RPC, or Session protocol;
- a Happy capability cannot remain discoverable and operable using a bounded
  grammar adaptation;
- preserving a draft, stored setting, or existing Session requires a data
  migration;
- validation requires real destructive permission, GitHub, account, or public
  distribution actions;
- the exact App installation target or backup/recovery state cannot be proven;
- protected paths or a new `.ai/project.json` risk trigger enters the product
  diff unexpectedly.

## Review and release controls

- Run a dedicated whole-diff risk review after deterministic checks and before
  final App installation.
- Inspect all changes to permission, account, restore, connection, and external
  integration components even if they are presentation-only.
- Review the protected-path and protocol/schema diff explicitly.
- Final user acceptance occurs once against the complete installed macOS
  candidate. It does not authorize commit, push, notarization, or publication.

## Ownership decisions

No new responsible-owner decision is required for the cleared client-only
scope. The user has already accepted global Codex-first behavior, Happy feature
preservation, macOS-first delivery, the complete daily loop, and one final
acceptance. Any stop condition above reopens owner review.

## Windows RED-only ownership addendum — 2026-08-30

Decision D8 authorizes the Windows Root to extend the stable platform contract
without treating Windows evidence as macOS acceptance. The current slice only
changes a public contract test to require packaged Windows Codex-first behavior
while proving packaged Linux and non-Tauri standalone clients remain legacy.
It does not change production eligibility, build or install an App, launch a
runtime, alter stored data, or touch a protected protocol/auth/sync/Server path.
The existing stop conditions therefore remain sufficient and no new risk
trigger is introduced for this RED-only step.

## Windows minimal GREEN addendum — 2026-08-30

The accepted GREEN changes only the pure packaged-desktop platform eligibility
predicate from macOS-only to macOS-or-Windows. The same predicate controls
Codex-first enablement and the existing build-time rollback, while explicit
tests keep Linux and non-Tauri clients on legacy behavior. This remains within
the cleared client-presentation boundary: it adds no data migration, stored
setting, external operation, authentication/authorization effect, sync or
protocol change, Server/Machine RPC change, package installation, or release
action. Existing stop conditions and protected-path checks remain mandatory.

## Windows native package-validation addendum — 2026-08-30

Decision D8 also clears a bounded native Windows package-generation slice after
the eligibility GREEN and full App checks. The machine-local `happyctl.ps1`
configuration currently names the primary checkout, so every command must use
a temporary repository-external override that binds `HappyRepo` to the exact
owning worktree. This prevents a successful build from being false evidence for
the wrong source tree.

`doctor` is read-only. `build-desktop` may refresh generated dependencies,
export the Web frontend, compile Rust, and create Windows installers only under
the project-declared generated paths and machine-local log directory. Exact
pre/post Git snapshots must prove it did not stage or alter tracked source.
`update-desktop -DryRun` may inspect installer, process, registry, install, and
backup state, but it must not stop a process, write the registry, copy or remove
an installation, prune a backup, or launch the App.

The Windows package is expected to be unsigned unless separate signing evidence
proves otherwise; no signing identity, certificate, timestamping, distribution,
or release action is authorized. The configured default WebView2 installer mode
may download its bootstrapper while packaging, but the generated installer is
not executed. Any prerequisite failure, tracked-source mutation, ambiguous
source root, protected-path change, signing request, or need for actual install
or launch authority triggers a stop. Existing rollback and exact-target controls
remain mandatory for any later installation slice.

## Windows authorized installation risk gate — 2026-08-30

### Result

**Cleared with controls.** Decision D9 supplies the previously missing owner
authority for one recoverable replacement of the exact per-user `Happy (dev)`
installation and one bounded launch verification. The operation remains
unsigned local development evidence and has no release authority.

### Blast radius and reversibility

- Affected state is limited to the live `app.exe` process at the exact expected
  path, `C:\Users\myartings\AppData\Local\Happy (dev)`, its HKCU uninstall
  entry, Happy Devtools backup/log state, and the newly installed development
  files. No user Session, synced setting, credential, official-baseline App, or
  repository source is an intended write target.
- The existing installation is stopped only after its path is verified. It is
  fully copied before removal, and the uninstall entry is captured both in
  memory and as `uninstall-registry.json` inside the new backup.
- `update-desktop` restores the copied installation and registry snapshot when
  install or post-install validation fails. A successful install remains
  manually recoverable from the retained dated backup.

### Failure modes and controls

| Failure mode | Consequence | Control / stop condition |
| --- | --- | --- |
| Machine config binds to the primary checkout | Wrong source is installed with misleading evidence | Use a temporary external override for only `HappyRepo`; doctor must print the exact worktree before proceeding |
| Candidate changed after package inspection | Unreviewed artifact is installed | Recompute NSIS and built-executable SHA-256 immediately before the dry-run and actual update; stop on any mismatch |
| Wrong process or install directory is targeted | Unrelated application data is stopped or removed | Require exact executable and per-user install paths; rely on `Remove-ExistingDesktopInstallForReplace` absolute-path equality guard |
| Backup or registry capture is incomplete | Prior installation cannot be recovered | Existing uninstall entry must snapshot; new backup and `uninstall-registry.json` must exist before removal; stop on any copy/write failure |
| Silent NSIS install fails or returns a partial install | Development client becomes unavailable | Built-in catch restores the backup and registry snapshot; do not retry automatically |
| Installed bytes differ from the reviewed build | False package success or wrong payload | Built/installed `app.exe` SHA-256 equality is mandatory inside the updater and independently afterward |
| Default retention deletes an existing backup | Avoidable loss of recovery evidence | Use `KeepBackups=4`, preserving all three existing backups plus the new one; verify names/count after success |
| Launch resolves elsewhere, exits too early, or leaves children | False runtime evidence or stray process | `verify-desktop` requires exact CIM executable path within 15 seconds and stops only its newly observed verification processes |
| Operation is interrupted | Process may be stopped or replacement may be incomplete | Preserve the pre-action inventory; on any command failure inspect install/backup/registry state before considering a bounded rollback or retry |

### Residual limits

- Successful install and launch prove installer behavior and initial process
  startup only. They do not prove authenticated flows, pixels, keyboard,
  accessibility, rollback execution, signing, updater compatibility, store
  readiness, or public distribution.
- The existing Tauri `__TAURI_BUNDLE_TYPE` warning and `NotSigned` state remain
  explicit package gaps. Neither may be reclassified as passed by installation.

## Whole-diff remediation risk addendum — 2026-08-30

### Result

**Cleared within the existing client-presentation controls.** The four accepted
fixes are pure selection, responsive-layout, Header-ownership, and display-label
projections plus bounded consumers. They introduce no new authentication,
authorization, synchronization, protocol, Server, Machine RPC, persistence,
data-migration, destructive-operation, or release trigger.

### Additional controls

- Notification navigation may select only an existing visible attention
  Session and must preserve `/inbox` as the no-attention fallback; it may not
  mark items read or answer permission/input requests.
- Width composition must consume projected panel widths and preserve the
  existing 600-point main minimum without mutating the stored left/right widths
  or zen state.
- Header ownership may suppress duplicate presentation only under the enabled
  packaged Codex-first contract; standalone Web and native mobile remain on
  their legacy route-Header decisions.
- Duplicate-name disambiguation may expose only the Machine display name/host
  already present in local synchronized state, with Machine ID as the existing
  non-secret fallback; it may not fetch or persist new identity data.
- A new source GREEN supersedes the installed candidate for product acceptance,
  but no package rebuild, installation, launch, rollback execution, signing, or
  release action is authorized in this remediation slice.

## Current remediated Windows candidate risk gate — 2026-08-30

### Result

**Cleared with controls.** Decision D10 supplies owner authority to rebuild the
current four-fix source, replace only the exact per-user Windows `Happy (dev)`
development client, perform the repository's bounded launch verifier, and
inspect the packaged shell without external or destructive functional actions.

### Preconditions and controls

- Source must remain the registered
  `C:\Users\myartings\workspace\happy\.dev\worktree\codex-first-happy-client-windows`
  worktree on branch `codex-first-happy-client-windows` at
  `a269068ab42316a6e5749882cd81499aeb31fabb`, with an empty index. Focused
  remediation tests, Happy App typecheck/full tests, and strict audit must pass
  before installation.
- Every `happyctl.ps1` operation must use a repository-external temporary
  configuration that imports the existing machine configuration and overrides
  only `HappyRepo` with the owning worktree. `doctor` must print that exact
  root before build or install.
- The current install is exactly
  `C:\Users\myartings\AppData\Local\Happy (dev)` with app SHA-256
  `AF18D94139109EBF2FE7B90237F7C5213705210E508F26B4B0BA2854C9416236`, a valid
  per-user uninstall entry, no target process, and four existing Windows
  backups. Use `KeepBackups=5` so success retains all four plus the new
  pre-replacement backup and registry snapshot.
- Recompute app/NSIS hashes after the build and immediately before dry-run and
  replacement. The dry-run must identify the exact source, target, uninstall
  entry, process set, backup directory, and zero removals, then end with
  `No changes made.`
- Actual replacement must stop only exact-path target processes, create the
  fifth backup and `uninstall-registry.json`, install silently, and prove
  installed/build `app.exe` byte equality. On failure, the updater's automatic
  restoration is required; do not retry until install, registry, backup, and
  process state are inspected.
- `verify-desktop` may launch only the exact installed executable and must stop
  only the verification process it created. Subsequent packaged inspection is
  limited to shell rendering, accessibility state, route-local navigation, and
  window resizing that do not send messages, start Sessions or Agents, answer
  requests, change settings, mark attention read, authenticate, or mutate an
  external system.
- Keep the candidate unsigned. Intentional rollback execution, signing,
  commit, push, PR, publication, release, official-baseline replacement, and
  protected auth/sync/protocol/Server/Machine RPC edits remain stop conditions.

### Residual limits

Under the then-current D10 contract, Windows compile/package/install/launch and
named smoke evidence could not satisfy the required owning-macOS daily-loop,
native accessibility, signing, matched appearance/responsive captures, or
executed rollback proof. The unchanged native-Windows Server path-fixture
failures remained outside that client-only risk clearance. Decision D11 below
supersedes the macOS prerequisite for the current Goal.

## Windows owning final-acceptance risk gate — 2026-08-30

### Result

**Cleared with controls.** Decision D11 makes native Windows reference capture,
matched installed-client evidence, keyboard/UIA inspection, and a bounded real
daily-use loop part of the accepted client-presentation verification. It does
not clear implementation changes to authentication, authorization or
permission payloads, encryption, synchronization, Server, Machine RPC, Session
protocols, persistence schemas, data migration, signing, public release, or
destructive rollback.

### Additional hazards and controls

| Hazard | Consequence | Control |
| --- | --- | --- |
| Reference or Happy capture exposes private Session/account content | Sensitive evidence leaks into source or handoff | Keep screenshots/recordings under the private Shared Directory; repository docs contain only redacted observations, measurements, hashes, and private paths |
| Codex and Happy are compared at different geometry, theme, or state | False parity or false defect | Record exact window bounds/theme/state immediately before each capture and compare only matched pairs |
| UI automation acts on stale geometry or the wrong app | Unintended user or external action | Reobserve after every action, identify the exact process/window, and avoid coordinate reuse after navigation or resize |
| Daily-loop validation modifies an existing user Session or attention state | User data/read state changes | Prefer an isolated local validation context; do not open/click real pending attention or permission items solely to manufacture evidence |
| Agent execution writes outside the validation context or requests authority | Unbounded local/external mutation | Use a bounded benign prompt and isolated working directory where practical; inspect the selected Machine/project/mode before send; stop on permission, authentication, external-service, or destructive requests |
| Accessibility verification triggers controls | State changes while inspecting semantics | Use read-only Windows UI Automation inspection first; keyboard activation is limited to reversible navigation/dismissal unless the daily-loop step explicitly requires an already authorized action |
| A new source edit makes installed evidence stale | Candidate no longer represents reviewed code | Any product edit invalidates the installed acceptance receipt and requires focused/full checks plus a fresh exact-worktree build/hash/install receipt |
| Recovery proof is mistaken for rollback execution authority | Current install is destructively replaced | Verify backups, registry snapshots, hashes, and written commands only; do not execute rollback without separate authorization |

### Residual limits

- Windows-native evidence closes only the Windows Goal. It is not evidence of
  macOS title-bar, accessibility, keyboard, signing, packaging, or runtime
  behavior.
- The candidate remains an unsigned local development build; public trust and
  distribution readiness are not claimed.
- The two unchanged native-Windows Server POSIX fixture mismatches remain an
  explicit out-of-scope workflow gap unless the user separately authorizes the
  protected Server-test boundary.
