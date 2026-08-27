# Decisions: `cross-device-active-day-grouping`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which timestamp owns active ordering and day grouping? | resolved | Use `SessionRowData.lastActivityAt`; it is already derived through `getSessionActivityAt`, which prefers synchronized `metadata.lastMeaningfulMessageAt`. |
| D2 | Should the synchronization protocol or persistence change? | resolved | No. The defect is in a pure presentation pass that ignores the canonical row projection. |
| D3 | What is the rollback boundary? | resolved | Revert the single activity-key expression and its regression test; no data migration or cleanup is required. |

## Risk assessment

Result: **cleared-with-controls**.

- Affected users: clients enabling global active-session sorting and day grouping.
- Data and external systems: read-only in-memory session projections; no writes,
  credentials, money, permissions, server APIs, or external calls.
- Failure modes: an incorrect key could reorder sessions or misclassify the day;
  a timezone change could alter midnight behavior. Controls are a focused
  cross-device regression and retaining the existing local-midnight boundary.
- Reversibility: immediate source rollback; no persisted or synchronized state
  is modified.
- Stop conditions: any required protocol/schema change, or any regression outside
  ordering/grouping, returns the task to diagnosis before implementation.

## Scoping assessment

Result: **ready**. This is a single pure-function behavior slice with a stable
public test seam. Implementation is limited to the list projection and its test.
No tracker boundary or delegated execution is needed.
