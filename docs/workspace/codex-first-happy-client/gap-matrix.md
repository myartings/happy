# Codex-first Daily-loop Gap Matrix

## Reading rules

- `Observed` means visible in the usable Codex runtime baseline or Happy runtime
  baseline.
- `Documented` means supported by current official OpenAI material but not by a
  local interaction trace.
- `Existing` means Happy already has an implementation and deterministic tests;
  it does not by itself claim visual parity.
- `Blocked` means current host policy or capture behavior prevents stronger
  reference evidence. Blocked details are not guessed.

## Matrix

| Daily-loop surface | Codex baseline | Happy today | Existing reusable implementation | Required Codex-first change | Evidence state |
| --- | --- | --- | --- | --- | --- |
| Product identity and window shell | Native macOS chrome; compact `Codex` product header inside a persistent ~275 pt sidebar | Native chrome and resizable sidebar exist, but no visible product identity; the persistent top overlay contains only zen/back/forward | `SidebarNavigator`, `SidebarView`, Studio frame and resize policy | Introduce one global `Happy Codex` shell header with product menu semantics; integrate navigation history and sidebar collapse without duplicating title-bar controls | Codex shell observed; Happy shell observed |
| Global search and notifications | Search and notification icons are visible beside the product header | Command Palette exists behind a keyboard shortcut; desktop notification routing exists, but neither is a primary sidebar affordance | `CommandPaletteProvider`, notification listener, session unread/runtime state | Make search and notification/inbox entry points visible in the shell; search must cover commands, Sessions, projects, and Happy destinations while reusing current shortcuts | Presence observed; exact Codex popover behavior blocked |
| Primary global destinations | Codex exposes a compact family above Projects: New chat, Pull requests, Sites, Scheduled, Plugins | New Session, Todo, archive, and Settings are visible; Issues, Artifacts, Machines/Agents, Terminal, and other capabilities are scattered across routes, session panels, Settings, or Command Palette | Existing routes and callbacks for New Session, Project Todos, GitHub Issues, Artifacts, Agents/Machines, Terminal, Settings | Create a compact Happy destination family using Codex row grammar. Use truthful Happy labels and feature flags. Keep low-frequency account/admin in Settings | Codex family observed; Happy reachability statically verified |
| Project → thread hierarchy | Projects are first-class sidebar groups with indented compact threads and a bounded selected row | Happy supports machine/project/workspace grouping and a flat chronological mode; captured runtime is a metadata-heavy activity list | `SessionsList`, `ProjectGroup`, `ActiveSessionsGroupCompact`, pin/favorite/archive/search utilities | Make project-first hierarchy the desktop default; retain flat view as an explicit alternative. Keep machine/provider/branch status but demote it into compact secondary metadata and contextual detail | Codex hierarchy observed; Happy alternatives existing |
| Session attention, activity, unread, archive | Threads support ongoing parallel work; official material documents long-running/parallel agents and continuation | Happy has running/idle/permission/error/unread/archived states, attention grouping, pinning, favorites, notifications, and reconnect recovery | Session row projections, runtime-status features, notification routing | Map every truthful Happy lifecycle state to restrained Codex-like indicators; preserve attention and archive semantics without turning ordinary rows into dashboards | Codex capability documented; exact indicator timing blocked |
| Empty/home state | New chat is a primary action; exact empty-state composition is not captured | Empty main states are setup-oriented and current captured main canvas is blank | `EmptyMainScreen`, `EmptySessionsTablet`, New Session route | Provide a Codex-like useful empty canvas with project/new-session actions and machine connectivity guidance; never show an unexplained blank canvas | Codex exact visuals blocked; Happy behavior existing |
| Start new work | Codex works from projects/local folders and supports worktrees; exact New chat transition is not captured | Happy has a feature-rich New Session surface: Machine, project/path discovery, Agent, model, effort, permissions, worktree, attachments, prompt, and optional right configuration rail | `new/index.tsx`, draft/start hooks, workspace discovery, `newSessionSidebarLayout` | Preserve the complete spawn contract but present prompt-first centered composition, compact project context, and a Codex-like contextual configuration rail. Defaults remain visible and truthful | Codex capability documented; Happy implementation existing |
| Conversation header | Compact ~46 pt header with project/folder context, truncated thread title, and quiet trailing view actions | Studio header is 54 pt with folder/title and existing actions | `ChatHeaderView`, `studio-conversation-layout` | Converge hierarchy and geometry toward reference; put Happy-only session state and panel actions in quiet trailing controls or title popover | Codex observed; Happy existing |
| Reading column and message rhythm | Centered ~740–750 pt column; assistant unboxed, user in compact right-aligned neutral bubble | Studio caps viewport at 832 pt with ~800 pt content; semantic text and user/assistant presentation already exist | conversation layout, semantic-text, Markdown, interaction states | Calibrate to a shared Codex-first desktop measure and rhythm at standard width while retaining wider tool/diff escape hatches and responsive bounds | Both implementations evidenced; matched runtime still required |
| Streaming and tool activity | Thread shows compact activity/status and structured results; official sources describe terminal output, tests, screenshots, and diffs | Happy preserves command output, ANSI, duration, failure, structured edits, grouped activity, and full transcript disclosure | Studio activity/execution/output-disclosure modules and tests | Reuse these modules as the global desktop presentation; remove the old optional-theme framing. Verify loading, running, success, failure, truncation, expand/copy states | Codex partial observed/documented; Happy existing |
| Permissions and approvals | Approvals are part of the desktop/mobile continuation loop | Happy supports provider-specific allow/deny/session/edit/bypass decisions and pending-permission status | `PermissionFooter`, composer permission controls, tool status projections | Restyle and order approvals using the closest Codex action grammar while preserving every provider-specific decision and disabled terminal state | Codex capability documented; exact layout blocked |
| Changes and review | In-thread changes summary, review action, undo, diff comments, editor handoff, and side-panel PR review are documented/visible | Happy has diff cards, file overlays, all-files diff, GitHub Issues workspace, open panels, and source actions | `CodexDiffView`, `CodexPatch`, file/diff overlay navigation, side panels | Establish one `Changes` action family and side-panel grammar; retain Issues and file tools as Happy extensions. Do not imply unsupported PR operations | Codex summary observed; broader workflow documented; Happy existing |
| Composer | Large floating rounded composer aligned with reading column; attachment/mode/model/voice/send controls form a compact lower row | Studio composer already implements floating shell, attachments, autocomplete, agent/model/effort/permission, sending and abort states | `AgentInput`, `studio-composer`, state tests | Make Studio composer the global desktop contract; normalize labels/order and state feedback against current reference while preserving backend-specific controls | Codex observed; Happy existing |
| Command and keyboard flow | Current release documents Goal mode and developer workflows; exact palette structure is not captured | Command Palette supports New Session, Sessions, Settings, Account, Connect Device, recent Sessions, sign out, and shortcuts | Command Palette, keyboard hooks, browser-navigation store, shortcut hints | Expand the palette to all daily-loop Happy destinations and project/session search; keep Cmd+K, Cmd+N, Cmd+, and recent-session shortcuts discoverable | Codex exact palette blocked; Happy existing |
| Contextual overlays and menus | Quiet floating actions are visible; exact hover, dismissal and placement are not recorded | Studio overlays, Session actions, picker surfaces, light/dark interaction states, click-away, placement and keyboard selection exist | `studio-overlays`, `studio-interaction-states`, modal infrastructure | Reuse shared desktop overlay grammar globally; verify focus return, Escape/outside dismissal, clamping and destructive semantics | Codex detailed behavior blocked; Happy existing |
| Right workspace panels | Official material documents PR review, diffs, browser and multi-repository context in side panels | Happy exposes files, issues, side chat and resizable right panels | SessionView panel model, panel resize, GitHub Issues workspace, SideChatPanel | Present panels through one Codex-like toolbar and side-panel shell; preserve multi-panel and Happy-specific selection state | Codex capability documented; Happy existing |
| Settings needed by daily use | Codex project/team rules, permissions, skills/plugins and preferences are documented | Happy Settings contains connections, account, appearance, voice, agents/machines, usage and developer flags | Settings routes/components | Restyle desktop Settings and expose daily-loop categories from product/account menus. Low-frequency billing/cloud admin stays out of scope | Codex capability documented; exact settings visuals blocked |
| Responsive desktop states | One standard 1470×870 Codex state is observed; a narrow centered column is a known product characteristic | Happy supports resizable left/right panels, zen mode, min window size and responsive New Session rail | panel resize policies/tests, responsive utilities | Define narrow/standard/wide shell projections; preserve minimum conversation/composer width and deterministic panel collapse. Do not claim pixel parity without matched captures | Codex resize behavior blocked; Happy existing |
| Light/dark, focus and reduced motion | Only light resting Codex state is locally captured | Happy has light/dark Studio presentations and focus/pressed/selected tests | interaction-state and overlay presentation tests, Unistyles | Preserve accessible focus/contrast and reduced-motion behavior; treat dark tokens and motion as Happy adaptations until Codex evidence becomes available | Codex dark/motion blocked; Happy existing |
| Backend neutrality | Codex is coding-specific | Happy supports Codex, Claude and other Agent backends with different truthful controls | Agent/model/effort/permission resolution and session metadata | Apply one shell across providers. Provider identity appears only where it changes controls or runtime truth; no fake Codex-only option is shown for another backend | User decision; Happy existing |

