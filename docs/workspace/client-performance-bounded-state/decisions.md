# Decisions: `client-performance-bounded-state`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Optimize the client first or immediately redesign the protocol? | resolved | Client first. The user accepted the ordered approach; current code already exposes client-wide full-collection work, while protocol changes trigger cross-device risk and higher upstream conflict. Protocol work requires post-change evidence and a separate gate. |
| D2 | How should history be bounded without losing durable content? | amended | Evict a fully hidden Session cache as one cursor-consistent unit when it exceeds 500 messages or an estimated 10 MiB; protect active queue/send/outbox work. Do not slice an opened transcript: the current one-way backward API cannot safely recover an evicted middle/newer boundary. Reopen from the latest page; server history is never deleted. |
| D3 | Should FlatList be replaced wholesale? | resolved | No speculative replacement. Preserve current virtualized lists and tune windows from evidence; revisit the implementation only if profiles still attribute material work to the list engine. |
| D4 | How should upstream merge conflicts be controlled? | resolved | Put projection/window policy in focused modules with narrow host seams; avoid protocol, persistence, and broad component rewrites in the client-first slice. |
