# Decisions: `studio-panel-resize-joint-projection`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should two visible targets share constrained space? | resolved | Project both widths together. Preserve the 600pt main reserve; establish each side's requested/default-capped base, shrink default bases proportionally above minima only when defaults cannot fit, then distribute remaining panel space proportionally across requested expansion beyond defaults. This removes blank space and avoids either host using stale persisted opposite geometry. |
| D2 | What does reset persist? | resolved | Reset persists the side's intrinsic default target. Joint projection renders the pair of defaults into currently available space, so reset returns to a balanced, containable default rather than a minimum. |
| D3 | What happens when a side is collapsed? | resolved | The visible side uses ordinary single-panel projection and stored targets remain untouched, preserving collapse/reopen restoration. |
