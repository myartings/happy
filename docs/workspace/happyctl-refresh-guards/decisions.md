# Decisions: `happyctl-refresh-guards`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should an ahead personal `main` be validated? | decided | Reuse `assert_official_product_equivalence`, which already requires the official commit and rejects paths outside the explicit devtools allowlist. |
| D2 | Should missing public identifiers disable the feature or stop a personal build? | decided | Preserve the accepted fail-closed contract: `build_desktop` returns failure before dependency installation. |
