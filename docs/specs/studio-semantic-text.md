# Studio Semantic Text

## Goal

Improve the information hierarchy of Happy Desktop conversations so ordinary
users perceive materially less visual-quality difference from Codex, while
preserving message content, interaction behavior, and the existing Default
visual style.

## Scope

- Define presentation-neutral semantic roles for ordinary text, headings,
  emphasis, links, inline code, commands, paths, numbers, and success, warning,
  error, and secondary status text.
- Parse ANSI input into plain text plus semantic runs using a display-only SGR
  subset.
- Apply the roles to Markdown and structured conversation surfaces after the
  Studio theme exposes the corresponding color contract.
- Support Studio only in packaged macOS and Windows desktop clients.
- Use Codex as the primary visual reference; retain Otty only as historical
  supporting evidence where it remains relevant.

## Parallel development boundary

The semantic model, ANSI parser, fixtures, and unit tests are independent of
the in-progress Studio theme branch and may be developed now. They must not
import unfinished Studio theme modules or modify shared integration files owned
by `feature/codex-visual-theme`.

The Studio checkpoint reached `dev` at `fb26bb46`. This branch may now consume
its stable desktop resolver without editing that feature's owned files. The
following integration work remains coordinated by the parent Studio workflow:

- edits to shared theme registration or visual-style selection seams;
- tool-shell component mapping outside the explicit semantic-text ownership;
- matched Codex/Happy screenshot acceptance.

The expected checkpoint is a committed, tested Studio theme API with stable
semantic token names. Integration uses normal Git history; files are not copied
from another dirty worktree.

## Observable behavior

### Semantic hierarchy

- The semantic model distinguishes primary body text from headings, secondary
  metadata, links, inline code, commands, paths, numbers, and status levels.
- Role classification is independent from concrete color values and runtime
  platform checks.
- Existing Markdown meaning, selectable text, links, copy behavior, tables,
  Mermaid rendering, and fenced-code syntax highlighting remain unchanged.

### ANSI display subset

- Plain input produces one equivalent plain semantic run.
- CSI SGR (`ESC [` parameters `m`) may change foreground/background color and
  bold, dim, italic, or underline state, and may reset those attributes.
- Standard 16 colors, 256-color indexes, and truecolor values may be represented
  as bounded display metadata; unsupported or malformed parameters recover to
  safe plain text/state without throwing.
- All non-SGR escape/control sequences are inert: cursor movement, erase,
  device queries, OSC titles, OSC hyperlinks, clipboard sequences, and similar
  controls never execute or become interactive behavior.
- Parsing is deterministic and linear over bounded message input. It does not
  invoke a shell, terminal emulator, network, filesystem, clipboard, or URL.
- Copy/select operations expose readable text without control sequences.

### Platform behavior

- Semantic parsing may remain platform-neutral pure logic.
- Visible Studio mappings are enabled only for packaged macOS and Windows.
- iOS, Android, and standalone browser Web preserve Default rendering and do
  not expose the Studio selector through this slice.

## Non-goals

- Terminal emulation, cursor state, screen buffers, shell execution, or PTY
  behavior.
- Replacing the existing fenced-code syntax highlighter.
- Treating arbitrary ANSI/OSC hyperlinks as trusted links.
- Editing the in-progress theme branch's files before its checkpoint lands.
- Pixel-identical reproduction of Otty.

## Risk controls

- Maintain a positive allowlist for SGR only; consume or neutralize every other
  escape sequence as text-display input.
- Cap output run growth relative to input and merge adjacent equivalent runs.
- Add adversarial tests for malformed, truncated, nested, repeated, and very
  long sequences, including OSC 8 and OSC 52.
- Keep the parser pure and dependency-free unless an alternative receives a
  separate review.
- Stop integration if the final Studio token API conflicts with the semantic
  role contract; update the spec and decisions before adapting either side.

## Acceptance criteria

| ID | Criterion | Evidence |
| --- | --- | --- |
| AC1 | A platform-neutral semantic-role contract covers the scoped text categories without concrete theme imports. | Focused type/unit tests and source inspection. |
| AC2 | Plain, standard-color, 256-color, truecolor, emphasis, and reset SGR cases produce deterministic semantic runs and readable plain text. | Focused parser tests. |
| AC3 | Cursor, erase, OSC hyperlink, clipboard, malformed, and truncated control input produces no active behavior and does not throw. | Adversarial parser tests. |
| AC4 | Output run growth is bounded and adjacent equivalent runs are merged. | Boundary/property-style tests. |
| AC5 | Existing Markdown parsing and fenced-code highlighting regressions remain green. | Existing focused suites plus Happy app typecheck. |
| AC6 | After the Studio checkpoint, Markdown and structured conversation surfaces consume shared semantic roles only in packaged macOS/Windows Studio mode. | Component tests and runtime/platform inspection. |
| AC7 | iOS, Android, standalone Web, and Default style retain existing behavior. | Runtime resolver/component regression tests. |
| AC8 | Representative Happy Desktop screenshots complete the project visual-match loop against Codex, with unresolved differences recorded. | macOS/Windows capture manifest and human screenshot review. |

## Accepted uncertainty

- Concrete Studio color values and the final theme-token property names are
  intentionally deferred to the theme checkpoint.
- Tool-shell text mapping remains a coordinated follow-up; the semantic
  categories and Studio-only presentation resolver in this branch remain its
  contract.
