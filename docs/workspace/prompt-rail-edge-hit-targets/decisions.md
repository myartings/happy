# Decisions: `prompt-rail-edge-hit-targets`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Why are the bottom ticks unclickable? | decided | The newer-arrow `hitSlop={8}` extends 8px upward over the track and intercepts pointer events for the bottom few prompts in long histories. The older arrow has the symmetric overlap at the top. |
| D2 | How should arrow accessibility be retained? | decided | Keep 8px expansion on the outer and horizontal edges, but set hit slop to zero on the edge adjacent to the track. |
