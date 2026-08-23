# Context: `studio-tool-output-disclosure`

## Goal

Keep complete structured Studio execution evidence while preventing commands,
processing text, and terminal output from overwhelming the main conversation
timeline.

## Existing contracts

- `docs/specs/studio-execution-transcript.md`
- `docs/specs/studio-activity-transcript.md`
- `docs/specs/studio-tool-presentation.md`
- `docs/specs/studio-tool-output-disclosure.md`

The new disclosure specification has precedence only for initial disclosure and
inline display bounds. Existing protocol, sanitization, status, permission,
copy, and diff contracts remain authoritative.

## Research basis

- VS Code Agent: tool details collapsed by default, inline output separated
  from the full terminal.
- Codex CLI: folded command/output with omitted-line indication and a transcript
  route for detail.
- GitHub Actions: failed steps automatically expanded.
- Claude Code: complete turn-by-turn output is verbose-mode behavior.
- WAI-ARIA: explicit disclosure control, state, keyboard, and accessible label.

## Boundary

Packaged Tauri Studio presentation only. No protocol, persistence, sync,
provider, command execution, permission, mobile, standalone Web, Default visual
style, ordinary prose, or structured diff behavior changes.

Role-scoped implementation and verification manifests remain intentionally
bounded to the files named below and in the JSONL manifests.

## G0 scoping result

Result: **ready** for the serial T1 disclosure-model slice.

- Intensity remains Feature: this is a non-trivial, cross-component Studio
  presentation correction with targeted and complete applicable App tests.
- The active accepted spec, decisions D1-D9, and dependency-aware task list
  cover AC1-AC13 with no open product decision.
- The current work is local-only with one owner and immediate pickup. It does
  not need a tracker, delegated writer, batch plan, or separate worktree.
- Implementation runs on `feature/studio-tool-output-disclosure`, branched from
  `dev`; no commit, push, merge, installation, or release is authorized by G0.
- T1-T5 should use the repository-local `tdd` skill. T6 owns complete check,
  whole-diff review, packaged evidence, and explicit human acceptance.

## Verified implementation seams

### Full transcript

The existing message-detail route already hosts `ToolFullView`, so T3 can reuse
that navigation and data model. Generic and Bash detail paths preserve stored
results, but the current `CodexBash` full-view registry resolves to
`CodexBashView`, whose successful path omits enriched output. T3 may refine this
existing detail path; a second transcript data model remains out of scope.

### Visual-line budget

There is no repository-local text-layout abstraction today. Installed React
Native types expose `onTextLayout`, while the installed React Native Web Text
implementation used by Tauri enforces `numberOfLines` with CSS
`WebkitLineClamp`. T1 owns a pure disclosure contract and T2 owns a
feature-local rendered-line/clamp seam. Newline or character count alone is not
an acceptable visual budget.

### Conversation anchoring

`ChatList` already uses an inverted FlatList with
`maintainVisibleContentPosition`, a 50-unit bottom threshold, drag ownership,
and explicit content/viewport metrics. No current mounted ChatList test covers
those behaviors. T5 must combine pure policy tests and mounted wiring checks;
actual scroll feel and anchoring remain mandatory packaged interaction evidence
under AC9/AC13 rather than an automated claim from react-test-renderer alone.

## Risk assessment

No configured material trigger applies to the scoped writes: authentication,
authorization, GitHub permissions, migration, privacy, security, production
deployment, destructive operations, session protocol, and cross-device sync
are excluded. Protected and generated paths are excluded. Risk is therefore
`not_required`; discovering a need for any excluded layer stops implementation
and reopens scoping/risk review.
