# Decisions: `publish-launch-pinned-codex-effort`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What may establish the pre-message effective route? | accepted | Only a complete concrete pair returned by the supported App Server `thread/start` boundary; argv, requested Session state, and UI/global defaults remain non-authoritative. |
| D2 | How is launch effort applied when `thread/start` has no effort field? | accepted | Add the launch effort to the supported App Server thread configuration as `model_reasoning_effort`, alongside the existing MCP configuration; keep `turn/start.effort` for later explicit/sticky per-turn behavior. |
| D3 | When is a fresh thread created? | accepted | After App Server initialization and Happy MCP setup, before waiting for the first message, only for fresh non-resume/non-fork Sessions. Existing resume/fork paths retain their own confirmation flows. |
| D4 | What happens when eager creation or evidence validation fails? | accepted | Initialization fails closed and no effective pair is published. Do not fall back to requested argv or Medium, do not create a turn, and do not emit synthetic input. |
| D5 | Is an ADR required? | accepted | No. The change is a reversible timing/configuration correction inside the existing Issue #80 authority architecture; the durable Spec and tests explain the non-obvious boundary without creating a new cross-system architecture. |
