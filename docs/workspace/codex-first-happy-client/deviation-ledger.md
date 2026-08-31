# Codex-first Deviation Ledger

Every entry is a functional exception to direct Codex parity. Visual preference
alone is not sufficient reason for a deviation.

| ID | Happy capability at risk | Codex baseline | Minimal Happy adaptation | Verification |
| --- | --- | --- | --- | --- |
| DV-001 | Multiple Machines and remote hosts | A Codex project/thread is centered on local developer context; the captured sidebar does not expose Happy's remote Machine dimension | Keep one project-first hierarchy. Show Machine identity only when disambiguation or connectivity requires it; move full Machine detail to the product menu, contextual metadata, and Settings/Agents | Unit tests for grouping/disambiguation; offline/online runtime fixtures; route reachability |
| DV-002 | Multiple Agent backends and provider-specific controls | Codex controls assume the Codex product | Use the same shell and component grammar for every backend, but render truthful Agent/model/effort/permission choices and hide unsupported controls | Resolver matrices across providers; spawn-request assertions; representative packaged sessions |
| DV-003 | Cross-device remote control, realtime status, and attention | Codex continuation is documented, but exact sidebar indicators are not captured | Preserve Happy unread, running, permission, failure, reconnect, and notification semantics using restrained row indicators and a notification surface | Existing lifecycle/recovery tests plus shell notification tests and runtime smoke |
| DV-004 | Project Todos | Codex exposes Scheduled as a primary global destination; Happy Todos are a different feature | Keep `Tasks`/`Todo` as a primary Happy destination using the same navigation-row grammar; do not relabel it as Scheduled | Route/callback tests and pending-count state tests |
| DV-005 | GitHub Issues workflow | Codex exposes Pull requests and change review; Happy's implemented integration is Issues, not a complete PR client | Expose truthful `Issues` globally and contextually. Use the same side-panel/action grammar as changes review without claiming Pull request operations Happy does not support | Feature-flag, repository-context, selection, start-work, and panel tests |
| DV-006 | Artifacts | Codex exposes Sites and finished deliverables, but Happy Artifacts have their own data and routes | Expose `Artifacts` through the global destination family and Command Palette using Codex row/page grammar; retain current create/edit/view behavior | Route reachability and CRUD behavior tests; desktop page snapshot |
| DV-007 | Session side chat, files, diff overlays, and multi-panel workspace | One captured Codex main window does not prove Happy's multi-panel combinations | Keep Happy panels and resizable widths behind a single quiet trailing toolbar and shared side-panel shell; guarantee the main composer remains usable | Panel projection/resize tests, overlay back/forward tests, narrow/standard/wide fixtures |
| DV-008 | Rich Session metadata: branch, worktree, repository, runtime and Machine | Captured Codex rows are compact and mostly title-led | Preserve the metadata but demote it to secondary text, show only disambiguating fields in resting rows, and provide full detail through title/session popovers | Projection tests for collisions and status; no loss of source metadata |
| DV-009 | Archive, pin, favorites, attention groups, and flat-list preference | The captured Codex sidebar proves project groups but not Happy's complete organization controls | Project-first becomes desktop default; retain archive, pin, favorite, attention, and flat view in search/filter/menus without making them the resting hierarchy | Preference migration/default tests and list-order assertions |
| DV-010 | Existing mobile and standalone Web product | The current owning delivery is a Windows packaged customized Codex desktop client; macOS follows later | Keep packaged Linux, iOS, Android and standalone Web behavior on their current presentation path. Shared logic may be reused only where it does not change those surfaces | Tauri/host gating tests, non-Tauri regression tests, typecheck |
| DV-011 | Accessible focus, contrast, platform input and reduced motion | Dark, focus and motion reference evidence is blocked | Preserve Happy's tested focus visibility, keyboard order, contrast and reduced-motion conventions; treat these as platform adaptations, not inferred Codex parity | Focus/keyboard tests, contrast review, reduced-motion assertions, packaged smoke |
| DV-012 | Security, encryption, authentication, synchronization and protocol compatibility | Client-side visual parity does not justify backend changes | Leave these contracts authoritative and unchanged unless a separately risk-gated requirement is accepted | Whole-diff protected-path review, protocol tests, workflow risk gate |

## Open entries

Add an entry before implementation whenever direct parity would make a Happy
capability less reachable, less truthful, or less operable. Close an entry only
when its verification evidence is recorded in `validation.md`.

## Verification closure — 2026-08-31

The entries remain durable explanations of accepted product adaptations, not
open implementation defects. Their current Windows evidence is mapped below;
the detailed commands, hashes, package limits, and recovery inputs live in
`validation.md` and the active Windows acceptance session.

| Deviation | Passing evidence | Remaining claim boundary |
| --- | --- | --- |
| DV-001 | Project/Machine grouping, collision, offline-search, Session-row projection, and responsive suites pass; packaged UIA exposes truthful Machine/worktree labels and `设备与 Agent` | Machine identity is shown only where useful; no Machine RPC changed |
| DV-002 | Agent/model/mode/effort/permission resolver and spawn-request suites pass inside the 220-file / 1761-test App result | Runtime inspection does not start an Agent or change a permission |
| DV-003 | Attention targeting, lifecycle, reconnect, visible-session, notification, and Home connection tests pass; packaged rows expose connected/running status | No read-state-changing notification action was manufactured |
| DV-004 | Todo destination, pending-count, route, command-palette, and localization wiring pass; packaged shell exposes `Todo` with count | Happy Todos are not relabeled as Codex Scheduled |
| DV-005 | GitHub repository/Issues screen, selection, dispatch, and platform suites pass; packaged shell exposes `GitHub Issues` | No unsupported pull-request claim is made |
| DV-006 | Artifact destination/search wiring and existing route behavior remain in the full regression; packaged shell exposes `工件` | No new artifact protocol or storage path was introduced |
| DV-007 | Panel projection, width, resize, quick-control, overlay placement, and narrow/standard/wide suites pass; native Windows package smoke covered 719/1099/1199/1469/1682 widths; final UIA proves truthful generic workspace collapse naming | Final copy-only delta does not alter panel/layout code; private macOS captures are not relabeled as Windows evidence |
| DV-008 | Collision-aware recent-project, Session subtitle, worktree, branch, runtime, and Machine projection tests pass; packaged UIA exposes compact secondary metadata | Full metadata remains available without making resting rows noisy |
| DV-009 | Visible-session ordering, archive/attention, project grouping, shortcut, and reversible preference tests pass | No settings migration or forced preference rewrite occurred |
| DV-010 | Windows/macOS packaged eligibility, packaged-Linux legacy, standalone legacy, legacy Composer/header/quick-control, and mobile-width regressions pass; App typecheck is green | macOS native adaptation is later work; Windows evidence is not Mac evidence |
| DV-011 | Keyboard, focus, overlay, reduced-motion, accessibility-copy, contrast-token, and exact-launcher focus-return regressions pass; final packaged Windows UIA proves localized names/roles/states plus click → Escape → Enter focus restoration | Automated current-Codex UI interaction is prohibited by its `ChatGPT.exe` manifest; exact pixel parity remains a named limitation |
| DV-012 | Protected auth/encryption/sync operation/Server/CLI diff count is zero, staged count is zero, workflow risk gate remains cleared only for client presentation | No protected payload, protocol, RPC, migration, or Server claim is made |
