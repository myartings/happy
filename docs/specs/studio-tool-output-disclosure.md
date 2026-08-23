# Studio Tool Output Disclosure

## Status and precedence

Accepted interaction contract for packaged Tauri Desktop when Studio visual
style is active.

This specification supersedes only the initial-disclosure and inline-height
requirements in `studio-execution-transcript.md` and
`studio-activity-transcript.md`. Those specifications remain authoritative for
structured tool data, output bounds, ANSI safety, status derivation, copying,
permissions, protocol compatibility, and diff rendering.

In particular, "readable without fixed-height truncation" applies to the full
transcript surface, not to the main conversation timeline.

## Problem

Studio currently treats preservation of complete tool output as a requirement
to render that output eagerly in the conversation timeline. Long commands,
aggregated terminal output, and processing text can therefore occupy most of
the viewport, displace user and assistant messages, move the scroll position,
and make long sessions difficult to review.

The product needs to preserve diagnostic fidelity while separating the normal
conversation reading surface from detailed execution evidence.

## Evidence and interaction principles

- VS Code Agent collapses tool details by default and separates inline output
  from the full terminal.
- Codex CLI folds multiline command output and exposes omitted content through
  a transcript surface.
- GitHub Actions automatically expands failed steps rather than all logs.
- Claude Code makes complete turn-by-turn output an explicit verbose mode.
- WAI-ARIA disclosure guidance separates a concise control from the content it
  reveals and exposes the expanded state to assistive technology.

These references establish interaction direction, not private implementation
constants. Happy's real message and tool contracts remain authoritative.

## Scope

This feature governs potentially verbose structured execution content in the
packaged Studio conversation timeline:

- terminal and shell commands;
- stdout, stderr, errors, and provider result output;
- running, completed, failed, cancelled, and interrupted execution states;
- individual tool rows inside or outside an activity group;
- disclosure, copying, focus, scrolling, and accessibility behavior.

Existing structured file-diff disclosure is outside this feature boundary.
Ordinary user messages, assistant prose, final answers, permission semantics,
tool execution, protocol data, stored history, and output retention are also
unchanged.

## Information hierarchy

Verbose execution content has four presentation levels:

1. **Summary**: one persistent row in the conversation timeline.
2. **Automatic preview**: a small, state-dependent sample of output.
3. **Inline expanded output**: user-requested detail inside a bounded viewport.
4. **Full transcript**: the complete stored command and output in the existing
   message-detail or equivalent dedicated transcript surface.

Moving between these levels changes presentation only. It cannot mutate,
discard, summarize, or fabricate the stored tool result.

## Summary contract

Every affected tool exposes a summary that remains understandable without its
output body. When the corresponding data exists, the summary communicates:

- localized activity label or concise single-line command;
- running, completed, failed, cancelled, or interrupted state;
- duration;
- non-zero exit code;
- logical output line count;
- an explicit indication when stored output was truncated upstream.

A multiline or visually overlong command occupies at most one visual line in
the summary. The full command remains available through disclosure and the full
transcript. Empty output does not produce invented completion text or an empty
output panel.

## Disclosure states

An affected tool has these presentation states:

- **collapsed**: summary only;
- **preview**: summary plus an automatic bounded sample;
- **expanded**: summary plus a user-opened bounded output viewport;
- **full transcript**: dedicated complete-detail surface outside the normal
  timeline flow.

### Initial and automatic state

| Tool state | Default presentation |
| --- | --- |
| Pending permission | Existing permission review remains visible; historical output stays collapsed |
| Running | Preview the most recent output |
| Completed successfully | Collapsed |
| Failed | Failure preview |
| Cancelled or interrupted with diagnostic output | Failure preview |
| Cancelled or interrupted without diagnostic output | Collapsed |

### User intent and transitions

- Activating a collapsed or preview summary opens the inline expanded state.
- Activating an expanded summary collapses it.
- A separate, clearly named action opens the full transcript.
- A manual collapse remains collapsed as additional output arrives.
- A manual expansion remains expanded when running changes to a terminal state.
- Automatic completion collapse applies only when the user has not manually
  changed that tool's disclosure during the current mounted session view.
- Reopening the conversation recalculates the semantic defaults above; this
  feature does not add persistent disclosure state to synchronized history.
- State changes cannot move keyboard focus away from the disclosure control.

