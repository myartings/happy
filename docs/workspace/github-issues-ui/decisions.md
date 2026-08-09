# Decisions: `github-issues-ui`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Fine-grained GitHub App or expanded classic OAuth scopes? | accepted | GitHub App: Metadata read + Issues write on selected repositories; ADR 0005. |
| D2 | What does “delete” mean in Happy? | accepted | Close/Reopen is the normal flow; permanent Delete appears only when GitHub reports `viewerCanDelete`. |
| D3 | Are Issues parallel to Sessions or nested? | accepted | Top-level route with session/project shortcuts; no new native tab system. |
| D4 | Does v1 replace Project Todos? | accepted | No. Keep independent switches until Issue workflow is proven. |

## Risk assessment

- Required: GitHub authorization and repository permissions expand materially.
- Required: permanent deletion is irreversible and permission-sensitive.
- Tokens remain encrypted and server-only; clients receive normalized DTOs.
- Client and server flags default off and provide the rollback boundary.
- No implementation begins until D1–D4 and acceptance criteria are accepted.
