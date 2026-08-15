# Studio Execution Transcript

## Evidence and authority

Reference precedence:

1. Happy's real tool/message data and compatibility contracts.
2. Codex CLI's open TUI semantic rules and renderer edge cases.
3. CommonMark/GFM, ANSI/ECMA/xterm behavior, and Pierre Diffs public contracts.
4. Codex Desktop and OTTY runtime evidence for density and visual calibration.

OTTY screenshots and bundle resources are evidence, not proof of its private
parser or source constants. Codex CLI's terminal layout is not copied; only its
semantic separation and robustness considerations are translated to Happy's
native desktop components.

## Scope

### Structured execution parts

- Recognized shell/terminal tools expose command, arguments when structurally
  available, working directory, running/completed/error state, duration, and
  output in a coherent Studio transcript component.
- Existing permission, navigation, callback, collapse, compact-setting storage,
  and execution behavior remains unchanged. Studio terminal rows may expand to
  expose accepted transcript content even when generic compact tools are on;
  non-Studio compact behavior remains unchanged.
- Tool data is rendered from existing structured fields; presentation must not
  infer successful execution from prose.

### ANSI output

- Historical output supports safe SGR foreground/background, bold, dim,
  italic, underline, and reset semantics that are present in the received text.
- At minimum support standard 16 colors, 256-color indexes, and valid 24-bit
  RGB; malformed, incomplete, unsupported, OSC, and other control sequences
  cannot trigger actions or leak invisible control characters into the UI.
- Display colors are normalized for Studio light/dark legibility. Selection and
  copy return readable text without control sequences.
- Output is read-only transcript content, not a terminal emulator.

### Diff and status relationship

- Existing Pierre diff rendering remains authoritative for patch parsing.
- Studio connects command/activity status and diff result visually through
  consistent path, success/addition, error/deletion, warning, and secondary
  roles without flattening them into ordinary Markdown.

## Compatibility

- New rendering is active only for packaged Tauri Desktop with Studio selected.
- Default, standalone Web, iOS, and Android preserve their current renderer,
  geometry, accessibility, callbacks, and compact-tool behavior.
- No protocol, storage, backend, authentication, synchronization, permission,
  navigation, or command-execution changes.

## Edge cases

- Empty output and command-only tools.
- Streaming/running tools whose output is absent or incomplete.
- Long commands, long unbroken paths, tabs, CJK, emoji, combining characters,
  and mixed-direction text.
- ANSI state spanning chunks/runs and missing reset sequences.
- Output containing escape sequences other than accepted presentation SGR.
- Large output must remain bounded by existing transcript performance and
  disclosure behavior; no unbounded eager terminal emulation.
- Light/dark contrast and themes with no meaningful source ANSI color.

## Acceptance criteria

- AC1: Real Studio shell tools render command and available execution metadata
  as structured transcript content, while callbacks, permissions, navigation,
  compact-setting storage, and non-Studio behavior remain unchanged; Studio
  terminal rows may expand to expose the transcript.
- AC2: Real Studio completed/error shell tools render received output as
  selectable, copyable styled runs; copy text excludes ANSI/control sequences.
- AC3: Standard 16-color, indexed 256-color, RGB, bold, dim, italic, underline,
  and reset inputs map deterministically to safe Studio light/dark styles.
- AC4: Malformed or unsupported escape/control sequences cannot create links,
  execute actions, hide unrelated text, or reach the rendered/copied text.
- AC5: Long commands, paths, tabs, CJK, emoji, combining characters, and
  multiline output remain readable without fixed-height truncation.
- AC6: Status and diff roles use a shared restrained semantic hierarchy:
  success/addition, failure/deletion, warning/running, and secondary metadata;
  ordinary prose remains neutral.
- AC7: Existing Pierre diff behavior and all permission/action semantics remain
  unchanged.
- AC8: Focused public-behavior tests, Happy App typecheck/full applicable suite,
  whole-diff review, packaged Studio build, and light/dark human visual evidence
  complete before acceptance is claimed.

## Accepted uncertainty

- Exact OTTY and Codex Desktop private implementation constants are unavailable.
- Codex CLI terminal colors are semantic guidance; Studio values must be
  calibrated for desktop surfaces and contrast.
- The first implementation may cover the shell tool families currently exposed
  by Happy and extend to additional provider-specific tools only when fixtures
  prove their actual data shapes.

## Rollback

The transcript module and narrow ToolView/CodeView seams can be reverted without
changing message data. Studio gating provides an immediate compatibility path.
