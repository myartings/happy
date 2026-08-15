# Context: `studio-execution-transcript`

## Goal

Translate Codex CLI's open semantic transcript principles into Happy's packaged
Studio desktop components: structured shell activity, safe ANSI output, status,
and diff relationship, while ordinary prose stays neutral.

## Evidence

- Codex CLI source and `codex-rs/tui/styles.md` are authoritative for its open
  semantic conventions and terminal renderer edge cases.
- OTTY 1.3.1 local bundle inspection found terminal integration, `syntaxes.bin`,
  and code fonts; this is static evidence only, not private parser proof.
- User OTTY screenshot evidence record:
  `/Users/myartings/Sync/tmp/otty-conversation-semantic-color-2026-08-14/otty-conversation-semantic-color-evidence.json`.
- Happy already has tool-specific views, Pierre diffs, Studio tool tokens, and a
  safe-but-not-yet-rendered ANSI SGR parser.

## Compatibility boundary

Packaged Tauri Studio only. No protocol, backend, persistence, synchronization,
permission, command-execution, navigation, Default, standalone Web, iOS, or
Android behavior changes.

The machine-readable, role-scoped manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.
