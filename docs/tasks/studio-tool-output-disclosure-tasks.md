# Studio Tool Output Disclosure Tasks

## Objective

Implement `docs/specs/studio-tool-output-disclosure.md` as a packaged-Tauri
Studio presentation correction while preserving all existing structured output,
protocol, sync, permission, execution, Default, Web, mobile, and structured diff
contracts.

## Dependency graph

```text
G0 Scope and risk gate
└─ T1 Shared disclosure model and fixtures
   └─ T2 Individual Studio tool disclosure
      ├─ T3 Full transcript, copy, and accessibility
      └─ T4 Activity-group disclosure
         └─ T5 Conversation scroll and render bounds
            └─ T6 Integration, review, and visual acceptance
```

T3 and T4 may proceed independently after T2 if their file ownership remains
disjoint. T6 depends on every implementation task, including T3.

## Global boundaries

- Product behavior changes are limited to packaged Tauri Studio presentation.
- Do not change `packages/happy-wire/**`, Codex/Claude/Gemini producer mappers,
  App session schemas, reducers, stored history, or synchronized settings.
- Do not change permission resolution, command execution, ordinary user or
  assistant messages, or structured file-diff disclosure.
- Reuse the existing bounded result and sanitized transcript data. Display
  folding cannot mutate copied, synchronized, model-visible, or detail-view
  content.
- If a protocol, sync, persistence, or provider change appears necessary, stop
  the active task and return to scoping/risk review instead of expanding scope.
- New files should stay inside a feature-local
  `sources/features/studio-tool-output-disclosure/` module where practical;
  shared host files should contain only narrow wiring seams.

## G0 — Scope and risk gate

**Status:** complete (`2026-08-23`).

**Depends on:** none.

**Outcome:** establish the smallest accepted implementation boundary before any
product edit.

**Scope:**

- Confirm the existing message-detail route can expose the complete stored tool
  result without a second data model.
- Confirm visual-line measurement, viewport geometry, and ChatList anchoring
  seams from real current code and tests.
- Populate role-scoped implementation/check manifests with only the files owned
  by T1–T6.
- Record presentation-only risk as not required, or invoke the formal risk gate
  if the scoped work crosses a configured trigger.

**Allowed files:**

- `docs/workspace/studio-tool-output-disclosure/**`
- `docs/tasks/studio-tool-output-disclosure-tasks.md`

Product files are read-only in G0.

**Acceptance:**

- Scoping evidence names the exact implementation and test seams.
- No protocol, sync, persistence, protected-path, or structured-diff write is
  included.
- The workflow passes strict active-workflow audit before T1 starts.

**Closest validation:**

```text
python scripts/workflow-state.py validate studio-tool-output-disclosure
python scripts/workflow-audit.py --strict --require-active
```

## T1 — Shared disclosure model and fixtures

**Status:** complete (`2026-08-23`).

**Depends on:** G0.

**Outcome:** provide one deterministic, UI-independent contract for summary
metadata, semantic default state, manual-state transitions, preview selection,
and complete sanitized copy text.

**Scope:**

- Derive summary data only from existing structured `ToolCall` fields.
- Model collapsed, automatic preview, manual expanded, and mounted-view manual
  override behavior without adding synchronized state.
- Select running tail and failure head/tail content according to the accepted
  budgets while preserving complete sanitized text separately.
- Cover empty, success, running, failure, cancellation, interruption, pending
  permission, ANSI/control, CR progress, truncated, heredoc, long unbroken,
  narrow-width, CJK, emoji, combining, bidi, and tab fixtures.

**Allowed files:**

- `packages/happy-app/sources/features/studio-tool-output-disclosure/**`
- `packages/happy-app/sources/features/studio-execution-transcript/studioExecutionTranscript.ts`
- `packages/happy-app/sources/features/studio-execution-transcript/studioExecutionTranscript.test.ts`
- Co-located new focused tests and fixtures for this feature

`typesMessage.ts` and protocol-related files are read-only contracts.

**Acceptance:**

- Successful completion resolves collapsed; running resolves a tail preview;
  structural failure resolves a head/tail preview.
