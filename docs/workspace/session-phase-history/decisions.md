# Decisions: `session-phase-history`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where should phase live? | resolved | Add optional `commentary` / `final_answer` to the session text event. It is text semantics, survives sync, and older Zod consumers safely strip the additive key. |
| D2 | How should missing/unknown phase behave? | resolved | Omit unknown provider values and preserve unclassified assistant text in the main timeline. Conservative display avoids destructive inference. |
| D3 | What may collapse? | resolved | Only explicit commentary plus non-interactive tool activity after an explicit final answer. Final and unclassified text remain visible. |
| D4 | Is a migration or feature flag required? | resolved | No migration: the field is optional. No flag: old payload behavior is the conservative compatibility fallback and rollback is code-only. |

## Risk assessment

- **Affected data:** encrypted synchronized session message payloads gain one
  optional enum field; no existing field changes.
- **Blast radius:** mixed-version clients may present different density but can
  still parse and display every message.
- **Failure modes:** phase dropped at one boundary, unknown phase rejected too
  late, or unclassified text accidentally folded.
- **Controls:** boundary tests at Wire, historical/live mapper tests, App
  normalization/reducer tests, conservative unknown fallback, full typechecks,
  and independent whole-diff review.
- **Rollback:** stop emitting/reading the optional field. No stored-data rewrite
  is required.
- **Result:** cleared with controls.
