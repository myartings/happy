# Decisions: `client-performance-hotspots`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | When should Prompt Navigator load older prompts? | accepted | Use currently loaded messages immediately. Fetch older history only when navigation needs it, in pages of 100; do not restore background prefetch. |
| D2 | How should reconnect preserve freshness without duplicate Git work? | accepted | Initial visibility owns the complete refresh. Later reconnect transitions refresh visible messages only; Git status remains owned by the visibility path. |
| D3 | How should encryption cache recency be maintained? | accepted | Use JavaScript Map insertion order: delete and reinsert on access/update, then evict the first key in O(1). Preserve existing limits and clearing APIs. |
| D4 | How is integration isolated? | accepted | Implement on a new personal branch based on `dev`; do not include the separate unmerged message-cache branch. |
