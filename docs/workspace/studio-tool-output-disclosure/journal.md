# Journal: `studio-tool-output-disclosure`

## `2026-08-23`

- Started workflow.
- Diagnosed the current content pollution as a local Studio disclosure problem,
  not an official-baseline data bug.
- Reviewed VS Code Agent, Codex CLI, GitHub Actions, Claude Code, and WAI-ARIA
  disclosure practices.
- User requested a formal interaction specification after accepting the
  research direction.
- Added `docs/specs/studio-tool-output-disclosure.md` and made its disclosure
  rules explicitly supersede the conflicting initial-expansion clauses in the
  two earlier Studio transcript specifications.
- Generated dependency-aware implementation tasks G0 and T1-T6 with explicit
  file boundaries, deterministic validations, parallel ownership, and complete
  AC1-AC13 coverage. No external tracker item was created.
- Completed G0 scoping as ready: Feature intensity, local-only main-session
  ownership, feature branch from `dev`, presentation-only risk not required,
  existing detail-route reuse with a scoped CodexBash gap, feature-local visual
  line seam, and pure-plus-packaged ChatList anchoring verification.

- 2026-08-23: Formal specification complete and validated; next route is generate-tasks, then scoping before implementation.

- 2026-08-23: T1 complete: pure disclosure summary/state/visual-line preview/copy contract and named edge fixtures; focused suite 17 passed; happy-app typecheck passed; no renderer wiring

## `2026-08-24`

- Completed T2 individual Studio tool disclosure: successful completion now
  mounts summary-only, running/failure previews stay within 5 and 2+8 wrapped
  visual-line budgets, manual expansion is internally scrollable and capped at
  40% viewport/480px, and mounted manual state survives stream/state updates.
- Preserved bounded Studio compact on/off behavior, Default fallback, structured
  Codex patches, safe ANSI rendering in expanded content, selection, permission
  host wiring, and existing navigation/callback paths.
- Focused validation passed 42 tests across 3 files; Happy App typecheck and
  `git diff --check` passed. T3-T6 remain pending; no commit or push performed.
- Completed T3 copy/detail/accessibility behavior: independent complete command
  and output copy actions, existing message-detail navigation from every
  disclosure state, complete Studio Bash/CodexBash detail rendering, concise
  button semantics, quiet previews, hidden measurement exclusion, and mounted
  control identity across automatic updates.
- Diagnosed and isolated Expo-only test collection dependencies before counting
  the valid ToolFullView behavior RED. Installed RN Web Pressable source confirms
  Enter/Space activation for button-role controls; packaged keyboard evidence is
  deliberately retained for T6.
- Focused validation passed 50 tests across 5 files; Happy App typecheck and
  diff integrity passed. T4-T6 remain pending; no commit or push performed.
- Completed T4 activity-group disclosure: Studio terminal children now reuse
  individual disclosure views, group summaries append available duration and
  nonzero failure count, and mixed completed/running/failed/pending groups keep
  the accepted child defaults without eager transcript bodies.
- Group collapse now keeps Studio terminal disclosure children mounted while
  hiding them visually and from the accessibility tree, preserving manual child
  state. Existing ChatList and nested-group policies already provide completed
  default collapse and pending-permission auto-open behavior.
- Focused validation passed 26 tests across 4 files; Happy App typecheck and
  diff integrity passed. T5-T6 remain pending; no commit or push performed.
- Completed T5 conversation scroll and render bounds. Expanded output follows
  streaming content only while its internal viewport is at the end; moving up
  disables follow without forcing a later jump.
- Mounted ChatList evidence retains native inverted-list anchoring and proves
  group expansion, streaming replacement, and resize do not introduce a JS
  scroll fight. Large streaming updates remain at 95px preview height, and
  viewport resize preserves manual disclosure state while recomputing the 40%
  bound.
- Focused validation passed 64 tests across 6 files; Happy App typecheck and
  diff integrity passed. T6 integration/review/packaged acceptance remains; no
  commit or push performed.
- T6 whole-diff review found and corrected one in-scope policy omission:
  active groups now auto-open only in Studio, explicit manual choices remain
  authoritative, untouched completed groups auto-collapse, and completed outer
  AgentWork groups do not reopen stale running children. Final focused suite is
  64/64 and App typecheck passes; no blocking/high/medium review finding remains.
- Complete App verification passed 1400/1401 tests with one clean unchanged
  CRLF-sensitive source assertion; complete server verification passed 101/102
  tests with one unchanged local attachment-route failure. Direct workflow CI
  and strict active audit pass; earlier timeout codes came from the aggregate
  parent command rather than child failures.
- Built fresh production and dev-identity Windows Tauri Studio packages. The
  packages are unsigned and Tauri reported an updater bundle-type patch warning;
  neither package was installed or distributed.
- Launched the exact workspace dev executable and inspected the current session.
  Collapsed failure-group metadata, bounded child previews, complete transcript
  navigation, Escape close behavior, half-screen layout, and dark rendering all
  behaved as specified. Restored the original Adaptive theme and closed only the
  workspace validation process. Human acceptance and unrelated-gap acceptance
  remain before check/finish; no commit or push performed.
- User explicitly accepted the packaged interaction and both named unrelated
  baseline-suite gaps. T6 is complete and the workflow may finish/archive with
  `commit=pending`; no commit, push, installation, or distribution authorized.