- Manual expansion/collapse wins over later output and terminal-state updates
  for the mounted view.
- Preview content and presentation omission markers are distinct from complete
  sanitized copy content.
- Failure is never inferred from output prose.
- One very long logical line cannot bypass the input supplied to the visual-line
  budgeting seam.

**Closest validation:**

```text
pnpm --filter happy-app exec vitest run sources/features/studio-tool-output-disclosure sources/features/studio-execution-transcript/studioExecutionTranscript.test.ts --testTimeout=15000
pnpm --filter happy-app typecheck
```

**Acceptance coverage:** AC2, AC3, AC4, AC6 foundations.

## T2 — Individual Studio tool disclosure

**Depends on:** T1.

**Status:** Complete (2026-08-24). Focused validation: 3 files, 42 tests;
Happy App typecheck passed. Whole-feature implementation remains pending T3-T6.

**Outcome:** replace eager full-body Studio terminal rendering in the main
timeline with the accepted summary, preview, and bounded inline-expanded states.

**Scope:**

- Wire the shared disclosure contract into real terminal `ToolView` rendering.
- Render a one-visual-line summary with available state, duration, exit code,
  logical line count, and upstream truncation indication.
- Enforce the running 5-line and failure 2+8 visual-line budgets after wrapping.
- Bound manual inline expansion to the smaller of 40% conversation viewport or
  480 logical pixels and keep additional content internally scrollable.
- Honor `compactToolCalls` in Studio without making compact-off an unbounded
  timeline mode.
- Preserve safe ANSI, selection, permissions, callbacks, navigation, and every
  non-Studio renderer path.

**Allowed files:**

- `packages/happy-app/sources/features/studio-tool-output-disclosure/**`
- `packages/happy-app/sources/features/studio-execution-transcript/StudioExecutionTranscriptView.tsx`
- `packages/happy-app/sources/components/tools/ToolView.tsx`
- `packages/happy-app/sources/components/tools/ToolViewStudioPresentation.test.ts`
- `packages/happy-app/sources/features/studio-tool-presentation/**` only for
  accepted Studio disclosure geometry/tokens
- `packages/happy-app/sources/text/**` only for required user-visible labels

**Acceptance:**

- A completed successful tool with maximum-size output mounts no output body in
  the collapsed render or accessibility tree.
- Running and failed previews remain within their visual budgets at standard,
  narrow, and zoomed widths, including a single extremely long line.
- Manual expansion has bounded height and internal scrolling; empty output does
  not create an empty panel.
- Compact on/off and Studio/Default matrices preserve their specified paths.
- Existing structured Codex patch behavior remains unchanged.

**Closest validation:**

```text
pnpm --filter happy-app exec vitest run sources/components/tools/ToolViewStudioPresentation.test.ts sources/features/studio-tool-output-disclosure sources/features/studio-execution-transcript --testTimeout=15000
pnpm --filter happy-app typecheck
```

**Acceptance coverage:** AC1, AC2, AC3, AC4, AC5, AC11.

## T3 — Full transcript, copy, and accessibility

**Depends on:** T2.

**Status:** Complete (2026-08-24). Focused validation: 5 files, 50 tests;
Happy App typecheck passed. Real packaged keyboard/visual acceptance remains T6.

**Outcome:** make all disclosure levels operable without sacrificing complete
inspection, copying, keyboard access, or assistive-technology semantics.

**Scope:**

- Expose complete sanitized command and complete stored sanitized output copy
  actions independent of the visible preview.
- Make the existing message-detail route, or the verified equivalent from G0,
  the complete transcript destination from collapsed, preview, and expanded
  states.
- Expose concise button labels, expanded state, keyboard toggle behavior, and a
  reading order that excludes collapsed content.
- Prevent streaming chunks from becoming repetitive live announcements while
  keeping final state and failure discoverable.
- Preserve focus across automatic state transitions and copy/navigation actions.

**Allowed files:**

- `packages/happy-app/sources/features/studio-tool-output-disclosure/**`
- `packages/happy-app/sources/components/tools/ToolView.tsx`
- `packages/happy-app/sources/components/tools/ToolFullView.tsx`
- `packages/happy-app/sources/app/(app)/session/[id]/message/[messageId].tsx`
- Relevant co-located ToolView/full-view/accessibility tests
- `packages/happy-app/sources/text/**` only for required labels and feedback

