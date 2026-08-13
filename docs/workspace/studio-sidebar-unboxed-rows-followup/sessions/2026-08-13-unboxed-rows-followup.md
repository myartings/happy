# Studio Sidebar Unboxed Rows Follow-up — 2026-08-13

## Assignment

- Correct the failed revision-2 packaged screenshot without changing behavior.
- Prevent ordinary Studio rows from reconstructing a group card.
- Preserve Default, non-Tauri, and mobile paths.

## Batch / ownership plan

- Batch 0: capture failure evidence and resolve root cause serially.
- Batch 1: add the pure row-chrome contract and RED/GREEN tests.
- Batch 2: apply the policy to both row renderers and propagate the resolved
  sidebar visual style through the narrow host seam.
- Batch 3: verify, review, archive, and commit locally.
- Parent dependency: cherry-pick after this commit, then rebuild/capture/review.

## Allowed files

- Studio visual-style feature files and focused tests.
- `SidebarView.tsx`, `MainView.tsx`, `SessionsList.tsx`, and
  `ActiveSessionsGroupCompact.tsx` only for the narrow sidebar style/chrome seam.
- This follow-up workflow/spec/task evidence.

## Stop conditions

- Stop if data, navigation, protocol, callbacks, or protected/mobile-native
  source changes become necessary.
- Stop and diagnose before widening after an unexpected focused failure.

## Return contract

- One clean local commit, exact verification, root-cause summary, and explicit
  remaining packaged-visual uncertainty.

## Outcome

- Root cause corrected at both layers: frame-to-list style propagation and
  row-level chrome composition.
- Compact and historical rows share a tested policy; ordinary Studio rows have
  transparent surface, no group-position shape/clipping/divider, and zero radius.
- Default/non-Tauri/mobile paths remain on their prior behavior.
- Focused 24/24, full Happy App 1123/1123, typecheck, evidence validation, and
  workflow checks pass; whole-diff review has no blocking finding.

## Remaining uncertainty

- The post-fix packaged screenshot does not yet exist. Parent must reintegrate,
  rebuild, capture the same state, and return it to the user; automation does not
  close perceived visual acceptance.
