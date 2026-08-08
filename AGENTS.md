# Agent Workflow

## Sync To Main

When the user says `sync to main` or `synt to main`, they mean:

1. Fetch `origin/main`.
2. Rebase the current branch on `origin/main`.
3. Push the current HEAD directly to `main` with a normal push, for example:
   `git push origin HEAD:main`

Do not force push for this workflow.

## Personal Feature Development

Keep `main` clean and tracking `upstream/main`. Personal-only features branch
from `dev` and merge back through review; upstream-bound work branches from a
clean `main`.

Every formal personal feature uses the repository-local lifecycle:

```text
Start -> Plan -> Scope -> Build -> Verify -> Review -> Finish -> Archive
```

- Read `.ai/project.json` for exact commands, protected paths, and tracker
  configuration.
- Create durable state under `docs/workspace/<slug>/` and use
  `scripts/workflow-state.py` for phase transitions and gate receipts.
- Run `python3 scripts/workflow-audit.py --strict --require-active` before
  implementation, handoff, and finish.
- Keep personal product code under explicit feature modules where possible;
  host integration files should contain only small, reviewable seams.
- Before an authorized commit, archive with `commit=pending`, stage product and
  workflow evidence together, and pass `python3 scripts/workflow-ci.py --staged`.
- Do not run the upstream template's full synchronization manifest in this
  repository. Use `.ai/template-adoption.json` for dry-run-first workflow-core
  updates so Happy-owned rules and skills remain intact.