**Acceptance:**

- Copy actions return complete sanitized content without ANSI controls,
  preview ellipses, or omission labels.
- The full transcript is reachable in every disclosure state and displays the
  complete stored result within the existing storage bound.
- Enter and Space toggle disclosure; role, label, and expanded state are
  correct; collapsed content is absent from the accessibility tree.
- Automatic updates preserve control focus and do not announce every chunk.

**Closest validation:**

```text
pnpm --filter happy-app exec vitest run sources/features/studio-tool-output-disclosure sources/components/tools/ToolViewStudioPresentation.test.ts --testTimeout=15000
pnpm --filter happy-app typecheck
```

**Acceptance coverage:** AC6, AC7, AC10.

## T4 — Activity-group disclosure

**Depends on:** T2. May run in parallel with T3 after ownership is recorded.

**Status:** Complete (2026-08-24). Focused validation: 4 files, 26 tests;
Happy App typecheck passed. Conversation anchoring and packaged acceptance remain T5-T6.

**Outcome:** make completed, running, failed, mixed, and permission-bearing
activity groups disclose child summaries without eagerly revealing every child
output.

**Scope:**

- Summarize tool count, duration when available, and non-zero failure count.
- Default successful completed groups to collapsed.
- Expose active summaries and only active bounded previews while running.
- Expose failed summaries and only failed bounded previews in mixed completed
  groups; keep successful siblings collapsed.
- Preserve pending-permission visibility and keep group/manual child disclosure
  state independent for the mounted view.

**Allowed files:**

- `packages/happy-app/sources/components/ToolGroupView.tsx`
- `packages/happy-app/sources/components/ToolGroupViewStudioPresentation.test.ts`
- `packages/happy-app/sources/components/ChatList.tsx` only for group initial
  state and group-level disclosure wiring
- `packages/happy-app/sources/hooks/useGroupedMessages.ts`
- `packages/happy-app/sources/hooks/useGroupedMessages.test.ts`
- `packages/happy-app/sources/features/studio-tool-output-disclosure/**`
- `packages/happy-app/sources/text/**` only for group summary labels

**Acceptance:**

- Opening a group initially reveals child summaries, not every transcript body.
- Running and failed groups expose only the specified child previews.
- Pending permission remains visible and actionable.
- Collapsing a group does not erase child manual state while mounted.
- Default and structured diff group behavior remains unchanged outside the
  accepted Studio terminal-output boundary.

**Closest validation:**

```text
pnpm --filter happy-app exec vitest run sources/components/ToolGroupViewStudioPresentation.test.ts sources/hooks/useGroupedMessages.test.ts sources/features/studio-tool-output-disclosure --testTimeout=15000
pnpm --filter happy-app typecheck
```

**Acceptance coverage:** AC8.

## T5 — Conversation scroll and render bounds

**Depends on:** T2 and T4.

**Status:** Complete (2026-08-24). Focused validation: 6 files, 64 tests;
Happy App typecheck passed. T6 review also proved Studio-only active-group
auto-expansion, completed-group auto-collapse, and manual-intent preservation.

**Outcome:** prove that streaming, disclosure, grouping, and resize preserve the
conversation reading position and never restore an unbounded main-timeline item.

**Scope:**

- Integrate bounded transcript height with the existing inverted ChatList
  bottom-stick and visible-content anchoring behavior.
- Preserve a reader's upward scroll position during output updates.
- Follow output only when the user is at the applicable bottom.
- Recompute wrapped preview budgets on viewport/zoom changes without losing
  manual disclosure state.
- Ensure collapsed content is not eagerly laid out and streaming updates do not
  reset unrelated items.

**Allowed files:**

- `packages/happy-app/sources/components/ChatList.tsx`
- `packages/happy-app/sources/components/ToolGroupView.tsx`
- `packages/happy-app/sources/features/studio-tool-output-disclosure/**`
- `packages/happy-app/sources/features/studio-execution-transcript/StudioExecutionTranscriptView.tsx`
- New focused ChatList/disclosure scroll and resize tests

