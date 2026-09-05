#!/usr/bin/env python3
"""Validate Happy's selective workflow-2026.09.4 adoption boundary."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RELEASE = "workflow-2026.09.4"
COMMIT = "9243174707d21e7325c2877b37c54fd7a2e24045"

DISTRIBUTED = {
    ".gitattributes",
    ".agents/skills/create-prd",
    ".agents/skills/generate-spec",
    ".agents/skills/generate-tasks",
    ".agents/skills/research",
    ".agents/skills/grill-with-docs",
    ".agents/skills/grilling",
    ".agents/skills/domain-modeling",
    ".agents/skills/publish-tasks",
    ".agents/skills/triage",
    ".agents/skills/implement",
    ".agents/skills/tdd",
    ".agents/skills/codebase-design",
    ".agents/skills/diagnosing-bugs",
    ".agents/skills/improve-codebase-architecture",
    ".agents/skills/code-review",
    ".agents/skills/handoff",
    ".agents/skills/start",
    ".agents/skills/finish-work",
    ".agents/skills/risk-gate",
    ".agents/skills/update-project-guidance",
    ".github/ISSUE_TEMPLATE/agent-work-item.md",
    ".github/ISSUE_TEMPLATE/config.yml",
    "docs/agents",
    "docs/workflow.md",
    "docs/specs/template.md",
    "docs/tasks/template.md",
    "scripts/workflow-check.py",
}

SKILL_EXTRA_FILES = {
    "codebase-design": {"DEEPENING.md", "DESIGN-IT-TWICE.md"},
    "diagnosing-bugs": {"scripts/hitl-loop.template.sh"},
    "domain-modeling": {"ADR-FORMAT.md", "CONTEXT-FORMAT.md"},
    "improve-codebase-architecture": {"HTML-REPORT.md"},
    "tdd": {"mocking.md", "tests.md"},
    "triage": {"AGENT-BRIEF.md", "OUT-OF-SCOPE.md"},
}

EXPECTED_DIRECTORY_FILES = {
    relative: {
        "SKILL.md",
        "agents/openai.yaml",
        *SKILL_EXTRA_FILES.get(Path(relative).name, set()),
    }
    for relative in DISTRIBUTED
    if relative.startswith(".agents/skills/")
}
EXPECTED_DIRECTORY_FILES["docs/agents"] = {
    "domain.md",
    "issue-tracker.md",
    "triage-labels.md",
}

HAPPY_PRESERVES = {
    "AGENTS.md",
    "CONTEXT.md",
    ".ai/project.json",
    ".ai/template-adoption.json",
    ".agents/agents",
    ".agents/skills/agent-browser",
    ".agents/skills/control-flow",
    ".agents/skills/dev",
    ".agents/skills/happy-desktop-official-release",
    ".agents/skills/happy-desktop-update",
    ".agents/skills/happy-ios-release",
    ".agents/skills/maintain",
    ".agents/skills/metrics-graphana",
    ".agents/skills/office-hours",
    ".agents/skills/release",
    ".agents/skills/sessions",
    ".agents/skills/terminal-emulator",
    ".claude",
    ".codex/config.toml",
    ".github/workflows",
    "devtools",
    "docs/PRD.md",
    "docs/adr",
    "docs/workflow/source-mapping.md",
    "docs/workspace/ACTIVE.md",
    "docs/workspace/archive.md",
    "scripts/workflow-ci.py",
    "scripts/workflow-audit.py",
    "scripts/test-happy-workflow-state-upgrade.py",
    "scripts/test-happy-workflow-runtime.py",
    "scripts/validate-happy-workflow.py",
    "scripts/test-validate-happy-workflow.py",
}

RETIRED = {
    ".agents/skills/batch-plan",
    ".agents/skills/check",
    ".agents/skills/continue",
    ".agents/skills/decision-map",
    ".agents/skills/diagnose",
    ".agents/skills/review",
    ".agents/skills/scoping",
    ".agents/skills/tracker-workflow",
    ".agents/skills/update-spec",
    ".agents/skills/workflow-audit",
    ".codex/README.md",
    ".codex/REASONING.md",
    ".codex/agents",
    ".codex/hooks.json",
    ".codex/hooks",
    "docs/workflow/capability-owners.json",
    "docs/workflow/discovered-work-scope-containment.md",
    "docs/workflow/execution-isolation.md",
    "docs/workflow/host-environment.md",
    "docs/workflow/intensity-matrix.md",
    "docs/workflow/ticket-task-contract.md",
    "docs/workflow/tracker-workflow.md",
    "docs/workspace/template",
    "scripts/workflow-candidate.py",
    "scripts/workflow-parallel-report.py",
    "scripts/workflow-review.py",
    "scripts/workflow-run.py",
    "scripts/workflow-state.py",
    "scripts/workflow-issue-route.py",
    "scripts/happy-workflow-state-upgrade.py",
}

ADOPTION_RETIRED = {
    ".agents/skills/to-tickets",
    "scripts/test-workflow.py",
    "scripts/test-workflow-ci.py",
    "scripts/test-workflow-core.py",
}

REQUIRED_CHECKS = [
    "{python} scripts/test-happy-workflow-state-upgrade.py",
    "{python} scripts/test-happy-workflow-runtime.py",
    "{python} scripts/validate-happy-workflow.py",
    "{python} scripts/test-validate-happy-workflow.py",
    "{python} scripts/workflow-audit.py --all --strict",
]

EXPECTED_COMMANDS = {
    "setup": ["pnpm install --frozen-lockfile"],
    "format": [],
    "lint": [],
    "typecheck": [
        "pnpm --filter happy-app typecheck",
        "pnpm --filter happy-server typecheck",
    ],
    "test": [
        "pnpm --filter happy-app exec vitest run",
        "pnpm --filter happy-server test",
    ],
    "build": [],
    "workflow": REQUIRED_CHECKS,
    "check": REQUIRED_CHECKS,
}

EXPECTED_TRACKER = {
    "provider": "github",
    "target": "myartings/happy",
    "categories": {"bug": "bug", "enhancement": "enhancement"},
    "states": {
        "needsTriage": "needs-triage",
        "needsInfo": "needs-info",
        "readyForAgent": "ready-for-agent",
        "readyForHuman": "ready-for-human",
        "wontfix": "wontfix",
    },
}

EXPECTED_PROTECTED_PATHS = [
    ".env",
    ".env.*",
    "**/secrets/**",
    "**/credentials/**",
    ".git/**",
    "packages/happy-app/android/**",
    "packages/happy-app/ios/**",
]

EXPECTED_GENERATED_PATHS = [
    "node_modules/**",
    "packages/*/node_modules/**",
    "packages/happy-app/dist/**",
    "packages/happy-app/.expo/**",
    "packages/happy-app/src-tauri/target/**",
    "coverage/**",
]

EXPECTED_RISK_TRIGGERS = [
    "authentication",
    "authorization",
    "GitHub permissions",
    "data migration",
    "privacy",
    "security",
    "production deployment",
    "destructive operation",
    "session protocol",
    "cross-device synchronization",
]


def read_json(path: Path, errors: list[str]) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"invalid {path.name}: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"{path.name} must contain an object")
        return {}
    return value


def require_markers(
    root: Path, relative: str, markers: tuple[str, ...], errors: list[str]
) -> None:
    path = root / relative
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        errors.append(f"cannot read {relative}: {exc}")
        return
    for marker in markers:
        if marker not in text:
            errors.append(f"{relative} missing contract marker: {marker}")


def validate(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    manifest_path = root / ".ai/template-adoption.json"
    project_path = root / ".ai/project.json"
    manifest = read_json(manifest_path, errors)
    project = read_json(project_path, errors)

    if manifest.get("schemaVersion") != 2:
        errors.append("template adoption schemaVersion must be 2")
    if manifest.get("policy") != "selective-workflow-core":
        errors.append("template adoption policy must remain selective-workflow-core")
    if manifest.get("sourceRepository") != "https://github.com/myartings/ai-coding-template.git":
        errors.append("template adoption source repository drifted")
    if (manifest.get("sourceRelease"), manifest.get("sourceCommit")) != (RELEASE, COMMIT):
        errors.append(f"template adoption must pin {RELEASE}@{COMMIT}")

    includes = set(manifest.get("include", []))
    preserves = set(manifest.get("preserve", []))
    if includes != DISTRIBUTED:
        errors.append(
            "template adoption distributed paths drifted: "
            f"missing={sorted(DISTRIBUTED - includes)} extra={sorted(includes - DISTRIBUTED)}"
        )
    missing_preserves = HAPPY_PRESERVES - preserves
    if missing_preserves:
        errors.append("template adoption omits Happy preserves: " + ", ".join(sorted(missing_preserves)))
    if any(path == ".claude" or path.startswith(".claude/") for path in includes):
        errors.append("frozen Claude paths must not be distributed")
    retired_entries = manifest.get("retiredPaths", [])
    retired_paths = {
        entry.get("path") for entry in retired_entries if isinstance(entry, dict)
    }
    if retired_paths != ADOPTION_RETIRED:
        errors.append("template adoption retired-path records drifted")
    if manifest.get("requiredProjectChecks") != REQUIRED_CHECKS:
        errors.append("template adoption requiredProjectChecks drifted")

    for relative in sorted(DISTRIBUTED | HAPPY_PRESERVES):
        if not (root / relative).exists():
            errors.append(f"missing adopted or preserved path: {relative}")
    for relative, expected_files in sorted(EXPECTED_DIRECTORY_FILES.items()):
        directory = root / relative
        if not directory.is_dir():
            continue
        actual_files = {
            path.relative_to(directory).as_posix()
            for path in directory.rglob("*")
            if path.is_file()
            and "__pycache__" not in path.parts
            and not path.name.endswith(".pyc")
        }
        if actual_files != expected_files:
            errors.append(
                f"distributed directory tree drifted: {relative} "
                f"missing={sorted(expected_files - actual_files)} "
                f"extra={sorted(actual_files - expected_files)}"
            )
    for relative in sorted(RETIRED | ADOPTION_RETIRED):
        if (root / relative).exists():
            errors.append(f"retired workflow path still exists: {relative}")

    if project.get("schemaVersion") != 1:
        errors.append("project schemaVersion must remain 1")
    if project.get("name") != "Happy":
        errors.append("project name must remain Happy")
    if project.get("profile") != "typescript-monorepo":
        errors.append("project profile must remain typescript-monorepo")
    if project.get("maturity") != "production":
        errors.append("project maturity must remain production")
    for retired_key in ("features", "checkProfiles", "checkSelection", "reviewProfiles"):
        if retired_key in project:
            errors.append(f"project config retains retired key: {retired_key}")
    commands = project.get("commands")
    if commands != EXPECTED_COMMANDS:
        errors.append("project commands drifted from the Happy-owned command graph")
    if not isinstance(commands, dict):
        commands = {}
    command_text = json.dumps(commands, sort_keys=True)
    for retired_token in ("workflow-state.py", "workflow-review.py", "workflow-candidate.py", "--applicable"):
        if retired_token in command_text:
            errors.append(f"project command graph retains retired token: {retired_token}")

    if project.get("tracker") != EXPECTED_TRACKER:
        errors.append("project tracker configuration drifted")
    if project.get("protectedPaths") != EXPECTED_PROTECTED_PATHS:
        errors.append("project protectedPaths drifted")
    if project.get("generatedPaths") != EXPECTED_GENERATED_PATHS:
        errors.append("project generatedPaths drifted")
    if project.get("riskTriggers") != EXPECTED_RISK_TRIGGERS:
        errors.append("project riskTriggers drifted")

    require_markers(root, "AGENTS.md", (
        "Historical `docs/workspace/` records", "code-review",
        ".ai/template-adoption.json", "CLAUDE.md", "Personal Branch Model",
    ), errors)
    require_markers(root, "CONTEXT.md", (
        "Task/Issue", "historical `docs/workspace/`", "frozen and unmanaged",
    ), errors)
    require_markers(root, "docs/workflow.md", (
        "`grill-with-docs`", "`publish-tasks`", "`diagnosing-bugs`",
        "code-review", "The source publishes immutable template versions",
    ), errors)
    require_markers(root, ".agents/skills/code-review/SKILL.md", (
        'model: "gpt-5.6-sol"', 'reasoning_effort: "medium"',
        "Standards", "Spec",
    ), errors)
    require_markers(root, "scripts/workflow-ci.py", (
        "validate-happy-workflow.py", "PASSIVE_HISTORY_PREFIX",
    ), errors)

    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("Happy workflow adoption invalid:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Happy workflow adoption valid: {RELEASE}@{COMMIT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
