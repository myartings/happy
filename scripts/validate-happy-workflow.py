#!/usr/bin/env python3
"""Validate Happy's selective ai-coding-template workflow adoption."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = (
    ".ai/project.json",
    ".ai/template-adoption.json",
    "CONTEXT.md",
    "docs/tasks/template.md",
    "docs/workflow.md",
    "docs/workspace/archive.md",
    "docs/workspace/template/workflow.json",
    "scripts/workflow-state.py",
    "scripts/test-workflow-core.py",
    "scripts/workflow-audit.py",
    "scripts/workflow-check.py",
    "scripts/workflow-ci.py",
    ".agents/skills/start/SKILL.md",
    ".agents/skills/scoping/SKILL.md",
    ".agents/skills/check/SKILL.md",
    ".agents/skills/review/SKILL.md",
    ".agents/skills/finish-work/SKILL.md",
    ".agents/skills/tracker-workflow/SKILL.md",
)

FORBIDDEN_ADOPTION_PATHS = {
    "AGENTS.md",
    "CLAUDE.md",
    ".ai/template-sync.json",
    ".github/workflows/workflow-template-check.yml",
    "scripts/create-project.py",
    "scripts/smoke-test.py",
    "scripts/sync-template.py",
    "scripts/test-template-sync.py",
    "scripts/validate-template.py",
}


def main() -> int:
    errors: list[str] = []
    for relative in REQUIRED:
        if not (ROOT / relative).is_file():
            errors.append(f"missing workflow core file: {relative}")

    try:
        project = json.loads(
            (ROOT / ".ai" / "project.json").read_text(encoding="utf-8")
        )
        if project.get("name") != "Happy":
            errors.append("project name must remain Happy")
        if project.get("tracker", {}).get("target") != "myartings/happy":
            errors.append("tracker target must be myartings/happy")
        check_commands = project.get("commands", {}).get("check", [])
        if "python3 scripts/validate-happy-workflow.py" not in check_commands:
            errors.append("project checks omit selective-adoption validation")
        if "python3 scripts/test-workflow-core.py" not in check_commands:
            errors.append("project checks omit portable workflow-core tests")
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"invalid .ai/project.json: {exc}")

    try:
        adoption = json.loads(
            (ROOT / ".ai" / "template-adoption.json").read_text(encoding="utf-8")
        )
        included = set(adoption.get("include", []))
        forbidden = sorted(FORBIDDEN_ADOPTION_PATHS & included)
        if forbidden:
            errors.append("selective adoption includes Happy-owned paths: " + ", ".join(forbidden))
        if adoption.get("policy") != "selective-workflow-core":
            errors.append("template adoption policy must be selective-workflow-core")
        if "scripts/workflow-ci.py" not in set(adoption.get("preserve", [])):
            errors.append("Happy's Windows-portable workflow-ci adaptation must be preserved")
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"invalid .ai/template-adoption.json: {exc}")

    try:
        instructions = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
        for phrase in (
            "Keep `main` clean and tracking `upstream/main`.",
            "Do not run the upstream template's full synchronization manifest",
        ):
            if phrase not in instructions:
                errors.append(f"missing Happy workflow instruction: {phrase}")
    except OSError as exc:
        errors.append(f"cannot read AGENTS.md: {exc}")

    if errors:
        print("Happy workflow adoption invalid:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Happy selective workflow adoption valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
