# Risk Assessment: `happyctl-local-main-release`

Status: cleared with controls.

- Allow only when `origin/main` is an ancestor of local `main`.
- Continue rejecting missing, behind, or diverged local main.
- Retain upstream product-equivalence validation before the origin check.
- The release path remains fetch-only and never pushes.