## Preview budgets

Budgets are based on rendered visual lines after wrapping, not only newline
characters. Long unbroken text, tabs, CJK, emoji, and narrow-window wrapping
therefore cannot bypass the visible-height limit.

### Running preview

- Shows at most the last 5 visual output lines.
- New output replaces older preview lines instead of increasing timeline
  height.
- If the user is viewing the end of the preview, it follows new output.
- If the user scrolls within expanded output or moves away from the end, new
  output does not seize the scroll position.

### Failure preview

- Shows at most the first 2 and last 8 visual output lines.
- When content is omitted, a visible omission marker separates the head and
  tail.
- Error, stderr, or structurally failed result content takes precedence over
  successful stdout when selecting the limited preview.
- Preview generation cannot infer failure from prose; the existing structured
  tool state remains authoritative.

### Inline expanded output

- Inline expanded content occupies no more than 40% of the conversation
  viewport and no more than 480 logical pixels, whichever is smaller.
- Additional content scrolls inside that bounded area instead of increasing
  the conversation item's height.
- Selection, safe ANSI presentation, and copying remain available.
- The user can open the full transcript without first scrolling the inline
  viewport to either end.

The existing stored-output limit remains independent from all display budgets.
Display folding cannot change the text delivered to the model, sync layer, or
full transcript.

## Activity-group behavior

- A completed successful activity group is collapsed by default.
- A running group remains open only far enough to expose its active tool
  summaries and the active tool's bounded running preview.
- A group containing failures exposes the failed tool summaries and their
  failure previews, but successful sibling output remains collapsed.
- Opening a group initially reveals child summaries, not every child's output.
- A group summary communicates tool count, duration when available, and failure
  count when non-zero.
- Group disclosure and individual-tool disclosure are independent; collapsing
  a group does not erase the individual manual state while the view remains
  mounted.

## Conversation scrolling

- Streaming output cannot continuously increase an item's outer timeline
  height after it reaches its preview budget.
- New output may keep the conversation pinned to the bottom only when the user
  was already at the conversation bottom.
- If the user has scrolled upward, output updates preserve the visible reading
  position and expose a passive new-activity affordance through existing
  conversation behavior.
- Expanding or collapsing an item preserves the disclosure control's visible
  position as closely as the platform permits; it cannot jump directly to the
  end of the conversation.

## Copy and inspection actions

The affected presentation provides discoverable actions to:

- copy the complete sanitized command;
- copy the complete stored sanitized output, not only the preview;
- open the full transcript;
- expand or collapse inline detail.

Copied text excludes unsafe control sequences under the existing transcript
contract. Presentation ellipses and omission labels are not inserted into the
copied complete output.

## Accessibility

- The disclosure control exposes an accessible button role and its current
  expanded state.
- Enter and Space toggle inline disclosure when the control has focus.
- The control has a concise accessible name that includes activity and state;
  the entire verbose body is not used as the button label.
- Collapsed content is absent from the accessibility reading order.
- Streaming chunks are not individually announced. Running status changes may
  use a restrained announcement, while final failure remains discoverable.
- Status is never communicated by color alone.
- High zoom, narrow windows, and keyboard-only navigation preserve access to
  expand, collapse, copy, and full-transcript actions.

## Settings and compatibility

- Packaged Tauri Studio is the only presentation path changed by this feature.
- Default visual style, standalone Web, iOS, and Android retain their current
  behavior.
- Enabling the existing compact-tool preference cannot be bypassed merely
  because a Studio transcript exists.
- Disabling compact tools does not authorize unbounded output in the main
  timeline; the state and height rules in this specification still apply.
- No new protocol fields, migrations, backend behavior, command execution,
  permission behavior, navigation semantics, or synchronized preference are
  required.
- Existing output bounds, ANSI sanitization, status derivation, and legacy
  event compatibility remain unchanged.

## Performance and operational constraints

- A collapsed item must not eagerly lay out or expose its complete output body.
- Maximum-size stored output cannot create an unbounded timeline item in any
  disclosure state.
- Streaming updates within the preview budget must not remount unrelated
  conversation messages or reset their disclosure state.
- Resizing the window recomputes visual-line budgets without revealing more
  than the applicable preview limit or losing the user's manual disclosure
  state.

