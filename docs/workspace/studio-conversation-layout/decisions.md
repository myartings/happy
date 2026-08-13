# Decisions: `studio-conversation-layout`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which geometry is authoritative where the older adoption table differs from the accepted v2 PNG? | resolved | Use the accepted v2 PNG: 54 pt header and 800 pt visible content measure. |
| D2 | Should the message renderer or composer be changed to obtain the measure? | resolved | No. Constrain the `FlatList` content container to 832 pt so existing 16 pt message insets yield 800 pt; composer remains independently owned. |
| D3 | Does this require a risk gate? | resolved | No `.ai/project.json` trigger applies: presentation-only, desktop-only, no protocol/data/security change. |