## Implementation priority

1. Global shell, product header, visible search/notifications, destination family,
   and project-first Session navigation.
2. Empty/home and New Session entry flow, including Happy Machine/Agent/project
   preservation.
3. Conversation header and side-panel action grammar.
4. Promote the already implemented Studio conversation, Composer, tools,
   approvals, diffs, overlays, and interaction states from optional visual
   styling to the global packaged-desktop contract.
5. Complete state, keyboard, responsive, and accessibility verification; build,
   install, and capture the owning Windows candidate. Native macOS adaptation
   and acceptance follow later and do not qualify the Windows result.

The order follows the largest product-perception gaps first. Existing Studio
modules remain reusable implementation evidence, but their former requirement
to preserve Happy's macro information architecture is superseded.

## Windows acceptance closure — 2026-08-31

The matrix is closed for the current packaged-Windows Goal. Deterministic
tests and bounded installed-client inspection cover identity/navigation,
Home, New Session, project/Session search, conversation/Composer/tools,
questions/permission lifecycle without answering a real request, Changes/All
Files/Issues/Side Chat, Settings, responsive tiers, light/dark/adaptive,
keyboard focus, Windows UI Automation names/roles/states, exact-path install,
and recovery inputs. Final installed app identity is `0E89BAA4…C20C`.

Two boundaries remain explicit rather than open product defects: current
Windows Codex runtime pixels cannot be automated because its signed Appx
manifests as prohibited `ChatGPT.exe`, and macOS native adaptation/acceptance is
later platform work. No blocked detail was guessed, and neither boundary is
used to weaken Happy functionality or relabel Windows evidence as macOS/Codex
runtime evidence.
