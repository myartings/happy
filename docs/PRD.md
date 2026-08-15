# Happy Personal Studio Product Requirements

## Product intent

Preserve Happy's cross-platform functionality while providing a packaged
desktop Studio presentation for users who want coding-agent information density
and semantic clarity comparable to mature desktop and terminal coding tools.

## Studio execution transcript outcome

When an agent runs commands, emits terminal output, changes files, or reports a
result, a desktop Studio user can distinguish the command, arguments, working
directory, output, failure/success state, and diff relationship without reading
an undifferentiated code box.

Observable success:

- ordinary assistant prose stays neutral and readable;
- semantic color is reserved for links, commands, terminal output, statuses,
  errors, and diffs;
- shell execution output retains safe ANSI meaning, text selection, copy, CJK,
  Unicode, wrapping, and long-line usability;
- structured tool parts remain truthful to Happy's existing message data;
- packaged Tauri Studio gains the richer presentation while Default,
  standalone Web, iOS, and Android retain current behavior;
- existing and new clients remain mutually compatible when optional execution
  result metadata is present or absent; command execution and permission
  behavior do not change.

## Studio activity continuity outcome

When Codex completes a command, the result that already exists at the local
runtime reaches the matching Happy tool call without being flattened or
discarded. Studio can then present truthful `Ran`, `Explored`, and `Edited`
activity with restrained type and state color, while older clients and messages
that lack result metadata continue to behave exactly as before.

Observable success:

- command output, exit status, and duration survive the CLI-to-app path within a
  documented size bound;
- legacy `tool-call-end` events without result fields remain valid;
- non-zero command exits become observable tool errors without inferring status
  from prose;
- Studio activity rows distinguish terminal, read/search, edit, task, neutral,
  running, and failure semantics; completed rows retain their category color
  without coloring ordinary assistant prose;
- Studio file-edit activities expose their unified diff directly in the
  transcript with green additions, red deletions, file identity, and counts,
  instead of hiding the first useful view behind a generic disclosure;
- Default, standalone Web, iOS, and Android retain their existing presentation.

## Non-goals

- Reproduce terminal character-cell chrome or proprietary OTTY/Codex Desktop
  assets.
- Color arbitrary prose using heuristic sentiment or keyword detection.
- Build an interactive terminal emulator inside conversation history.
- Replace the existing Pierre diff parser/renderer.
- Change mobile or Default presentation in this feature.
- Stream live terminal cells or implement an interactive terminal emulator.
- Persist unbounded command output or retroactively manufacture output for old
  messages that never carried it.
