---
name: create-prd
description: Create or update docs/PRD.md when product commitments need a durable product requirements document.
---

# Create Product Requirements Document

Use this after `grill-with-docs` has resolved the product decisions that matter.

1. Read the existing PRD, applicable context, ADRs, research, and accepted discussion.
2. Describe the executive summary, problem, target users, success metrics, core features, user stories, acceptance criteria, non-functional requirements, technical constraints, scope, and explicit non-goals that apply.
3. Ask `grilling` only for unresolved user decisions; discover repository facts yourself.
4. Preserve unrelated commitments and write the smallest coherent update to `docs/PRD.md`.
5. Route a feature needing a detailed technical contract to `generate-spec`.

Do not turn the PRD into an implementation checklist or duplicate a Feature Spec.
