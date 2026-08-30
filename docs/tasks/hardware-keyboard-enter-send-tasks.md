# Tasks: Hardware Keyboard Enter-to-Send

## T1 - Establish the keyboard-command policy seam

- Scope: pure platform/key/modifier policy and focused tests.
- Allowed files: `packages/happy-app/sources/keyboard/**` and focused tests.
- Dependencies: none.
- Acceptance: only Apple native unmodified Return is handled; Shift+Return,
  Web, and non-Return keys are not handled.
- Validation: targeted Vitest command.

## T2 - Add the app-local Apple command view

- Scope: local Expo module and TypeScript wrapper that registers a priority
  unmodified Return command, declines marked-text handling, and emits one event.
- Allowed files: `packages/happy-app/modules/hardware-keyboard-command/**` and
  the TypeScript wrapper under `sources/keyboard/**`.
- Dependencies: T1.
- Acceptance: module autolinks without manual generated-project edits; wrapper
  is transparent off Apple native.
- Validation: module/source inspection, Expo autolinking resolution, Swift/iOS
  build when available.

## T3 - Wire both composers to their existing actions

- Scope: wrap existing-session and new-session text inputs; route hardware
  Return through existing autocomplete/send guards.
- Allowed files: `AgentInput.tsx`, new-session composer, and focused tests.
- Dependencies: T1, T2.
- Acceptance: no duplicate send path and no change to visible send-button,
  software-keyboard, Web, or Android behavior.
- Validation: targeted tests and happy-app typecheck.

## T4 - Verify integration and device behavior

- Scope: focused suites, applicable happy-app checks, diff review, physical iPad
  matrix for Return, Shift+Return, software keyboard, autocomplete, and CJK IME.
- Dependencies: T1-T3.
- Acceptance: deterministic checks pass; physical gaps are explicitly recorded.
- Validation: commands and results in workflow `validation.md`.
