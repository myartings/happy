# Adoption Classification: `workflow-2026.09.2`

## Source and dry-run

- Source: clean
  `/Users/myartings/workspace/.worktrees/ai-coding-template-workflow-2026-09-2-happy-cohort`
- Identity: `workflow-2026.09.2@40dc17d0d200370fd8c5498fb1da1bdd9ebde4e9`
- Target/base: current Issue #104 worktree at
  `origin/dev@1e03026a5febe5815a47687c7b220aa6c6dba758`
- Initial result: 23 changes; three retired paths already absent; no blocked
  retirement or forbidden/unclassified surface.

## Adopt canonical upstream bytes

- `.agents/skills/batch-plan/SKILL.md`
- `.agents/skills/decision-map/SKILL.md`
- `.agents/skills/implement/SKILL.md`
- `.agents/skills/scoping/SKILL.md`
- `.agents/skills/start/SKILL.md`
- `.codex/README.md`
- `.codex/REASONING.md`
- `.codex/agents/explorer.toml`
- `.codex/agents/mechanical.toml`
- `.codex/agents/researcher.toml`
- `.codex/agents/worker.toml`
- `docs/adr/0004-commit-bound-workflow-enforcement.md`
- `docs/workflow/execution-isolation.md`
- `docs/workflow/host-environment.md`

These paths are explicitly included by Happy's schema-2 manifest and implement
one coherent `.2` workflow/session-routing and commit-bound runtime contract.

## Translate under Happy ownership

- `.ai/project.json`: merge only compatible upstream campaign/feature defaults
  while retaining Happy identity, pnpm product commands, check selection,
  tracker target, protected/generated paths, risk triggers, and review profiles.
- `scripts/workflow-check.py`, `scripts/workflow-state.py`,
  `scripts/workflow-review.py`, `scripts/workflow-issue-route.py`, and
  `scripts/workflow-ci.py`: three-way translate from the `.08.2` common base.
  Preserve Happy's candidate-bound accepted-gap policy, replan epoch checks,
  fork-aware Issue remote routing, merge-integration enforcement, and
  cross-platform canonical text behavior while adding `.2` formal-run binding,
  same-candidate review preservation, manual-launch/campaign compatibility, and
  shadow check-selection reporting.
- `.agents/skills/finish-work/SKILL.md`,
  `.agents/skills/tracker-workflow/SKILL.md`, `docs/workflow.md`, and
  `docs/workflow/tracker-workflow.md`: retain the adopted lifecycle and tracker
  rules while translating references to upstream-only downstream-promotion,
  delivery-audit, and unattended-campaign surfaces into Happy's supported
  `update-spec` and `tracker-workflow` boundaries.
- `scripts/validate-happy-workflow.py`: update immutable `.2` provenance and
  require the five coupled scripts in the Happy-owned preserve/translation set.

## Preserve / reject

- Preserve every manifest `preserve` entry, including `AGENTS.md`, `CONTEXT.md`,
  `.ai/project.json`, Happy validators/adapters, custom skills, Paper MCP,
  `.claude/`, `.github/workflows/`, `devtools/`, and active/archive state.
- Reject upstream full synchronization and all non-allowlisted source,
  maintainer, release-fleet, product, dependency, native, generated, CI, and
  release surfaces.

## Retirement

- `scripts/test-workflow.py`: already absent; accepted fingerprint retirement
  requires no mutation.
- `scripts/test-workflow-ci.py`: already absent; accepted fingerprint retirement
  requires no mutation.
- `scripts/test-workflow-core.py`: already absent; accepted fingerprint
  retirement requires no mutation.

## Apply decision

Cleared for the manifest-scoped transactional apply. Stop if the apply reports
any path or retirement state outside this ledger.
