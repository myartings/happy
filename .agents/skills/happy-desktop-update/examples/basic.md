# happy-desktop-update Examples

## Example 1: Standard Trigger

User:

```text
更新 Happy 到最新
```

Expected behavior:

- Treat the request as authorization for the complete macOS Desktop update.
- Run `/Users/myartings/workspace/happy/devtools/happyctl refresh-desktop`.
- Synchronize official `main` into personal `dev` and build only from `dev`.
- Preserve the `gpt-5.6-sol` daemon fallback and Happy Desktop new-session
  default together with the notification and WebContent recovery fixes.
- Report the final result without asking for another installation confirmation.

## Example 2: Equivalent Wording

User:

```text
把 Happy 升级到最新版
```

Expected behavior:

- Use the same full `main -> dev` Desktop workflow.
- Do not substitute a direct pull or build from `main`.

## Example 3: CLI-Only Boundary

User:

```text
只更新 Happy CLI
```

Expected behavior:

- Do not run the Desktop `main -> dev` workflow.
- Use the manager's CLI update path after identifying the installed CLI source.

## Example 4: Merge Conflict

If `refresh-desktop` reports a merge conflict:

- Stop without replacing the installed app.
- Report the conflicting branch and files.
- Do not reset, force-push, or build from a branch that lost any personal fix
  or the `gpt-5.6-sol` default-model customization.
