# Standards Smell Baseline

Use this Matt v1.2.3 baseline only for the Standards axis. Repository standards
override it, every smell is a labelled judgement call rather than a hard
violation, and anything already enforced by tooling is skipped.

- Mysterious Name — rename unclear functions, variables, or types.
- Duplicated Code — extract a repeated logic shape.
- Feature Envy — move behavior toward the data it primarily uses.
- Data Clumps — bundle fields or parameters that repeatedly travel together.
- Primitive Obsession — introduce a small type for a real domain concept.
- Repeated Switches — centralize repeated type-based branching.
- Shotgun Surgery — gather one logical change into one owning module.
- Divergent Change — split a module changed for unrelated reasons.
- Speculative Generality — remove abstractions unsupported by the spec.
- Message Chains — hide navigation behind an owning method.
- Middle Man — remove delegation that adds no meaningful boundary.
- Refused Bequest — prefer composition when inheritance is mostly rejected.

Source: Matt Skills v1.2.3 `code-review`, commit
`6acc160e4e0cd062dbbbd7a1b26ae92855edf07e`.
