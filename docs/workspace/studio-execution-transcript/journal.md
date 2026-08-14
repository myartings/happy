# Journal: `studio-execution-transcript`

## `2026-08-14`

- Started workflow.
- Started after user accepted the prior compact option correction and requested
  Codex-CLI-led execution transcript implementation.
- Separated exact open-source behavior from screenshot inference: Codex CLI is
  the semantic reference; OTTY is terminal-host density evidence.
- Selected a packaged-Studio-only vertical slice that reuses real Happy tool
  data and existing Pierre diff behavior without protocol changes.
- RED proved the feature-local transcript model was absent. GREEN now extracts
  observed Bash/CodexBash/Gemini execute command and result shapes, strips unsafe
  controls, parses ANSI, and maps restrained light/dark semantic colors.
- Real mounted `ToolView` coverage proves Studio terminal rows render transcript
  content even with generic compact tools enabled; non-Studio remains on the
  original compact path.
- Codex app-server `tool-call-end` currently carries completion without output;
  the renderer truthfully omits absent output rather than manufacturing logs.
- Whole-diff review added bounded output with matching readable runs, CR-to-line
  normalization for progress logs, ISO colon-form indexed/RGB SGR, and contrast
  normalization for arbitrary indexed/RGB foregrounds.
- Packaged Studio compile/bundle/install/launch passed with `--no-sign`; the
  configured distribution certificate is unavailable locally. Window capture
  proved the fresh 1470x874pt app launch, but disabled Accessibility prevented
  deterministic navigation into the fixture, so exact transcript visual
  acceptance remains explicit rather than manufactured.
