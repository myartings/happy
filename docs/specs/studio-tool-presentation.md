# Studio Tool Presentation

## Intent

Refine the existing Happy conversation's tool presentation so packaged macOS
Desktop in the accepted Studio style reads as a compact, structured activity
record rather than a stack of oversized mobile cards. This is a presentation
slice only; Happy's tool data and behavior remain authoritative.

## Scope

- Studio-only presentation for tool shells, headers, compact rows, nested
  sections, error surfaces, Codex diff/file headers, and patch disclosure.
- Product changes are limited to `components/tools/**` plus the region-owned
  `features/studio-tool-presentation/**` module.
- Reuse the existing Desktop Studio activation contract and semantic palette.
- Preserve current conversation placement, reading measure, and tool ordering.

## Non-goals

- No parser, protocol, permission, navigation, execution, copy, callback, or
  tool registry changes.
- No changes to `CommandView`, `CodeView`, diff renderer internals, message or
  Markdown hosts, composer, sidebar, overlays, or conversation layout.
- No visual change to Default, standalone Web, iOS, or Android.
- No claim of final visual parity before a packaged integration screenshot and
  explicit human review.

## Observable behavior

1. In packaged Tauri Desktop with Studio selected, expanded tool records use a
   restrained 12 pt contained shell, quiet header, compact spacing, and sparse
   dividers. Compact activity rows remain unboxed and visually secondary.
2. Tool titles remain primary, while descriptions, elapsed time, state, and
   section labels form a smaller secondary/tertiary hierarchy.
3. Errors keep their parsed message and warning semantics in a quieter bounded
   surface; diff additions/deletions retain semantic colors.
4. Codex patch rows keep the same collapsed default and expand/collapse action,
   while file path, change kind, stats, diff, and permission footer remain in
   their existing order.
5. Outside packaged Tauri Studio, all components use their prior style values
   and behavior.

## Compatibility and constraints

- Studio activation must resolve through the same Tauri/requested/preview
  contract as the accepted visual system.
- Style resolution must fail closed to `null` outside Studio so host defaults
  remain unchanged.
- Long command/path/error content must retain existing truncation, overflow,
  and maximum-height behavior.
- No functional callback may be wrapped, reordered, or replaced.

## Acceptance criteria and evidence

| ID | Criterion | Evidence |
| --- | --- | --- |
| A1 | Studio presentation resolves only for packaged Tauri Studio, with light/dark semantic variants. | Resolver tests. |
| A2 | Actual `ToolView` consumes Studio shell/row/header metrics while retaining the existing press callback and compact-vs-expanded content behavior. | Component wiring/behavior test plus diff inspection. |
| A3 | Actual error and patch disclosure components preserve parsed error text and collapsed/expanded behavior while consuming Studio hierarchy. | Component behavior tests plus focused suite. |
| A4 | Default and all non-Tauri clients retain prior presentation. | Resolver fallback assertions and conditional host diff inspection. |
| A5 | Types, focused tests, workflow validation, audit, and staged CI pass. | Recorded commands in workflow validation. |
| A6 | Integrated packaged Desktop appearance is explicitly accepted by the user. | Deferred parent integration screenshot gate; not claimed by this branch. |

## Accepted uncertainty

This child branch cannot guarantee a representative populated conversation in
the packaged app. Exact visual balance remains uncertain until the parent
integrates all parallel tracks, captures a real tool-rich transcript, and asks
the user to accept or revise it.
