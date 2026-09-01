# Decisions: `runtime-confirmed-codex-route`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What is authoritative effective-route evidence? | accepted | Only one complete current model/effort pair confirmed by Codex App Server; requested state and prior metadata are never proof. Issue #80 and feature spec. |
| D2 | How is partial, reset/default, malformed, or stale evidence handled? | accepted | Clear or withhold both effective fields until a concrete pair is confirmed; never synthesize or mix values. Issue #80 acceptance criteria. |
| D3 | Does `modelMode` change meaning? | accepted | No. It remains requested/current UI state for compatibility. |

No material product decision remains open. Implementation-level choices must
preserve these accepted behavioral constraints and are resolved by TDD against
the current App Server seam.
