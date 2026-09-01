# Workspace Auto-import Tasks

## T1 — Atomic registry import seam

- Scope: Saved Project registry implementation and unit tests.
- Dependencies: accepted `workspace-auto-import` specification.
- Owner/topology: current Root, serial.
- Acceptance: WAI-02, WAI-03, WAI-04.
- Validation: focused `savedProjectRegistry` Vitest file.

## T2 — Machine RPC discovery integration

- Scope: `list-saved-projects` handler and its boundary test.
- Dependencies: T1.
- Owner/topology: current Root, serial.
- Acceptance: WAI-01, WAI-05.
- Validation: focused Saved Projects and workspace discovery RPC tests.

## T3 — Integrated verification

- Scope: focused CLI suite, CLI typecheck, workflow-applicable checks, and
  machine-local smoke against a temporary registry.
- Dependencies: T1 and T2.
- Owner/topology: current Root, serial.
- Acceptance: WAI-01 through WAI-06.
- Validation: commands recorded in Workspace validation evidence.
