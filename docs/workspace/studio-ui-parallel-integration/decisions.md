# Decisions: `studio-ui-parallel-integration`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How many implementation sessions run concurrently? | decided | Four; overlays/pages starts when a slot frees. |
| D2 | How are conflicts reduced? | decided | Exclusive regional file ownership and region-local style adapters. |
| D3 | What counts as visual acceptance? | decided | User approval of integration screenshots; automated checks are necessary but insufficient. |
| D4 | May child sessions push? | decided | No; all commits and merges remain local until separately authorized. |
