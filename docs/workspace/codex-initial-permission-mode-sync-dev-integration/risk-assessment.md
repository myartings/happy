# Risk Assessment: `codex-initial-permission-mode-sync-dev-integration`

## Classification

High-risk integration because the two parent changes meet in Codex session
protocol and permission-display metadata orchestration. This workflow adds no
new authorization mechanism: live permission RPC authority remains unchanged.

## Failure modes and controls

- Dropping launch-pinned initialization: retain `initializeCodexBeforeMessages`
  and run `runCodex.launch.test.ts` plus the full CLI suite.
- Resetting a newer permission revision during reconnect: hydrate the server
  session and retain the CAS retry test that preserves revision 9.
- Treating partial reconnect state as fresh: retain the six-variable
  fail-closed credential tests.
- Presenting the prior process's confirmed route during a pending reconnect:
  clear the old effective model/effort pair and retain a focused merge test.
- Publishing a merge with unresolved or unrelated bytes: require zero conflict
  markers, compare the result to target parent, and bind checks/reviews to the
  exact staged candidate.
- Remote divergence or failed hosted checks: re-fetch and stop; never rebase,
  amend, reset, or force-push under this authorization.

## Reversibility and stop conditions

The integration is an ordinary two-parent merge commit and can be reverted as
one unit. Stop before publication on any failed required check, blocked review,
unexpected target movement, additional conflict, or product delta outside the
accepted eight files.

Result: `cleared-with-controls`; independent capable Spec and Standards review,
candidate-bound full checks, staged/committed CI, and hosted checks are required.