Exact cross-machine latency thresholds are not specified; deterministic
render-tree bounds, scroll preservation, and packaged-client interaction
evidence are the acceptance signals.

## Edge cases

- Empty command or output.
- Command-only tool and output-only legacy tool.
- One extremely long unbroken line.
- Multiline heredoc command.
- CR-based progress output and streaming partial lines.
- Mixed stdout/stderr where stream identity is unavailable.
- Output truncated at the stored-output boundary.
- ANSI style state spanning chunks and malformed control sequences.
- CJK, emoji, combining characters, bidirectional text, and tabs.
- Rapid running-to-completed transition while manually expanded or collapsed.
- Multiple simultaneous running tools in one activity group.
- Pending permission inside an otherwise completed group.
- Conversation resume, viewport resize, theme change, and high zoom.

## Acceptance criteria and verification map

| ID | Verifiable behavior | Required evidence |
| --- | --- | --- |
| AC1 | A successful completed terminal tool with large output mounts as a one-line summary with no output body | Mounted Studio component test; collapsed body absent from render tree and accessibility tree |
| AC2 | A running tool shows no more than the last 5 wrapped visual lines and does not grow after reaching the budget | Resolver/layout tests with multiline and single-long-line fixtures; mounted streaming test |
| AC3 | A failed tool shows no more than first 2 and last 8 wrapped visual lines with an omission marker | Public-behavior tests for failure, stderr, long lines, and narrow width |
| AC4 | Manual collapse and expansion survive output/state updates for the mounted view; untouched successful completion auto-collapses | State-transition tests covering running, success, failure, cancellation, and interruption |
| AC5 | Inline expansion is bounded by 40% of the conversation viewport and 480 logical pixels and provides internal scrolling | Mounted geometry/scroll test plus packaged Studio inspection at narrow and standard window sizes |
| AC6 | Complete command and stored output remain copyable without ANSI/control characters or presentation omission markers | Copy-action tests using ANSI, truncated, Unicode, and head/tail preview fixtures |
| AC7 | Full transcript remains reachable from collapsed, preview, and expanded states | Navigation/action wiring tests and keyboard-only packaged inspection |
| AC8 | Completed groups reveal summaries rather than all child output; running and failed groups expose only applicable bounded previews | Mounted group tests with successful, running, failed, mixed, and pending-permission children |
| AC9 | Streaming, disclosure, and resize preserve conversation reading position and manual state | Mounted scroll-anchor tests plus packaged interaction evidence |
| AC10 | Disclosure exposes role, accessible name, expanded state, keyboard toggling, and does not announce every chunk | Accessibility tree assertions and keyboard interaction tests |
| AC11 | Existing compact-tool preference is honored in Studio and no Studio mode can produce unbounded main-timeline output | Settings matrix tests for Studio compact on/off and Default fallback |
| AC12 | Default, standalone Web, iOS, Android, protocol, storage, permissions, execution, and structured diff behavior do not regress | Existing suites, Happy App typecheck, applicable complete tests, workflow checks, and whole-diff review |
| AC13 | A packaged Studio build demonstrates success, running, failure, long-line, and group states in light and dark themes | Metadata-backed visual/interaction evidence with explicit human acceptance; missing states remain gaps, not passes |

## Non-goals

- Deleting, summarizing, or reducing stored tool output.
- Changing the 100,000-code-unit transport bound.
- Changing model context or provider event generation.
- Replacing the full message-detail transcript or terminal.
- Redesigning structured file diffs.
- Folding ordinary assistant prose or user messages.
- Adding synchronized disclosure preferences or an always-expanded global mode.
- Implementing terminal input, PTY emulation, or escape-sequence actions.

## Accepted uncertainty

- Provider results may combine stdout and stderr; the UI must not claim stream
  separation when the source does not provide it.
- Exact font wrapping differs by platform and zoom, so the contract is defined
  in rendered visual lines and viewport proportions rather than character
  counts.
- The existing detail route may require presentation refinement to serve as the
  full transcript, but creating a second transcript data model is not required.
- Additional non-terminal tool families may adopt this disclosure contract only
  when real fixtures prove that they expose potentially verbose structured
  output.

## Rollback

The disclosure behavior can return to the existing Studio transcript renderer
without changing protocol or stored data. Default and non-desktop presentation
paths remain independent rollback boundaries.
