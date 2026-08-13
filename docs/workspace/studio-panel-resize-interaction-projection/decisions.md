# Decisions: `studio-panel-resize-interaction-projection`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How is constrained resize intent represented? | resolved | Handle receives targetWidth and renderedWidth separately. Interaction deltas start from rendered width; callback persists the requested rendered target and last active side. Joint projection honors that active target first and gives the remainder to the opposite side within bounds. |
| D2 | Why persist active side? | resolved | Two scalar targets cannot identify which side owns constrained-budget priority. Persisting the last resized side preserves visible intent after rerender, collapse/reopen, and restart without changing message/session data. |
