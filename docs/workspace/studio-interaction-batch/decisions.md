# Decisions: `studio-interaction-batch`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Execution model | resolved | Three isolated writer worktrees run concurrently; one parent integration worktree owns merge/build/screenshots. |
| D2 | Product layout boundary | resolved | Preserve Happy functional layout and semantics; detailed state styling may change boldly within the accepted Studio language. |
| D3 | Platform boundary | resolved | Packaged Tauri Desktop Studio only; Default, standalone Web, iOS, and Android remain on existing paths. |
| D4 | Visual completion | resolved | User screenshot acceptance is required; parent must reject candidates whose production wiring does not visibly apply. |
| D5 | Remote operations | resolved | Local branches and commits only; no push or PR in this batch. |