**Acceptance:**

- Preview height stops growing at its accepted budget during streaming.
- Users reading older messages are not pulled to the latest output.
- Users already at the bottom retain expected bottom-follow behavior.
- Expand/collapse keeps the disclosure control visible and does not jump to the
  conversation end.
- Resize, zoom, and maximum-size output stay bounded without losing manual state
  or remounting unrelated disclosure items.

**Closest validation:**

```text
pnpm --filter happy-app exec vitest run sources/features/studio-tool-output-disclosure sources/components/ToolGroupViewStudioPresentation.test.ts --testTimeout=15000
pnpm --filter happy-app typecheck
```

**Acceptance coverage:** AC2, AC5, AC9 and performance constraints.

## T6 — Integration, review, and visual acceptance

**Depends on:** T1–T5.

**Status:** Complete (2026-08-24). Automated integration, whole-diff review,
Windows package build, packaged runtime inspection, and explicit human visual
acceptance passed. The user explicitly accepted the two named unrelated
baseline-suite gaps.

**Outcome:** demonstrate the entire contract in automated and packaged Studio
behavior without accepting blank, inaccessible, or wrong-visual-mode evidence.

**Scope:**

- Run every focused suite plus complete applicable Happy App verification.
- Review the complete diff against the specification and global boundaries.
- Build a fresh explicit-Studio packaged Tauri client.
- Capture and directly inspect success, running, failure, long-line, group,
  compact on/off, narrow/standard window, keyboard, light, and dark states.
- Record missing or invalid evidence as gaps and obtain explicit human visual
  acceptance before finish.

**Allowed files:**

- Product/test files already owned by T1–T5
- `docs/workspace/studio-tool-output-disclosure/**`
- No new product scope during integration; findings return to the owning task

**Acceptance:**

- Focused tests, App typecheck, applicable complete App suite, workflow checks,
  strict audit, and `git diff --check` pass or have explicitly accepted unrelated
  gaps.
- Whole-diff review finds no unresolved blocking/high/medium issue and confirms
  protocol, sync, permissions, structured diffs, Default, Web, iOS, and Android
  remain unchanged.
- Packaged evidence exercises the actual Studio transcript body in all required
  states; a shell-only or blank capture is not transcript acceptance evidence.
- User explicitly accepts the packaged interaction before finish/archive.

**Closest validation:**

```text
pnpm --filter happy-app typecheck
pnpm --filter happy-app exec vitest run --testTimeout=15000
python scripts/workflow-check.py --record studio-tool-output-disclosure
python scripts/workflow-audit.py --strict --require-active
git diff --check
```

**Acceptance coverage:** AC11, AC12, AC13 and whole-feature regression coverage.

## Acceptance coverage matrix

| Criterion | Owning task(s) |
| --- | --- |
| AC1 | T2 |
| AC2 | T1, T2, T5 |
| AC3 | T1, T2 |
| AC4 | T1, T2 |
| AC5 | T2, T5 |
| AC6 | T1, T3 |
| AC7 | T3 |
| AC8 | T4 |
| AC9 | T5 |
| AC10 | T3 |
| AC11 | T2, T6 |
| AC12 | T6 |
| AC13 | T6 |

Every acceptance criterion has an owning task. No task authorizes a tracker
issue, commit, push, merge, release, or installation by itself.

## Open implementation questions

These are scoping checkpoints, not permission to weaken the contract:

1. Confirm whether the existing `ToolFullView` already presents the complete
   terminal result adequately. If not, T3 may refine that existing detail path
   but cannot create a second transcript data model without re-scoping.
2. Confirm the narrowest reliable visual-line measurement seam under React
   Native Web/Tauri. Character count and newline count alone are not acceptable
   substitutes.
3. Confirm whether current ChatList test harnesses can deterministically observe
   visible-content anchoring. If not, record the automated limitation and add a
   bounded packaged interaction check; do not claim scroll preservation from a
   render-only test.

No question currently blocks task generation. G0 must resolve each question
before the affected implementation task starts.
