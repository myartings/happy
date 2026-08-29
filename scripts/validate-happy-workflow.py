#!/usr/bin/env python3
"""Validate Happy's version-pinned selective workflow adoption."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path, PurePosixPath
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = Path(".ai/template-adoption.json")
PROJECT = Path(".ai/project.json")

SOURCE_REPOSITORY = "https://github.com/myartings/ai-coding-template.git"
SOURCE_RELEASE = "workflow-2026.08.2"
SOURCE_COMMIT = "8d07a74931f8dcf6a668c2a6a4dcaf9c490a2842"

EXPECTED_INCLUDES = {
    ".gitattributes",
    ".agents/skills/batch-plan",
    ".agents/skills/check",
    ".agents/skills/continue",
    ".agents/skills/create-prd",
    ".agents/skills/decision-map",
    ".agents/skills/diagnose",
    ".agents/skills/finish-work",
    ".agents/skills/generate-spec",
    ".agents/skills/generate-tasks",
    ".agents/skills/grilling",
    ".agents/skills/handoff",
    ".agents/skills/implement",
    ".agents/skills/review",
    ".agents/skills/risk-gate",
    ".agents/skills/scoping",
    ".agents/skills/start",
    ".agents/skills/tdd",
    ".agents/skills/tracker-workflow",
    ".agents/skills/update-spec",
    ".agents/skills/workflow-audit",
    ".codex/README.md",
    ".codex/REASONING.md",
    ".codex/agents",
    ".codex/hooks.json",
    ".codex/hooks",
    ".github/ISSUE_TEMPLATE/agent-work-item.md",
    "docs/adr/0003-mandatory-formal-project-lifecycle.md",
    "docs/adr/0004-commit-bound-workflow-enforcement.md",
    "docs/adr/0005-solo-developer-evidence-scaling.md",
    "docs/adr/0006-explicit-trellis-task-boundary.md",
    "docs/workflow.md",
    "docs/workflow/capability-owners.json",
    "docs/workflow/discovered-work-scope-containment.md",
    "docs/workflow/execution-isolation.md",
    "docs/workflow/host-environment.md",
    "docs/workflow/intensity-matrix.md",
    "docs/workflow/source-mapping.md",
    "docs/workflow/ticket-task-contract.md",
    "docs/workflow/tracker-workflow.md",
    "docs/specs/template.md",
    "docs/tasks/template.md",
    "docs/workspace/template",
    "scripts/workflow-audit.py",
    "scripts/workflow-check.py",
    "scripts/workflow-candidate.py",
    "scripts/workflow-issue-route.py",
    "scripts/workflow-state.py",
    "scripts/workflow-ci.py",
    "scripts/workflow-parallel-report.py",
    "scripts/workflow-review.py",
    "scripts/workflow-run.py",
}

REQUIRED_PRESERVES = {
    "AGENTS.md",
    "CONTEXT.md",
    ".ai/project.json",
    ".ai/template-adoption.json",
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
    "docs/workspace/ACTIVE.md",
    "docs/workspace/archive.md",
    "scripts/happy-workflow-state-upgrade.py",
    "scripts/test-happy-workflow-state-upgrade.py",
    "scripts/validate-happy-workflow.py",
    "scripts/test-validate-happy-workflow.py",
}

REQUIRED_CHECKS = {
    "{python} scripts/test-happy-workflow-state-upgrade.py",
    "{python} scripts/validate-happy-workflow.py",
    "{python} scripts/test-validate-happy-workflow.py",
    "{python} scripts/workflow-audit.py --all --strict",
}

EXPECTED_RETIREMENTS = {
    "scripts/test-workflow.py":
        "sha256:b425a4aaee25dae46161792f037d8cec9c10b0d0e576c3ec726202fa06ff4e3d",
    "scripts/test-workflow-ci.py":
        "sha256:b57e01a0516a65725cd3b95f8b0ec195e91d41070d165b54bc1881415b69e177",
    "scripts/test-workflow-core.py":
        "sha256:4500b5d074a6fd5fd49cebb94c9541e13e1c2068d4f3ecb9b8be5e67116e8c3b",
}

FORBIDDEN_OR_BROAD_INCLUDES = {
    "AGENTS.md",
    "CLAUDE.md",
    ".agents/skills",
    ".claude",
    ".claude/skills",
    ".codex",
    ".ai/template-sync.json",
    ".github/workflows",
    "devtools",
    "docs/workflow",
    "packages",
    "scripts/create-project.py",
    "scripts/smoke-test.py",
    "scripts/sync-template.py",
    "scripts/test-template-sync.py",
    "scripts/validate-template.py",
}

EXPECTED_PRODUCT_COMMANDS = {
    "setup": ["pnpm install --frozen-lockfile"],
    "typecheck": [
        "pnpm --filter happy-app typecheck",
        "pnpm --filter happy-server typecheck",
    ],
    "test": [
        "pnpm --filter happy-app exec vitest run",
        "pnpm --filter happy-server test",
    ],
}

EXPECTED_TRACKER = {
    "provider": "github",
    "target": "myartings/happy",
    "categories": {
        "bug": "bug",
        "enhancement": "enhancement",
    },
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

RETIRED_CHECK_SELECTION_PATHS = set(EXPECTED_RETIREMENTS)


def read_object(path: Path, label: str, errors: list[str]) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"invalid {label}: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"{label} must be an object")
        return {}
    return value


def string_list(value: object, label: str, errors: list[str]) -> list[str]:
    if not isinstance(value, list) or any(
        not isinstance(item, str) or not item.strip() for item in value
    ):
        errors.append(f"{label} must be a list of non-empty strings")
        return []
    return value


def safe_relative(value: str) -> bool:
    path = PurePosixPath(value)
    return bool(
        value
        and "\\" not in value
        and not path.is_absolute()
        and path != PurePosixPath(".")
        and ".." not in path.parts
    )


def adoption_errors(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    adoption = read_object(root / MANIFEST, str(MANIFEST), errors)
    if not adoption:
        return errors

    if adoption.get("schemaVersion") != 2:
        errors.append("template adoption schemaVersion must be 2")
    if adoption.get("policy") != "selective-workflow-core":
        errors.append("template adoption policy must be selective-workflow-core")
    source = (
        adoption.get("sourceRepository"),
        adoption.get("sourceRelease"),
        adoption.get("sourceCommit"),
    )
    if source != (SOURCE_REPOSITORY, SOURCE_RELEASE, SOURCE_COMMIT):
        errors.append(
            "template adoption must record the accepted immutable source "
            f"{SOURCE_RELEASE}@{SOURCE_COMMIT}"
        )
    if not re.fullmatch(r"[0-9a-f]{40}", str(adoption.get("sourceCommit", ""))):
        errors.append("template adoption sourceCommit must be a full Git commit")

    includes = string_list(adoption.get("include"), "template adoption include", errors)
    if len(includes) != len(set(includes)):
        errors.append("template adoption include paths must be unique")
    included = set(includes)
    forbidden = sorted(FORBIDDEN_OR_BROAD_INCLUDES & included)
    if forbidden:
        errors.append("forbidden or broad include: " + ", ".join(forbidden))
    if included != EXPECTED_INCLUDES:
        missing = sorted(EXPECTED_INCLUDES - included)
        extra = sorted(included - EXPECTED_INCLUDES)
        if missing:
            errors.append("template adoption omits distributed paths: " + ", ".join(missing))
        if extra:
            errors.append("template adoption has unaccepted paths: " + ", ".join(extra))

    preserves = string_list(
        adoption.get("preserve"), "template adoption preserve", errors
    )
    if len(preserves) != len(set(preserves)):
        errors.append("template adoption preserve paths must be unique")
    missing_preserves = sorted(REQUIRED_PRESERVES - set(preserves))
    if missing_preserves:
        errors.append("template adoption omits Happy preserves: " + ", ".join(missing_preserves))

    for label, values in (("include", includes), ("preserve", preserves)):
        unsafe = sorted(value for value in values if not safe_relative(value))
        if unsafe:
            errors.append(f"template adoption {label} has unsafe paths: " + ", ".join(unsafe))

    retirements = adoption.get("retiredPaths")
    found_retirements: dict[str, set[str]] = {}
    if not isinstance(retirements, list):
        errors.append("template adoption retiredPaths must be a list")
        retirements = []
    for entry in retirements:
        if not isinstance(entry, dict):
            errors.append("template adoption retirement must be an object")
            continue
        path = entry.get("path")
        reason = entry.get("reason")
        fingerprints = entry.get("ownedFingerprints")
        if not isinstance(path, str) or not safe_relative(path):
            errors.append("template adoption retirement path must be repository-relative")
            continue
        if not isinstance(reason, str) or not reason.strip():
            errors.append(f"template adoption retirement reason missing: {path}")
        if not isinstance(fingerprints, list) or any(
            not isinstance(value, str)
            or re.fullmatch(r"sha256:[0-9a-f]{64}", value) is None
            for value in fingerprints
        ):
            errors.append(f"template adoption retirement fingerprints invalid: {path}")
            continue
        found_retirements[path] = set(fingerprints)
    if set(found_retirements) != set(EXPECTED_RETIREMENTS):
        errors.append("template adoption retirements do not match the accepted legacy tests")
    for path, fingerprint in EXPECTED_RETIREMENTS.items():
        if path in found_retirements and fingerprint not in found_retirements[path]:
            errors.append(f"template adoption retirement fingerprint drift: {path}")

    required_checks = set(
        string_list(
            adoption.get("requiredProjectChecks"),
            "template adoption requiredProjectChecks",
            errors,
        )
    )
    if required_checks != REQUIRED_CHECKS:
        errors.append("template adoption requiredProjectChecks drifted")
    return errors


def project_config_errors(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    project = read_object(root / PROJECT, str(PROJECT), errors)
    if not project:
        return errors
    if project.get("schemaVersion") != 1:
        errors.append(".ai/project.json schemaVersion must be 1")
    if project.get("name") != "Happy":
        errors.append("project name must remain Happy")
    if project.get("profile") != "typescript-monorepo":
        errors.append("project profile must remain typescript-monorepo")
    if project.get("maturity") != "production":
        errors.append("project maturity must remain production")

    commands = project.get("commands")
    if not isinstance(commands, dict):
        errors.append(".ai/project.json commands must be an object")
        commands = {}
    for group, expected in EXPECTED_PRODUCT_COMMANDS.items():
        if commands.get(group) != expected:
            errors.append(f"Happy product command group drifted: {group}")
    normalized_commands: dict[str, list[str]] = {}
    for group, values in commands.items():
        command_list = string_list(values, f"project command group {group}", errors)
        normalized_commands[group] = command_list
        for command in command_list:
            if "scripts/" in command and ".py" in command and not command.startswith(
                "{python} "
            ):
                errors.append(f"repository Python command must use {{python}}: {command}")
    for group in ("check", "workflow-targeted"):
        missing = sorted(REQUIRED_CHECKS - set(normalized_commands.get(group, [])))
        if missing:
            errors.append(f"project {group} omits required workflow checks: " + ", ".join(missing))

    profiles = project.get("checkProfiles")
    if not isinstance(profiles, dict):
        errors.append(".ai/project.json checkProfiles must be an object")
        profiles = {}
    for name in ("docs", "workflow", "full"):
        values = profiles.get(name)
        if not isinstance(values, list) or not values:
            errors.append(f"project checkProfiles missing {name}")
    full_profile = profiles.get("full")
    if not isinstance(full_profile, list) or "check" not in full_profile:
        errors.append("project full check profile must include check")
    for name, groups in profiles.items():
        if not isinstance(groups, list):
            continue
        unknown = [group for group in groups if group not in commands]
        if unknown:
            errors.append(f"project check profile {name} has unknown groups: " + ", ".join(unknown))

    selection = project.get("checkSelection")
    if not isinstance(selection, dict):
        errors.append(".ai/project.json checkSelection must be an object")
    else:
        if selection.get("fallbackProfile") != "full":
            errors.append("project checkSelection fallbackProfile must be full")
        rules = selection.get("rules")
        if not isinstance(rules, list) or not rules:
            errors.append("project checkSelection rules must be non-empty")
        else:
            names = {rule.get("name") for rule in rules if isinstance(rule, dict)}
            if names != {"ordinary-documentation", "workflow-infrastructure"}:
                errors.append("project checkSelection rules drifted")
            workflow_rules = [
                rule
                for rule in rules
                if isinstance(rule, dict)
                and rule.get("name") == "workflow-infrastructure"
            ]
            if len(workflow_rules) == 1:
                include = workflow_rules[0].get("include")
                if not isinstance(include, list) or not RETIRED_CHECK_SELECTION_PATHS.issubset(
                    set(include)
                ):
                    errors.append(
                        "workflow check selection omits accepted retired test paths"
                    )

    review = project.get("reviewProfiles")
    if not isinstance(review, dict):
        errors.append(".ai/project.json reviewProfiles must be an object")
    else:
        for name in ("low-risk", "feature", "high-risk"):
            value = review.get(name)
            if not isinstance(value, dict):
                errors.append(f"project reviewProfiles missing {name}")
                continue
            if value.get("modelTier") not in {"standard", "capable"}:
                errors.append(f"project review profile tier invalid: {name}")
            if type(value.get("maxWords")) is not int or value["maxWords"] <= 0:
                errors.append(f"project review profile maxWords invalid: {name}")

    if project.get("tracker") != EXPECTED_TRACKER:
        errors.append("Happy tracker configuration drifted")
    if project.get("protectedPaths") != EXPECTED_PROTECTED_PATHS:
        errors.append("Happy protected paths drifted")
    if project.get("generatedPaths") != EXPECTED_GENERATED_PATHS:
        errors.append("Happy generated paths drifted")
    if project.get("riskTriggers") != EXPECTED_RISK_TRIGGERS:
        errors.append("Happy risk triggers drifted")
    if "modelRouting" in project:
        errors.append("project retains retired modelRouting")
    return errors


def authority_errors(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    for relative in sorted(EXPECTED_INCLUDES):
        if not (root / relative).exists():
            errors.append(f"missing adopted workflow surface: {relative}")
    for relative in (
        MANIFEST,
        PROJECT,
        Path("AGENTS.md"),
        Path("CONTEXT.md"),
        Path("docs/PRD.md"),
        Path("docs/workspace/ACTIVE.md"),
        Path("docs/workspace/archive.md"),
        Path("scripts/happy-workflow-state-upgrade.py"),
        Path("scripts/test-happy-workflow-state-upgrade.py"),
        Path("scripts/validate-happy-workflow.py"),
        Path("scripts/test-validate-happy-workflow.py"),
    ):
        if not (root / relative).is_file():
            errors.append(f"missing Happy workflow authority: {relative.as_posix()}")
    for relative in EXPECTED_RETIREMENTS:
        if (root / relative).exists():
            errors.append(f"retired legacy workflow test remains: {relative}")
    for relative in (
        ".ai/template-sync.json",
        "scripts/create-project.py",
        "scripts/smoke-test.py",
        "scripts/sync-template.py",
        "scripts/test-template-sync.py",
        "scripts/validate-template.py",
    ):
        if (root / relative).exists():
            errors.append(f"forbidden template-maintenance surface present: {relative}")

    try:
        instructions = (root / "AGENTS.md").read_text(encoding="utf-8")
    except OSError as exc:
        errors.append(f"cannot read AGENTS.md: {exc}")
    else:
        for phrase in (
            "Keep the product tree on `main` equivalent to `upstream/main`",
            "Personal `main` may differ from `upstream/main` only in `devtools/`",
            "Do not run the upstream template's full synchronization manifest",
            "No-task work needs no lifecycle receipt",
            "Historical Workspace and archive files are passive",
            "Root sustained implementation must stay in the current human-facing session root",
        ):
            if phrase not in instructions:
                errors.append(f"missing Happy workflow instruction: {phrase}")

    try:
        codex_config = (root / ".codex" / "config.toml").read_text(encoding="utf-8")
    except OSError as exc:
        errors.append(f"cannot read .codex/config.toml: {exc}")
    else:
        for phrase in (
            'model = "gpt-5.6-sol"',
            'model_reasoning_effort = "medium"',
            'default_subagent_model = "gpt-5.6-sol"',
            "[mcp_servers.paper]",
            'url = "http://127.0.0.1:29979/mcp"',
        ):
            if phrase not in codex_config:
                errors.append(f"missing merged Codex configuration: {phrase}")
    return errors


def validation_errors(root: Path = ROOT) -> list[str]:
    return adoption_errors(root) + project_config_errors(root) + authority_errors(root)


def main() -> int:
    errors = validation_errors()
    if errors:
        print("Happy workflow adoption invalid:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(
        "Happy selective workflow adoption valid: "
        f"{SOURCE_RELEASE}@{SOURCE_COMMIT[:12]}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
